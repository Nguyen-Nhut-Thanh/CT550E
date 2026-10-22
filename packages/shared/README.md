# Shared types

All application data types, API contracts, forms and component props belong in
`src/`. API and web code import named types directly from `shared`.

- Reuse an existing equivalent type before introducing a new definition.
- Keep domain types in feature files such as `tour.ts`, `booking.ts` and `chat.ts`.
- Keep admin-specific view models and props under `src/admin/`, grouped by feature.
- Keep transport options and list envelopes in `http.ts`, and upload contracts in
  `upload.ts`; generic UI components should not own feature payloads.
- Derive narrower variants from their common contract with `Pick`, `Omit` or
  intersections, while preserving their required fields and nullability.
- Use descriptive names when different types would otherwise share names such as
  `Props`, `Tour` or `ScheduleDetailResponse`. Do not merge different shapes just
  because their names match.
- Export public definitions from `src/index.ts` and use type-only imports between
  type files. This package must not import source code from `apps/`.
- DTO classes with validation decorators remain in their API `dto/` folders because
  they execute at runtime. The Prisma provider's empty declaration-merging interface
  stays with its class; it is not a separate data contract.

Build this package before checking API/web imports:

```sh
npm run build --workspace=shared
npm run typecheck
```
