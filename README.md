# Todo List App

A simple todo list web application built with Node.js, Express, and EJS. This project comes in two versions: a contained version that stores data in memory using a JSON file, and a PostgreSQL version that uses a PostgreSQL database for persistence.

## Features

- Add new todo items
- Edit existing items
- Delete items
- Prevent duplicate items
- Responsive web interface using EJS templates

## Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)
- For PostgreSQL version: PostgreSQL database server

## Installation

1. Clone or download this repository.
2. Navigate to the project directory.
3. Install dependencies:

   ```
   npm install
   ```

## Configuration

### For PostgreSQL Version

1. Ensure PostgreSQL is installed and running on your system.
2. Create a database for the application.
3. Create a `.env` file in the root directory with the following variables:

   ```
   DB_USER=your_db_username
   DATABASE=your_database_name
   DB_PASSWORD=your_db_password
   ```

4. Create the `items` table in your database:

   ```sql
   CREATE TABLE items (
     id SERIAL PRIMARY KEY,
     title VARCHAR(255) NOT NULL
   );
   ```

5. Import initial data from `data/items.csv`:

   You can use PostgreSQL's `COPY` command or a tool like pgAdmin. For example, using psql:

   ```
   \COPY items(title) FROM 'data/items.csv' WITH CSV HEADER;
   ```

   Note: Adjust the path to `items.csv` as needed.

## Running the Application

### Contained Version (In-Memory Storage)

This version uses the data from `data/items.json` and stores changes in memory only (not persisted across restarts).

Run the contained version:

```
npm run dev-contained
```

The application will start on `http://localhost:3000`.

### PostgreSQL Version (Database Storage)

This version uses a PostgreSQL database for persistent storage.

Run the PostgreSQL version:

```
npm run dev
```

The application will start on `http://localhost:3000`.

## Usage

- Open your browser and navigate to `http://localhost:3000`.
- View the list of todo items.
- Add new items using the input field.
- Edit items by clicking the edit button next to an item.
- Delete items by clicking the delete button.

## Project Structure

- `index-contained.js`: Entry point for the contained version.
- `index-postgres.js`: Entry point for the PostgreSQL version.
- `controller/`: Contains controller logic for both versions.
- `routes/`: Route handlers for both versions.
- `views/`: EJS templates for the web interface.
- `public/`: Static assets (CSS, icons).
- `data/`: Initial data files (items.json and items.csv).
- `db/`: Database connection setup for PostgreSQL.

## Dependencies

- `express`: Web framework
- `ejs`: Templating engine
- `pg`: PostgreSQL client
- `dotenv`: Environment variable management

## License

ISC