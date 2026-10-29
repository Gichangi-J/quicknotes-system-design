# QuickNotes API Design

## 1. Overview

The QuickNotes API allows authenticated users to create, view, update, and delete their notes. It also supports organizing notes with tags. The API uses REST principles, JSON request and response bodies, and HTTPS.

**Base URL:** `https://api.quicknotes.example/v1`

**Authentication:** Bearer access token in the `Authorization` header.

**Content type:** `application/json`

## 2. Endpoints

| Method | Path                           | Description                                          | Success status |
| ------ | ------------------------------ | ---------------------------------------------------- | -------------- |
| POST   | `/auth/register`               | Register a new user                                  | 201 Created    |
| POST   | `/auth/login`                  | Authenticate a user and issue a token                | 200 OK         |
| GET    | `/notes`                       | List the authenticated user's notes, with pagination | 200 OK         |
| GET    | `/notes/{noteId}`              | Retrieve one note by ID                              | 200 OK         |
| POST   | `/notes`                       | Create a note                                        | 201 Created    |
| PATCH  | `/notes/{noteId}`              | Update selected fields of a note                     | 200 OK         |
| DELETE | `/notes/{noteId}`              | Delete a note                                        | 204 No Content |
| GET    | `/tags`                        | List the user's tags                                 | 200 OK         |
| POST   | `/notes/{noteId}/tags/{tagId}` | Associate a tag with a note                          | 201 Created    |
| DELETE | `/notes/{noteId}/tags/{tagId}` | Remove a tag association                             | 204 No Content |

## 3. Authentication

Protected endpoints require this header:

```http
Authorization: Bearer <access_token>
```

The server must verify the token and ensure users can access only their own notes and tags.

## 4. Create a note

### Request

`POST /v1/notes`

```json
{
  "title": "Ideas for my project",
  "body": "Research database options and sketch the interface."
}
```

### Success response

Status: `201 Created`

```json
{
  "id": "note_123",
  "userId": "user_456",
  "title": "Ideas for my project",
  "body": "Research database options and sketch the interface.",
  "createdAt": "2026-10-29T10:00:00Z",
  "updatedAt": "2026-10-29T10:00:00Z"
}
```

## 5. List notes

### Request

`GET /v1/notes?page=1&limit=10`

### Success response

Status: `200 OK`

```json
{
  "data": [
    {
      "id": "note_123",
      "userId": "user_456",
      "title": "Ideas for my project",
      "body": "Research database options and sketch the interface.",
      "createdAt": "2026-10-29T10:00:00Z",
      "updatedAt": "2026-10-29T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

An empty result returns `200 OK` with an empty `data` array.

## 6. Error status codes

| Status                    | Meaning                            | Example situation                                            |
| ------------------------- | ---------------------------------- | ------------------------------------------------------------ |
| 400 Bad Request           | Invalid request                    | Missing title or malformed JSON                              |
| 401 Unauthorized          | Authentication required or invalid | Missing or expired token                                     |
| 403 Forbidden             | Access denied                      | User attempts an operation they are not permitted to perform |
| 404 Not Found             | Resource not found                 | Requested note does not exist or is not accessible           |
| 409 Conflict              | Conflict with current state        | Duplicate email during registration                          |
| 422 Unprocessable Content | Validation failed                  | Title exceeds 100 characters                                 |
| 429 Too Many Requests     | Rate limit exceeded                | Too many requests in a short period                          |
| 500 Internal Server Error | Unexpected server failure          | Unhandled server exception                                   |

### Example error body

Status: `400 Bad Request`

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The title field is required.",
    "details": {
      "field": "title"
    }
  }
}
```

## 7. Design decisions

- Use HTTPS for all API communication.
- Require authentication for private notes and tags.
- Validate input on the server even when the client validates it.
- Return consistent JSON error objects.
- Use pagination so large note collections do not require one enormous response.
- Scope all note queries to the authenticated user to protect privacy.
- Use `204 No Content` for successful deletion when no response body is needed.
