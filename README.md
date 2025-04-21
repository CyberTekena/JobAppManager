# JobTrackerPro

## Description
JobTrackerPro is a job tracking application featuring a React frontend and an Express + TypeScript backend. It uses PostgreSQL as the database with Drizzle ORM for database management.

## Prerequisites
- Node.js and npm installed on your system
- A PostgreSQL database provisioned and accessible
- Set the `DATABASE_URL` environment variable to your PostgreSQL connection string, e.g.:
  ```
  export DATABASE_URL="postgresql://user:password@host:port/database"
  ```

## Installation
Install the project dependencies by running:
```
npm install
```

## Running in Development
To start the development server with hot reload for both backend and frontend, run:
```
npm run dev
```
This will start the Express server and Vite development server on port 3000.

## Building for Production
To build the frontend and bundle the backend for production, run:
```
npm run build
```

## Running in Production
After building, start the production server with:
```
npm start
```
This will serve the built frontend and backend on port 3000.

## Database Migrations
To apply database migrations using Drizzle ORM, run:
```
npm run db:push
```

## Project Structure
- `client/`: React frontend source code
- `server/`: Express backend source code
- `shared/`: Shared schema definitions and types
- `drizzle.config.ts`: Database configuration file

## Notes
- Ensure the `DATABASE_URL` environment variable is set before running the application.
- The server serves both the API and the frontend on port 3000.
