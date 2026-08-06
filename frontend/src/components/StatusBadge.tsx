const STYLES: Record<string, string> = {
  Open:          'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  'In Progress': 'bg-amber-50  text-amber-700  ring-1 ring-amber-200',
  Closed:        'bg-slate-100 text-slate-500  ring-1 ring-slate-200',
};

const DOT: Record<string, string> = {
  Open:          'bg-emerald-500',
  'In Progress': 'bg-amber-400',
  Closed:        'bg-slate-400',
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${STYLES[status] ?? 'bg-gray-100 text-gray-500'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${DOT[status] ?? 'bg-gray-400'}`} />
      {status}
    </span>
  );
}
