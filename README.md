# Todo API

RESTful API for a Todo application built with **Express.js**, **TypeScript**, and **MongoDB**.

## Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: Passport.js — Local, JWT, Google OAuth2
- **Validation**: Zod + OpenAPI auto-generation
- **Email**: React Email + Resend
- **Testing**: Jest + Supertest

## Getting Started

```bash
# Install dependencies
npm install

# Copy and fill environment variables
cp .env.example .env

# Start dev server
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `RESEND_API_KEY` | Resend email service key |
| `CORS_ORIGIN` | Allowed CORS origin |

## API Endpoints

| Prefix | Description |
|---|---|
| `/api/auth/*` | Register, login, OAuth, password reset |
| `/api/tasks/*` | Task CRUD with filtering & ordering |
| `/api/tags/*` | Tag CRUD with auto color assignment |
| `/api/operations/*` | Bulk task operations |
| `/api/jobs/*` | Scheduled jobs (daily reminders) |
| `/api-docs` | Swagger UI documentation |

## Scripts

```bash
npm run dev           # Dev server with hot reload
npm run build         # TypeScript build
npm start             # Production server
npm test              # Run tests
npm run test:coverage # Tests with coverage report
npm run email         # Email template dev server
```

## Project Structure

```
src/
├── controllers/   # HTTP handlers
├── services/      # Business logic
├── models/        # Mongoose schemas
├── routes/        # Express routes
├── middlewares/   # Auth, validation, rate limiting
├── schemas/       # Zod schemas
└── openapi/       # OpenAPI doc generation
```

## Docker

```bash
docker build -t todo-api --target development .
docker run --name todo-api --network host -v .:/app -v /app/node_modules todo-api
```

## Author

[HRulier](https://github.com/HRulier)
