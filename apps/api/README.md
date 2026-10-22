# API structure

Organize modules by feature, not by audience. `src/app.module.ts` registers each
feature module once; `src/main.ts` handles startup and shutdown.

```text
src/modules/
  banners/
    banners.module.ts
    banners.service.ts
    banners-public.controller.ts
    banners-admin.controller.ts
  flash-deals/
  tours/
  locations/
  vouchers/
  users/
  posts/
  dashboard/
```

- Keep public and admin controllers separate, with explicit public/admin names.
- Preserve existing URL decorators when moving files. Module names do not define
  API URLs.
- Apply `AdminAuthGuard` to the admin controller class, so every method is protected.
  Public controllers must not inherit that guard.
- Share a service when behavior belongs to the same feature. Keep distinct public
  and admin queries, filters and return shapes. Tours and locations retain separate
  public/admin services because their business logic differs.
- Register each service in its owning module. Other modules should import that
  module instead of registering the service again.
- Reuse `CloudinaryModule` for upload configuration and buffer uploads. Controllers
  retain their folders, file checks and API error responses.
- Define data types, request/response types, form models and component props in
  `packages/shared/src`, grouped by feature. Import them directly from `shared`.
  Before adding a type, check whether an equivalent definition already exists.
  Do not create module-local `.types.ts` files or forwarding type-only files.
- The empty `PrismaService` interface in `prisma.service.ts` is a class augmentation
  that gives the proxy provider the Prisma client API. Keep it beside the class
  so Nest's runtime dependency injection metadata continues to reference that class.

## Validation

From the repository root:

```sh
npm run typecheck
npm run build
```

The API build clears its generated `dist/` directory before compiling, so removed
or moved sources cannot leave obsolete JavaScript/declaration files behind.

## Human support chat

`ChatModule` owns the authenticated `/chat` HTTP API and `/chat` Socket.IO
namespace. Both customer and staff screens reuse the same message timeline,
composer, connection hook and request helper. Contracts live in shared `chat.ts`;
staff workspace props live in shared `admin/chat.ts`.

- Customers can read and write only their own conversations. Every HTTP request,
  socket event and broadcast recipient is checked against current account/role
  data. Staff can inspect the queue; only the assigned staff member can reply.
- Claim and transfer serialize on the conversation row. Statuses are `WAITING`,
  `IN_PROGRESS`, `CLOSED`. A new customer message reopens the existing conversation;
  resolving never deletes history. Unavailable assignees return to the queue.
- `client_message_id` makes retries idempotent. Messages use cursor pagination
  (`before` / `after`), including catch-up after reconnect. Read receipts apply
  only through the last message visible at the bottom of an active screen.
- Context cards derive tour/booking details on the server; booking ownership is
  checked against the customer. Image uploads accept JPEG/PNG/GIF/WebP up to 5 MB.
- Configure the existing `JWT_SECRET`, `CORS_ORIGINS` and `CLOUDINARY_*` settings.
  Apply `packages/database/prisma/migrations/20261021_human_support_chat/migration.sql`
  to an existing database before deploying this API, then regenerate Prisma.
  The migration adds fields/indexes and normalizes legacy `OPEN` conversations
  to `WAITING`, preserving messages. New databases use the Prisma schema.
