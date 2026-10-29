# QuickNotes System Architecture

## 1. Overview

QuickNotes is a web-based note-taking application. The frontend allows users to create, view, update, and delete notes through an API. The proposed backend uses application servers, caching, a relational database, and background workers to support growth and reliability.

## 2. Functional Requirements

- Users can register and log in securely.
- Users can create, view, update, and delete their notes.
- Users can organise notes using tags.
- Users can only access their own notes.
- The application displays clear loading, success, empty, and error states.

## 3. Non-Functional Requirements

- **Scalability:** The system should support growth to one million registered users.
- **Performance:** Common note-reading requests should respond quickly.
- **Availability:** The system should continue operating if an application server fails.
- **Security:** Use HTTPS, secure password hashing, authentication, and authorisation.
- **Data integrity:** Use database constraints and transactions where appropriate.
- **Maintainability:** Separate frontend, API, database, and background-processing responsibilities.
- **Recoverability:** Maintain backups and test database restoration procedures.

## 4. Capacity Estimates for One Million Users

These are planning assumptions, not measured production traffic.

### Assumptions

- Registered users: 1,000,000
- Daily active users: 10% = 100,000
- Each daily active user performs 50 read requests per day.
- Each daily active user performs 2 write requests per day.
- Each user stores 100 notes on average.
- Each note uses approximately 2 KB of stored text and metadata.
- A 30-day month and a 365-day year are used for estimates.

### Read requests per second

Daily reads:

100,000 × 50 = 5,000,000 reads/day

Average reads per second:

5,000,000 ÷ 86,400 ≈ 58 reads/second

### Write requests per second

Daily writes:

100,000 × 2 = 200,000 writes/day

Average writes per second:

200,000 ÷ 86,400 ≈ 2.3 writes/second

### Storage per year

Total notes:

1,000,000 × 100 = 100,000,000 notes

Estimated note data:

100,000,000 × 2 KB = 200 GB

If the average user adds 2 notes per day, annual new note data is:

100,000 × 2 × 365 × 2 KB ≈ 146 GB/year

This annual estimate assumes 100,000 daily active users create two new notes each day. If the two daily writes include updates or deletions, actual new storage growth will be lower.

These figures exclude indexes, backups, logs, replicas, and other database overhead. Real capacity planning should also account for peak traffic, not just daily averages.

## 5. Architecture Diagram

```text
                         Users
                           |
                           v
                    DNS Resolution
                           |
                           v
                     CDN / Edge
                           |
                           v
                    Load Balancer
                           |
                +----------+----------+
                |                     |
                v                     v
          Application Server 1  Application Server 2
                |                     |
                +----------+----------+
                           |
                  +--------+--------+
                  |                 |
                  v                 v
                Cache          Message Queue
                  |                 |
                  v                 v
            Primary Database    Background Worker
                  |
                  v
             Read Replica
```

## 6. Components and Their Responsibilities

- **Client:** The browser displays the interface and sends API requests.
- **DNS:** Resolves the application domain to the appropriate network destination.
- **CDN:** Delivers cacheable static assets closer to users, reducing latency and origin traffic.
- **Load balancer:** Distributes incoming requests across healthy application servers.
- **Application servers:** Validate requests, enforce authentication and authorisation, and run business logic.
- **Cache:** Stores frequently accessed data temporarily to reduce repeated database reads.
- **Primary database:** Stores authoritative user, note, and tag data and handles writes.
- **Read replica:** Serves eligible read queries to reduce pressure on the primary database.
- **Message queue:** Holds background tasks so they can be processed asynchronously.
- **Background worker:** Handles tasks such as notifications, exports, or other work that need not block a user request.

The cache must be invalidated or updated when relevant notes change. Reads from a replica may be slightly stale, so requests requiring immediate consistency should use the primary database.

## 7. GET /notes Request Flow

1. The browser sends `GET /notes` over HTTPS.
2. DNS resolves the application's domain.
3. The CDN serves any eligible cached static assets; authenticated note data should not be publicly cached.
4. The load balancer forwards the API request to a healthy application server.
5. The server authenticates the user and verifies their permissions.
6. The server checks the cache for the user's notes.
7. If the data is not cached, the server queries the database or an appropriate read replica.
8. The server returns the notes as JSON with HTTP status `200 OK`.
9. The browser renders the notes and updates the status message.

## 8. POST /notes Request Flow

1. The browser sends `POST /notes` with a JSON body over HTTPS.
2. The load balancer forwards the request to a healthy application server.
3. The server authenticates the user and validates the note title and body.
4. The server writes the new note to the primary database.
5. The server invalidates or updates affected cache entries.
6. If additional asynchronous work is required, the server places a task on the message queue.
7. The server returns the created note with HTTP status `201 Created`.
8. The browser displays the new note and a success message.

The database write should succeed before the API reports successful creation.

## 9. Trade-Offs

### Cache speed vs data freshness

Caching improves read performance and reduces database load, but cached data can become stale. QuickNotes should invalidate relevant entries after writes and avoid publicly caching private note data.

### Read replicas vs consistency

Read replicas can handle additional read traffic, but replication lag can cause recent changes to be temporarily missing. Requests that must immediately reflect a write should read from the primary database.

### More servers vs operational complexity

Multiple application servers improve scalability and allow the service to survive an individual server failure. However, they add deployment, monitoring, and configuration complexity.

### Asynchronous processing vs immediate completion

A message queue prevents slow background tasks from delaying API responses. However, queued tasks may be delayed or retried, so workers should handle retries safely and avoid duplicate effects.

## 10. Avoiding Single Points of Failure

- Run multiple application servers behind a health-checking load balancer.
- Deploy the load balancer and other critical infrastructure with appropriate redundancy.
- Use database replication, automated backups, and a tested recovery process.
- Monitor cache and queue health, and ensure the application can handle temporary cache failure.
- Use durable queues and retry policies for background tasks.
- Monitor error rates, latency, storage capacity, and server health.

The exact redundancy strategy depends on the deployment platform, budget, and availability targets.
