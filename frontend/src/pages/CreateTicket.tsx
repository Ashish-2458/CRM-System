import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createTicket } from '../api';
import Layout from '../components/Layout';
import Toast from '../components/Toast';

interface FormFields {
  customer_name: string;
  customer_email: string;
  subject: string;
  description: string;
}

type Errors = Partial<Record<keyof FormFields, string>>;

const EMPTY: FormFields = { customer_name: '', customer_email: '', subject: '', description: '' };

export default function CreateTicket() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormFields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [toast, setToast] = useState('');

  function validate(): Errors {
    const e: Errors = {};
    if (!form.customer_name.trim())  e.customer_name  = 'Customer name is required.';
    if (!form.customer_email.trim()) e.customer_email = 'Customer email is required.';
    if (!form.subject.trim())        e.subject        = 'Subject is required.';
    if (!form.description.trim())    e.description    = 'Description is required.';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError('');
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    setSubmitting(true);
    try {
      await createTicket(form);
      setToast('Ticket created successfully');
      setTimeout(() => navigate('/'), 1200);
    } catch {
      setServerError('Failed to create ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleChange(field: keyof FormFields, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto animate-fade-in">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-indigo-600 transition-colors">Tickets</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">New Ticket</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Card header */}
          <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-violet-50">
            <h1 className="text-xl font-bold text-gray-900">Create New Ticket</h1>
            <p className="text-sm text-gray-500 mt-1">Fill in the details to open a support ticket.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="px-8 py-6 flex flex-col gap-5">
            {serverError && (
              <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {serverError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Customer Name" error={errors.customer_name}>
                <input type="text" value={form.customer_name}
                  onChange={(e) => handleChange('customer_name', e.target.value)}
                  className={inputCls(!!errors.customer_name)} placeholder="Jane Doe" />
              </Field>

              <Field label="Customer Email" error={errors.customer_email}>
                <input type="email" value={form.customer_email}
                  onChange={(e) => handleChange('customer_email', e.target.value)}
                  className={inputCls(!!errors.customer_email)} placeholder="jane@example.com" />
              </Field>
            </div>

            <Field label="Subject" error={errors.subject}>
              <input type="text" value={form.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                className={inputCls(!!errors.subject)} placeholder="Brief summary of the issue" />
            </Field>

            <Field label="Description" error={errors.description}>
              <textarea rows={5} value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className={inputCls(!!errors.description)} placeholder="Describe the issue in detail…" />
            </Field>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <Link to="/" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
                Cancel
              </Link>
              <button type="submit" disabled={submitting}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:opacity-60 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-sm shadow-indigo-200 transition-all">
                {submitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Creating…
                  </>
                ) : 'Create Ticket'}
              </button>
            </div>
          </form>
        </div>
      </div>
      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </Layout>
  );
}

function inputCls(hasError: boolean) {
  return `w-full bg-gray-50 border rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white focus:border-transparent transition-all ${
    hasError ? 'border-red-400 bg-red-50' : 'border-gray-200'
  }`;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      {children}
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
