# Todo List App

A todo list web application built with Node.js, Express, EJS, and PostgreSQL. The project has two modes:

- Contained mode: uses JSON seed data from `data/` and keeps changes in memory.
- PostgreSQL mode: stores users and todo items in a local PostgreSQL database.

## Features

- Choose or add users
- Add todo items for the selected user
- Group items by daily, weekly, and monthly date ranges
- Edit and delete todo items
- Delete users and their items
- Prevent duplicate items
- Session-backed user/list selection in contained mode

## Prerequisites

- Node.js and npm
- PostgreSQL, only if running the database version

## Installation

Install dependencies from the project root:

```bash
npm install
```

Copy `.env-example` to `.env` and fill in your local values:

```env
DATABASE="YOUR_DATABASE_NAME"
DB_USER="YOUR_DATABASE_USER"
DB_PASSWORD="YOUR_DATABASE_PASSWORD"
SV_SECRET="YOUR_SESSION_SECRET"
```

`SV_SECRET` is used by `express-session` in the contained version.

## Running

Contained/in-memory version:

```bash
npm run dev-contained
```

PostgreSQL version:

```bash
npm run dev
```

Both versions start on `http://localhost:3000`.

## PostgreSQL Setup

Create the database named in your `.env`, then create the tables:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);
```

Import the seed data from the `data/` directory. Import users first because items reference users by `user_id`.

From `psql`, run:

```sql
\COPY users(name) FROM 'data/users.csv' WITH CSV HEADER;
\COPY items(title, created_at, user_id) FROM 'data/items.csv' WITH CSV HEADER;
```

If you run `psql` from a different directory, use absolute paths to the CSV files instead.

The contained version uses:

- `data/users.json`
- `data/items.json`

The database seed files are:

- `data/users.csv`
- `data/items.csv`

## Project Structure

- `index-contained.js`: Entry point for the contained version
- `index-postgres.js`: Entry point for the PostgreSQL version
- `controller/`: Request handlers for both versions
- `routes/`: Express route definitions
- `views/`: EJS templates
- `public/`: Static CSS and icons
- `data/`: JSON and CSV seed data
- `db/`: PostgreSQL connection helper

## Notes

- Contained mode stores new users/items in memory only. Restarting the server resets back to the JSON seed data.
- PostgreSQL mode persists data in the database.
- The default `express-session` memory store is suitable for local development, not production.

## License

ISC
