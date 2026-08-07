import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from backend.main import app
from backend.database import Base, get_db
from backend.models import Ticket, Note

# Use in-memory SQLite with StaticPool so all connections share the same DB
TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_database():
    """Create fresh tables before each test and drop after"""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


def test_create_ticket():
    """Test creating a new ticket"""
    response = client.post(
        "/api/tickets",
        json={
            "customer_name": "John Doe",
            "customer_email": "john@example.com",
            "subject": "Login issue",
            "description": "Cannot log into my account",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert "ticket_id" in data
    assert data["ticket_id"] == "TKT-001"
    assert "created_at" in data


def test_list_tickets():
    """Test listing all tickets"""
    # Create two tickets
    client.post(
        "/api/tickets",
        json={
            "customer_name": "Alice",
            "customer_email": "alice@example.com",
            "subject": "Bug report",
            "description": "Found a bug",
        },
    )
    client.post(
        "/api/tickets",
        json={
            "customer_name": "Bob",
            "customer_email": "bob@example.com",
            "subject": "Feature request",
            "description": "Need new feature",
        },
    )

    response = client.get("/api/tickets")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    names = {t["customer_name"] for t in data}
    assert names == {"Alice", "Bob"}


def test_get_ticket_by_id():
    """Test retrieving a specific ticket"""
    create_response = client.post(
        "/api/tickets",
        json={
            "customer_name": "Charlie",
            "customer_email": "charlie@example.com",
            "subject": "Help needed",
            "description": "Need assistance",
        },
    )
    ticket_id = create_response.json()["ticket_id"]

    response = client.get(f"/api/tickets/{ticket_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["ticket_id"] == ticket_id
    assert data["customer_name"] == "Charlie"
    assert data["status"] == "Open"
    assert data["notes"] == []


def test_update_ticket_status():
    """Test updating ticket status"""
    create_response = client.post(
        "/api/tickets",
        json={
            "customer_name": "Diana",
            "customer_email": "diana@example.com",
            "subject": "Issue",
            "description": "Problem description",
        },
    )
    ticket_id = create_response.json()["ticket_id"]

    update_response = client.put(
        f"/api/tickets/{ticket_id}",
        json={"status": "In Progress"},
    )
    assert update_response.status_code == 200
    data = update_response.json()
    assert data["success"] is True
    assert "updated_at" in data

    # Verify status updated
    get_response = client.get(f"/api/tickets/{ticket_id}")
    assert get_response.json()["status"] == "In Progress"


def test_add_note_to_ticket():
    """Test adding a note to a ticket"""
    create_response = client.post(
        "/api/tickets",
        json={
            "customer_name": "Eve",
            "customer_email": "eve@example.com",
            "subject": "Question",
            "description": "I have a question",
        },
    )
    ticket_id = create_response.json()["ticket_id"]

    update_response = client.put(
        f"/api/tickets/{ticket_id}",
        json={"note_text": "Working on this issue"},
    )
    assert update_response.status_code == 200

    # Verify note was added
    get_response = client.get(f"/api/tickets/{ticket_id}")
    data = get_response.json()
    assert len(data["notes"]) == 1
    assert data["notes"][0]["note_text"] == "Working on this issue"


def test_add_note_and_update_status():
    """Test updating status and adding note in same request"""
    create_response = client.post(
        "/api/tickets",
        json={
            "customer_name": "Frank",
            "customer_email": "frank@example.com",
            "subject": "Support needed",
            "description": "Need help with setup",
        },
    )
    ticket_id = create_response.json()["ticket_id"]

    update_response = client.put(
        f"/api/tickets/{ticket_id}",
        json={"status": "Closed", "note_text": "Issue resolved"},
    )
    assert update_response.status_code == 200

    # Verify both updates
    get_response = client.get(f"/api/tickets/{ticket_id}")
    data = get_response.json()
    assert data["status"] == "Closed"
    assert len(data["notes"]) == 1
    assert data["notes"][0]["note_text"] == "Issue resolved"


def test_get_nonexistent_ticket_returns_404():
    """Test that fetching a non-existent ticket returns 404"""
    response = client.get("/api/tickets/TKT-999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_update_nonexistent_ticket_returns_404():
    """Test that updating a non-existent ticket returns 404"""
    response = client.put(
        "/api/tickets/TKT-999",
        json={"status": "Closed"},
    )
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_search_by_customer_name():
    """Test search functionality by customer name"""
    client.post(
        "/api/tickets",
        json={
            "customer_name": "Alice Smith",
            "customer_email": "alice.smith@example.com",
            "subject": "Issue A",
            "description": "Description A",
        },
    )
    client.post(
        "/api/tickets",
        json={
            "customer_name": "Bob Jones",
            "customer_email": "bob@example.com",
            "subject": "Issue B",
            "description": "Description B",
        },
    )

    response = client.get("/api/tickets?search=alice")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["customer_name"] == "Alice Smith"


def test_filter_by_status():
    """Test filtering tickets by status"""
    # Create tickets with different statuses
    ticket1_response = client.post(
        "/api/tickets",
        json={
            "customer_name": "User1",
            "customer_email": "user1@example.com",
            "subject": "Issue 1",
            "description": "Description 1",
        },
    )
    ticket2_response = client.post(
        "/api/tickets",
        json={
            "customer_name": "User2",
            "customer_email": "user2@example.com",
            "subject": "Issue 2",
            "description": "Description 2",
        },
    )

    # Update one to In Progress
    client.put(
        f"/api/tickets/{ticket2_response.json()['ticket_id']}",
        json={"status": "In Progress"},
    )

    # Filter by Open
    response = client.get("/api/tickets?status=Open")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["status"] == "Open"

    # Filter by In Progress
    response = client.get("/api/tickets?status=In Progress")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["status"] == "In Progress"


def test_ticket_id_generation():
    """Test sequential ticket ID generation"""
    # Create first ticket
    response1 = client.post(
        "/api/tickets",
        json={
            "customer_name": "Test1",
            "customer_email": "test1@example.com",
            "subject": "Test",
            "description": "Test",
        },
    )
    assert response1.json()["ticket_id"] == "TKT-001"

    # Create second ticket
    response2 = client.post(
        "/api/tickets",
        json={
            "customer_name": "Test2",
            "customer_email": "test2@example.com",
            "subject": "Test",
            "description": "Test",
        },
    )
    assert response2.json()["ticket_id"] == "TKT-002"
