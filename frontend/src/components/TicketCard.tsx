import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatDate } from '../utils/formatDate';

interface Ticket {
  ticket_id: string;
  customer_name: string;
  subject: string;
  status: string;
  created_at: string;
}

export default function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <Link
      to={`/tickets/${ticket.ticket_id}`}
      className="group block bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-100/60 transition-all duration-200"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono font-medium text-indigo-400 bg-indigo-50 px-1.5 py-0.5 rounded">
              {ticket.ticket_id}
            </span>
          </div>
          <p className="font-semibold text-gray-900 truncate text-[15px] group-hover:text-indigo-700 transition-colors">
            {ticket.subject}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">{ticket.customer_name}</p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <StatusBadge status={ticket.status} />
          <p className="text-xs text-gray-400">{formatDate(ticket.created_at)}</p>
        </div>
      </div>
    </Link>
  );
}
