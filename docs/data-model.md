# QuickNotes Data Model

## 1. Overview

QuickNotes uses a relational database to organise users, notes, tags, and the relationships between notes and tags. The design uses SQL and foreign keys to maintain data integrity.

## 2. Tables and Columns

### Users

| Column        | Type         | Constraints      |
| ------------- | ------------ | ---------------- |
| id            | INTEGER      | Primary key      |
| name          | VARCHAR(100) | NOT NULL         |
| email         | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL         |
| created_at    | TIMESTAMP    | NOT NULL         |

### Notes

| Column     | Type         | Constraints                                 |
| ---------- | ------------ | ------------------------------------------- |
| id         | INTEGER      | Primary key                                 |
| user_id    | INTEGER      | Foreign key referencing users(id), NOT NULL |
| title      | VARCHAR(100) | NOT NULL                                    |
| body       | TEXT         | Nullable                                    |
| created_at | TIMESTAMP    | NOT NULL                                    |
| updated_at | TIMESTAMP    | NOT NULL                                    |

### Tags

| Column  | Type        | Constraints                                 |
| ------- | ----------- | ------------------------------------------- |
| id      | INTEGER     | Primary key                                 |
| user_id | INTEGER     | Foreign key referencing users(id), NOT NULL |
| name    | VARCHAR(50) | NOT NULL                                    |

### Note_Tags

| Column  | Type    | Constraints                                              |
| ------- | ------- | -------------------------------------------------------- |
| note_id | INTEGER | Foreign key referencing notes(id), Primary key component |
| tag_id  | INTEGER | Foreign key referencing tags(id), Primary key component  |

The combination of `note_id` and `tag_id` forms a composite primary key, preventing the same tag from being linked to the same note more than once.

## 3. Relationships

- **Users to Notes:** One-to-many. One user can create many notes, but each note belongs to one user.
- **Users to Tags:** One-to-many. One user can create many tags.
- **Notes to Tags:** Many-to-many. A note can have multiple tags, and a tag can be applied to multiple notes. The `note_tags` table implements this relationship.

## 4. SQL Table Creation

The following statements use SQLite-compatible SQL.

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(100) NOT NULL,
    body TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE tags (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (user_id, name)
);

CREATE TABLE note_tags (
    note_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (note_id, tag_id),
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

## 5. Example SQL Queries

### Query 1: Retrieve all notes belonging to a user

```sql
SELECT id, title, body, created_at
FROM notes
WHERE user_id = 1
ORDER BY updated_at DESC;
```

### Query 2: Retrieve one note by its ID

```sql
SELECT id, title, body, created_at, updated_at
FROM notes
WHERE id = 10 AND user_id = 1;
```

Including `user_id` helps ensure that users only access their own notes.

### Query 3: Retrieve notes and their tags using JOIN

```sql
SELECT notes.title, tags.name AS tag
FROM notes
JOIN note_tags ON notes.id = note_tags.note_id
JOIN tags ON note_tags.tag_id = tags.id
WHERE notes.user_id = 1;
```

### Query 4: Count notes belonging to each user

```sql
SELECT users.name, COUNT(notes.id) AS note_count
FROM users
LEFT JOIN notes ON users.id = notes.user_id
GROUP BY users.id, users.name;
```

## 6. Indexing

```sql
CREATE INDEX idx_notes_user_updated
ON notes(user_id, updated_at DESC);
```

This index helps the application retrieve a user's notes in recently updated order without scanning every note. It supports a common query pattern and can improve performance as the number of notes grows.

## 7. SQL vs NoSQL

A relational SQL database is a good fit for QuickNotes because users, notes, and tags have clear relationships. Primary keys, foreign keys, constraints, and JOIN queries help maintain consistency and retrieve related information.

A NoSQL database can offer flexible document structures and can be useful when data formats vary significantly or when a system needs a different scaling model. However, the relationships between users, notes, and tags make a relational design a straightforward starting point for QuickNotes.
