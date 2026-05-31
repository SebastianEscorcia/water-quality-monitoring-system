import type { WaterStatus } from '../types';

interface Props {
  status: WaterStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

const config: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  Optima: {
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
    label: 'Óptima',
  },
  Alerta: {
    bg: 'bg-amber-500/15',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
    label: 'Alerta',
  },
  Contaminada: {
    bg: 'bg-red-500/15',
    text: 'text-red-400',
    dot: 'bg-red-400',
    label: 'Contaminada',
  },
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5',
};

export default function WaterStatusBadge({ status, size = 'md' }: Props) {
  const c = config[status] ?? {
    bg: 'bg-slate-500/15',
    text: 'text-slate-400',
    dot: 'bg-slate-400',
    label: status,
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border border-current/20 ${c.bg} ${c.text} ${sizeClasses[size]}`}
    >
      <span className={`w-2 h-2 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
