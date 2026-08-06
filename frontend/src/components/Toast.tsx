import { useEffect } from 'react';

interface Props {
  message: string;
  onDone: () => void;
  durationMs?: number;
}

export default function Toast({ message, onDone, durationMs = 3000 }: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, durationMs);
    return () => clearTimeout(t);
  }, [onDone, durationMs]);

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
      <div className="flex items-center gap-3 bg-gray-950 text-white text-sm font-medium px-5 py-3.5 rounded-2xl shadow-2xl shadow-black/20 border border-white/10">
        <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
        {message}
      </div>
    </div>
  );
}
