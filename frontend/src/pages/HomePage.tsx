import { useEffect, useState } from 'react';
import { fetchTickets } from '../api';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import TicketCard from '../components/TicketCard';

interface Ticket {
  ticket_id: string;
  customer_name: string;
  subject: string;
  status: string;
  created_at: string;
}

export default function HomePage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchTickets()
      .then((data: Ticket[]) => setTickets(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = tickets.filter((t) => {
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      t.ticket_id.toLowerCase().includes(q) ||
      t.customer_name.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const counts = {
    All: tickets.length,
    Open: tickets.filter((t) => t.status === 'Open').length,
    'In Progress': tickets.filter((t) => t.status === 'In Progress').length,
    Closed: tickets.filter((t) => t.status === 'Closed').length,
  };

  return (
    <Layout>
      {/* Page header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tickets</h1>
        <p className="text-sm text-gray-500 mt-0.5">{tickets.length} total · {counts.Open} open</p>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} />
        </div>
        <FilterBar active={statusFilter} onChange={setStatusFilter} counts={counts} />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-9 h-9 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading tickets…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-2 text-center">
          <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-3-3v6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 font-medium">No tickets found</p>
          <p className="text-sm text-gray-400">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 animate-fade-in">
          {filtered.map((ticket) => (
            <TicketCard key={ticket.ticket_id} ticket={ticket} />
          ))}
        </div>
      )}
    </Layout>
  );
}
