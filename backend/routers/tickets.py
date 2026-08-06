from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend import crud
from backend.schemas import (
    TicketCreate,
    TicketUpdate,
    TicketCreateResponse,
    TicketUpdateResponse,
    TicketListItem,
    TicketDetail,
)

router = APIRouter(prefix="/api/tickets", tags=["tickets"])


@router.post("", response_model=TicketCreateResponse, status_code=201)
def create_ticket(payload: TicketCreate, db: Session = Depends(get_db)):
    ticket = crud.create_ticket(db, payload)
    return TicketCreateResponse(ticket_id=ticket.ticket_id, created_at=ticket.created_at)


@router.get("", response_model=list[TicketListItem])
def list_tickets(
    search: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    tickets = crud.get_tickets(db, search=search, status=status)
    return tickets


@router.get("/{ticket_id}", response_model=TicketDetail)
def get_ticket(ticket_id: str, db: Session = Depends(get_db)):
    ticket = crud.get_ticket(db, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found")
    return ticket


@router.put("/{ticket_id}", response_model=TicketUpdateResponse)
def update_ticket(ticket_id: str, payload: TicketUpdate, db: Session = Depends(get_db)):
    ticket = crud.update_ticket(db, ticket_id, payload)
    if ticket is None:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found")
    return TicketUpdateResponse(success=True, updated_at=ticket.updated_at)
