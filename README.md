# phucuong-server

Base NestJS backend structure using TypeScript, TypeORM, PostgreSQL, and JWT.

## Structure

- `src/app`: root application wiring
- `src/modules/auth`: authentication module
- `src/modules/users`: user module
- `src/database`: TypeORM data-source and persistence setup
- `src/common`: shared guards, filters, decorators, and utils

## Next steps

1. Copy `.env.example` to `.env`.
2. Install dependencies.
3. Run `npm run start:dev`.
