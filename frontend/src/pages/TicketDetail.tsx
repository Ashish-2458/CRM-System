import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchTicket, updateTicket } from '../api';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import Toast from '../components/Toast';
import { formatDateTime } from '../utils/formatDate';

interface Note {
  id: number;
  note_text: string;
  created_at: string;
}

interface Ticket {
  ticket_id: string;
  customer_name: string;
  customer_email: string;
  subject: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  notes: Note[];
}

const STATUSES = ['Open', 'In Progress', 'Closed'];

export default function TicketDetail() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!ticketId) return;
    fetchTicket(ticketId)
      .then((data: Ticket) => { setTicket(data); setSelectedStatus(data.status); })
      .catch((err: { response?: { status: number } }) => {
        if (err?.response?.status === 404) setNotFound(true);
        else setError('Failed to load ticket.');
      })
      .finally(() => setLoading(false));
  }, [ticketId]);

  async function handleStatusUpdate() {
    if (!ticketId || !ticket) return;
    setUpdatingStatus(true); setError('');
    try {
      await updateTicket(ticketId, { status: selectedStatus });
      const r: Ticket = await fetchTicket(ticketId);
      setTicket(r); setSelectedStatus(r.status);
      setToast('Status updated successfully');
    } catch { setError('Failed to update status.'); }
    finally { setUpdatingStatus(false); }
  }

  async function handleAddNote() {
    if (!ticketId || !noteText.trim()) return;
    setAddingNote(true); setError('');
    try {
      await updateTicket(ticketId, { note_text: noteText.trim() });
      const r: Ticket = await fetchTicket(ticketId);
      setTicket(r); setNoteText('');
      setToast('Note added successfully');
    } catch { setError('Failed to add note.'); }
    finally { setAddingNote(false); }
  }

  if (loading) return (
    <Layout>
      <div className="flex justify-center items-center py-32">
        <div className="w-9 h-9 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </Layout>
  );

  if (notFound) return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
          <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <p className="font-semibold text-gray-800">Ticket not found</p>
        <Link to="/" className="text-sm text-indigo-600 hover:underline">← Back to tickets</Link>
      </div>
    </Layout>
  );

  if (!ticket) return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-32 gap-2 text-red-500">
        <p>{error || 'Something went wrong.'}</p>
        <Link to="/" className="text-sm text-indigo-600 hover:underline">← Back to tickets</Link>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-3xl mx-auto animate-fade-in">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-indigo-600 transition-colors">Tickets</Link>
          <span>/</span>
          <span className="font-mono text-indigo-500 text-xs">{ticket.ticket_id}</span>
        </div>

        {/* Hero card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-4">
          <div className="px-8 py-6 bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-gray-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-block font-mono text-[11px] font-semibold text-indigo-500 bg-indigo-100 px-2 py-0.5 rounded mb-2">
                  {ticket.ticket_id}
                </span>
                <h1 className="text-xl font-bold text-gray-900 leading-snug">{ticket.subject}</h1>
              </div>
              <StatusBadge status={ticket.status} />
            </div>
          </div>

          <div className="px-8 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
              <InfoCell label="Customer" value={ticket.customer_name} />
              <InfoCell label="Email" value={ticket.customer_email} truncate={false} />
              <InfoCell label="Created" value={formatDateTime(ticket.created_at)} />
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                {ticket.description}
              </p>
            </div>
          </div>
        </div>

        {/* Update status */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-8 py-6 mb-4">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4">Update Status</h2>
          <div className="flex gap-3 items-center">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button onClick={handleStatusUpdate}
              disabled={updatingStatus || selectedStatus === ticket.status}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all">
              {updatingStatus ? (
                <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Updating…</>
              ) : 'Save Status'}
            </button>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-8 py-6">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4">
            Notes
            {ticket.notes.length > 0 && (
              <span className="ml-2 inline-block bg-indigo-100 text-indigo-600 text-xs font-bold px-2 py-0.5 rounded-full normal-case tracking-normal">
                {ticket.notes.length}
              </span>
            )}
          </h2>

          {ticket.notes.length === 0 ? (
            <p className="text-sm text-gray-400 italic mb-6">No notes yet. Add one below.</p>
          ) : (
            <ul className="flex flex-col gap-3 mb-6">
              {ticket.notes.map((note, i) => (
                <li key={note.id} className="flex gap-3 animate-fade-in">
                  <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold mt-0.5">
                    {i + 1}
                  </div>
                  <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{note.note_text}</p>
                    <p className="text-[11px] text-gray-400 mt-1.5">{formatDateTime(note.created_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-col gap-2">
            <textarea rows={3} value={noteText} onChange={(e) => setNoteText(e.target.value)}
              placeholder="Write a note…"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white focus:border-transparent resize-none transition-all" />
            <button onClick={handleAddNote} disabled={addingNote || !noteText.trim()}
              className="self-end inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-all">
              {addingNote ? (
                <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Adding…</>
              ) : (
                <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>Add Note</>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}
      </div>
      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </Layout>
  );
}

function InfoCell({ label, value, truncate = true }: { label: string; value: string; truncate?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-sm font-medium text-gray-800 ${truncate ? 'truncate' : 'break-all'}`}>{value}</p>
    </div>
  );
}
