# Implementation Plan

- [x] 1. Set up project structure and configuration





  - Create monorepo folder layout: `backend/` and `frontend/` directories
  - Create `backend/requirements.txt` with fastapi, uvicorn, sqlalchemy, pydantic, httpx
  - Create `Procfile`, `.env.example`, `.gitignore`, and `README.md`
  - _Requirements: 8.2_

- [x] 2. Implement backend database layer



- [x] 2.1 Create SQLAlchemy models and database setup


  - Write `backend/database.py` with SQLite engine and session factory
  - Write `backend/models.py` with `Ticket` and `Note` ORM models matching the schema in the design
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2.2 Create Pydantic schemas


  - Write `backend/schemas.py` with `TicketCreate`, `TicketUpdate`, `TicketListItem`, `NoteOut`, and `TicketDetail` schemas
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 2.3 Implement CRUD operations


  - Write `backend/crud.py` with functions: `create_ticket`, `get_tickets`, `get_ticket`, `update_ticket`
  - Implement ticket ID generation using max-suffix strategy (TKT-{max+1:03d})
  - Implement search using case-insensitive OR filter across ticket_id, customer_name, customer_email, description
  - _Requirements: 2.1, 2.4, 4.1, 4.2, 4.4, 7.5_

- [x] 3. Implement FastAPI routes and app entry point




- [x] 3.1 Create ticket router

  - Write `backend/routers/tickets.py` with all four endpoints: POST, GET list, GET detail, PUT
  - Wire up dependency injection for DB session
  - Return appropriate HTTP 404 when ticket not found
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 3.2 Create FastAPI app entry point


  - Write `backend/main.py` with app creation, CORS middleware, router include, and static file mount for frontend build
  - Create database tables on startup using `Base.metadata.create_all`
  - _Requirements: 2.1, 8.4_

- [x] 4. Scaffold React frontend



  - Initialize Vite + React project in `frontend/`
  - Install dependencies: react-router-dom, axios, tailwindcss
  - Configure Tailwind CSS
  - Write `frontend/src/api.js` with axios instance pointing to `/api` base URL and functions: `fetchTickets`, `createTicket`, `fetchTicket`, `updateTicket`
  - Set up `App.jsx` with React Router routes: `/`, `/new`, `/tickets/:ticketId`
  - _Requirements: 3.3, 4.3_

- [x] 5. Build HomePage


  - Write `frontend/src/pages/HomePage.jsx`
  - Fetch all tickets on mount via `fetchTickets()`
  - Render `SearchBar` and `FilterBar` components
  - Implement dynamic client-side filtering: apply search and status filter on each keystroke/filter change
  - Display "No tickets found" when filtered results are empty
  - Render list of `TicketCard` components linking to `/tickets/:ticketId`
  - Show loading indicator while fetching
  - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4, 5.1_


- [x] 6. Build shared components

  - Write `TicketCard.jsx` — displays ticket_id, customer_name, subject, status badge, created_at
  - Write `StatusBadge.jsx` — colored badge: green for Open, yellow for In Progress, gray for Closed
  - Write `SearchBar.jsx` — controlled text input wired to parent state
  - Write `FilterBar.jsx` — buttons for All / Open / In Progress / Closed
  - _Requirements: 3.1, 4.1, 4.2, 4.3_

- [x] 7. Build CreateTicket page



  - Write `frontend/src/pages/CreateTicket.jsx`
  - Controlled form with fields: customer_name, customer_email, subject, description
  - Inline validation: show error message for each empty required field on submit attempt
  - On success: call `createTicket()` then redirect to HomePage
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 8. Build TicketDetail page



  - Write `frontend/src/pages/TicketDetail.jsx`
  - Fetch ticket on mount via `fetchTicket(ticketId)`
  - Display all ticket fields and notes list
  - Status dropdown (Open / In Progress / Closed) + "Update Status" button → calls `updateTicket()`
  - Note textarea + "Add Note" button → calls `updateTicket()` with note_text
  - Refresh ticket data after each successful update
  - Show "Ticket not found" message on 404 response
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 9. Wire frontend build into backend and verify full stack



  - Run `npm run build` in `frontend/`, confirm output lands in `frontend/dist`
  - Confirm FastAPI `StaticFiles` mount in `main.py` correctly serves the React build at `/`
  - Verify all API routes remain accessible under `/api/*`
  - _Requirements: 8.1, 8.3_

- [x] 10. Deployment configuration


  - Write `Procfile` with `web: uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
  - Update `.env.example` with `DATABASE_URL` and `FRONTEND_ORIGIN`
  - Confirm `README.md` contains local setup instructions and deployed URL placeholder
  - _Requirements: 8.1, 8.2_

- [ ] 11. (Optional) Backend API tests
- [ ]* 11.1 Write backend API tests
  - Write `backend/test_main.py` using FastAPI TestClient
  - Cover: create ticket, list tickets, get ticket by ID, update status, add note, 404 on missing ticket
  - _Requirements: 2.1, 2.3, 3.1, 6.1, 7.5, 7.6_
