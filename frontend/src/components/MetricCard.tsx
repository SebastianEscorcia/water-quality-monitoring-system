interface Props {
  label: string;
  value: string | number;
  sub?: string;
  color?: 'cyan' | 'emerald' | 'amber' | 'violet' | 'slate';
  icon?: React.ReactNode;
}

const colorMap = {
  cyan:    'from-cyan-500/10 to-cyan-500/5 border-cyan-500/20 text-cyan-400',
  emerald: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
  amber:   'from-amber-500/10 to-amber-500/5 border-amber-500/20 text-amber-400',
  violet:  'from-violet-500/10 to-violet-500/5 border-violet-500/20 text-violet-400',
  slate:   'from-slate-700/50 to-slate-800/50 border-slate-600/30 text-slate-300',
};

export default function MetricCard({ label, value, sub, color = 'cyan', icon }: Props) {
  return (
    <div
      className={`rounded-xl border bg-gradient-to-br p-5 flex flex-col gap-1 ${colorMap[color]}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
        {icon && <span className="opacity-60">{icon}</span>}
      </div>
      <p className="text-3xl font-bold text-white mt-1">{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}
