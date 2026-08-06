import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const fetchTickets = (params: Record<string, string> = {}) =>
  api.get('/tickets', { params }).then((r) => r.data);

export const createTicket = (data: {
  customer_name: string;
  customer_email: string;
  subject: string;
  description: string;
}) => api.post('/tickets', data).then((r) => r.data);

export const fetchTicket = (ticketId: string) =>
  api.get(`/tickets/${ticketId}`).then((r) => r.data);

export const updateTicket = (
  ticketId: string,
  data: { status?: string; note_text?: string }
) => api.put(`/tickets/${ticketId}`, data).then((r) => r.data);
