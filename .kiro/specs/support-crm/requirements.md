# Requirements Document

## Introduction

A full-stack web-based Customer Support CRM system that allows support teams to create, manage, search, filter, and update customer support tickets. The system is built with Python + FastAPI on the backend, SQLite as the database, and React on the frontend. It must be deployable to Railway.app and accessible via a public URL.

## Glossary

- **CRM**: Customer Relationship Management — the system being built to manage support tickets.
- **Ticket**: A support request record containing customer information, issue details, and status.
- **Ticket ID**: A unique auto-generated identifier for each ticket (e.g., TKT-001).
- **Status**: The current state of a ticket — one of: Open, In Progress, or Closed.
- **Note**: A text comment added to a ticket by a support agent.
- **FastAPI**: A Python web framework used to build the backend REST API.
- **SQLite**: A lightweight file-based relational database.
- **React**: A JavaScript frontend library used to build the user interface.
- **Railway**: A cloud deployment platform used to host the application.
- **tickets table**: The primary database table storing all ticket records.
- **notes table**: The secondary database table storing notes linked to tickets via foreign key.

---

## Requirements

### Requirement 1: Data Model

**User Story:** As a developer, I want a minimal, well-defined database schema, so that the system stores data correctly without unnecessary complexity.

#### Acceptance Criteria

1. THE CRM SHALL persist ticket data using a tickets table with the following columns: id (primary key), ticket_id (unique, e.g. TKT-001), customer_name, customer_email, subject, description, status, created_at, and updated_at.
2. THE CRM SHALL persist note data using a notes table with the following columns: id (primary key), ticket_id (foreign key referencing tickets), note_text, and created_at.
3. THE CRM SHALL use the tickets table and the notes table as the primary data model.

---

### Requirement 2: Ticket Creation

**User Story:** As a support agent, I want to create a new support ticket with customer and issue details, so that I can track and manage customer problems.

#### Acceptance Criteria

1. WHEN a support agent submits the ticket creation form with a customer name, customer email, subject, and description, THE CRM SHALL persist the ticket to the database with an auto-generated ticket ID in the format TKT-XXX and a created_at timestamp.
2. WHEN a ticket is successfully created, THE CRM SHALL return the new ticket ID and creation timestamp to the frontend.
3. IF the ticket creation form is submitted with any required field (customer name, customer email, subject, or description) left empty, THEN THE CRM SHALL display a validation error message identifying the missing field.
4. THE CRM SHALL assign each new ticket a default status of "Open" at the time of creation.

---

### Requirement 3: Ticket Listing

**User Story:** As a support agent, I want to view a list of all support tickets, so that I can get an overview of all open issues.

#### Acceptance Criteria

1. THE CRM SHALL display all tickets in a list view showing ticket ID, customer name, subject, status, and creation date.
2. WHEN the ticket list is loaded, THE CRM SHALL retrieve and display tickets sorted by creation date in descending order.
3. WHILE the ticket list is loading from the API, THE CRM SHALL display a loading indicator to the user.

---

### Requirement 4: Search Functionality

**User Story:** As a support agent, I want to search across tickets using a keyword, so that I can quickly find relevant tickets without scrolling through the full list.

#### Acceptance Criteria

1. WHEN a support agent types a search query into the search bar, THE CRM SHALL filter the displayed ticket list to show only tickets where the ticket ID, customer name, customer email, or description contains the search query.
2. WHEN the search input changes, THE CRM SHALL update the filtered ticket list dynamically as the user types without requiring a page reload.
3. IF the search query matches no tickets, THEN THE CRM SHALL display a "No tickets found" message in place of the ticket list.

---

### Requirement 5: Filter by Status

**User Story:** As a support agent, I want to filter tickets by their status, so that I can focus on tickets that need attention.

#### Acceptance Criteria

1. THE CRM SHALL provide filter controls for the status values: All, Open, In Progress, and Closed.
2. WHEN a support agent selects a status filter, THE CRM SHALL display only tickets matching the selected status.
3. WHEN a support agent selects the "All" filter option, THE CRM SHALL display all tickets regardless of status.
4. WHERE a search query and a status filter are both active, THE CRM SHALL apply both filters simultaneously to the ticket list.

---

### Requirement 6: View and Update Ticket

**User Story:** As a support agent, I want to view the full details of a ticket and update its status or add notes, so that I can manage the ticket's resolution progress.

#### Acceptance Criteria

1. WHEN a support agent clicks on a ticket in the list, THE CRM SHALL navigate to a detail page displaying the full ticket information including ticket ID, customer name, customer email, subject, description, status, creation date, and all associated notes.
2. WHEN a support agent submits a status update on the ticket detail page, THE CRM SHALL persist the new status and updated_at timestamp to the database and display the updated status on the detail page.
3. WHEN a support agent submits a new note on the ticket detail page, THE CRM SHALL persist the note with a created_at timestamp and display the note in the notes section of the ticket detail page.
4. IF a ticket ID in the URL does not match any ticket in the database, THEN THE CRM SHALL display a "Ticket not found" error message.

---

### Requirement 7: API Design

**User Story:** As a developer, I want a clean REST API, so that the frontend can reliably communicate with the backend.

#### Acceptance Criteria

1. THE CRM SHALL expose a POST /api/tickets endpoint that accepts customer_name, customer_email, subject, and description in the request body and returns the created ticket_id and created_at timestamp.
2. THE CRM SHALL expose a GET /api/tickets endpoint that accepts optional query parameters for status and search, and returns a list of matching tickets.
3. THE CRM SHALL expose a GET /api/tickets/{ticket_id} endpoint that returns the full ticket details including all associated notes.
4. THE CRM SHALL expose a PUT /api/tickets/{ticket_id} endpoint that accepts status and note_text in the request body and returns a success flag and updated_at timestamp.
5. IF a GET or PUT request references a ticket_id that does not exist in the database, THEN THE CRM SHALL return an HTTP 404 response.
6. IF any API endpoint receives an invalid or malformed request, THEN THE CRM SHALL return an appropriate HTTP error response with a descriptive message.

---

### Requirement 8: Deployment

**User Story:** As an evaluator, I want to access the application via a public URL, so that I can verify the application works in a production environment.

#### Acceptance Criteria

1. THE CRM SHALL be deployed to Railway.app and accessible via a stable public URL.
2. THE CRM SHALL include a README.md with setup instructions, an .env.example file, and a .gitignore file in the GitHub repository.
3. THE CRM SHALL remain functional and usable on mobile screen sizes of 375px width and above.
4. THE CRM SHALL NOT require user authentication for this MVP; all API endpoints SHALL be publicly accessible.


