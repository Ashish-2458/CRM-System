import re
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.models import Ticket, Note
from backend.schemas import TicketCreate, TicketUpdate


def _next_ticket_id(db: Session) -> str:
    """Generate the next ticket ID using max-suffix strategy."""
    rows = db.query(Ticket.ticket_id).all()
    max_num = 0
    for (tid,) in rows:
        match = re.search(r"TKT-(\d+)$", tid)
        if match:
            max_num = max(max_num, int(match.group(1)))
    return f"TKT-{max_num + 1:03d}"


def create_ticket(db: Session, data: TicketCreate) -> Ticket:
    ticket_id = _next_ticket_id(db)
    ticket = Ticket(
        ticket_id=ticket_id,
        customer_name=data.customer_name,
        customer_email=data.customer_email,
        subject=data.subject,
        description=data.description,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


def get_tickets(
    db: Session,
    search: Optional[str] = None,
    status: Optional[str] = None,
) -> list[Ticket]:
    query = db.query(Ticket)

    if status:
        query = query.filter(Ticket.status == status)

    if search:
        pattern = f"%{search}%"
        query = query.filter(
            Ticket.ticket_id.ilike(pattern)
            | Ticket.customer_name.ilike(pattern)
            | Ticket.customer_email.ilike(pattern)
            | Ticket.description.ilike(pattern)
        )

    return query.order_by(Ticket.created_at.desc()).all()


def get_ticket(db: Session, ticket_id: str) -> Optional[Ticket]:
    return db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()


def update_ticket(db: Session, ticket_id: str, data: TicketUpdate) -> Optional[Ticket]:
    ticket = get_ticket(db, ticket_id)
    if ticket is None:
        return None

    if data.status is not None:
        ticket.status = data.status

    if data.note_text:
        note = Note(ticket_id=ticket_id, note_text=data.note_text)
        db.add(note)

    db.commit()
    db.refresh(ticket)
    return ticket
