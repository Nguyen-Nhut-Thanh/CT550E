# database

Database access package shared by the applications.

- PostgreSQL is configured through Prisma in `prisma/schema.prisma`.
- MongoDB is configured through `MONGODB_URI` and exported from `src/mongodb.ts`.
- Domain models are intentionally not defined yet; add the existing schema/models when they are available.
