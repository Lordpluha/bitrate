---
sidebar_position: 2
---

# API Reference

Complete API documentation for the Spotify Clone backend is available via **Compodoc**.

## 📚 Backend API Documentation

The backend API is built with **NestJS** and documented using Compodoc, which provides:

- 🏗️ **Modules** - Application module structure
- 🎮 **Controllers** - REST API endpoints
- ⚙️ **Services** - Business logic and data access
- 📦 **DTOs** - Data transfer objects
- 🗃️ **Entities** - Database models
- 🔒 **Guards** - Authentication and authorization

## 🚀 View API Documentation

### Development

Run the API documentation server locally:

```bash
cd apps/api
pnpm doc:gen
```

The documentation will be available at `http://localhost:8080`

## 📖 Key Sections

When documentation is generated, you can navigate through:

- **Modules** - Module dependencies and structure
- **Controllers** - REST API endpoints
- **Services** - Business logic
- **Routes** - API route overview

## 🔧 Updating Documentation

The API documentation is automatically generated from the source code:

```bash
# Generate documentation
pnpm --filter @spotify/api doc:gen
```

:::tip
The API documentation includes JSDoc comments from the source code. Keep your code comments up-to-date!
:::

## 📝 REST API Endpoints

For interactive API testing, see the **Swagger UI** available at:
- Development: `http://localhost:3000/api`
- Production: `/api`
