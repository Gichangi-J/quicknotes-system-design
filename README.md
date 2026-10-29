# QuickNotes — System Design Capstone

QuickNotes is a simple web-based note-taking application built to demonstrate API integration, REST API design, relational database modelling, and scalable system architecture.

## Features

- Load notes from a REST API.
- Create notes with a title and optional body.
- Delete notes.
- Display loading, success, and error messages.
- Validate note titles and provide a responsive interface.

**Important:** The frontend uses JSONPlaceholder, a demonstration API. POST and DELETE requests simulate changes; they do not permanently save or remove data on the server.

## Technologies Used

- HTML5
- CSS3
- JavaScript (Fetch API and async/await)
- REST API and JSON
- SQL and relational database design
- Git and GitHub

## How to Run the Application

1. Clone or download this repository.
2. Open the project folder in VS Code.
3. Open `index.html` in a browser, or use the VS Code Live Server extension.
4. Click **Load notes** to retrieve sample notes.
5. Use the form to create a note or the Delete button to remove one from the displayed list.

An internet connection is required to access JSONPlaceholder.

## Project Documentation

- [API Design](docs/api-design.md) — REST endpoints, request and response examples, and error handling.
- [Data Model](docs/data-model.md) — Database tables, relationships, SQL queries, and indexing.
- [System Architecture](docs/architecture.md) — Requirements, capacity estimates, architecture diagram, request flows, and trade-offs.

## What I Learned

- How to use JavaScript's Fetch API and async/await to communicate with a REST API.
- How to handle HTTP errors and display useful feedback to users.
- How to design REST endpoints and document JSON request and response formats.
- How relational database tables, primary keys, foreign keys, and JOIN queries work together.
- How load balancing, caching, replicas, and queues can support a growing application.
- How Git and GitHub help track changes and manage a project.

## Future Improvements

- Add a real backend and persistent database.
- Implement user registration, login, and secure authentication.
- Allow users to edit notes and organise them with tags.
- Add automated tests and production monitoring.
