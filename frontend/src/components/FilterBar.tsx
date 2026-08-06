const STATUSES = ['All', 'Open', 'In Progress', 'Closed'] as const;
type Status = (typeof STATUSES)[number];

interface Props {
  active: string;
  onChange: (s: string) => void;
  counts?: Record<Status, number>;
}

export default function FilterBar({ active, onChange, counts }: Props) {
  return (
    <div className="flex gap-1.5 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
      {STATUSES.map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            active === s
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          {s}
          {counts && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              active === s
                ? 'bg-white/20 text-white'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {counts[s]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
