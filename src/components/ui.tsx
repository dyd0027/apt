import type { ReactNode } from 'react';
import { formatMoney } from '@/domain/assets';
export function MoneyInput({
  label,
  value,
  onChange,
  id,
  compact = false,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  id: string;
  compact?: boolean;
}) {
  return (
    <label className={`money-field ${compact ? 'compact' : ''}`} htmlFor={id}>
      <span className="field-label">{label}</span>
      <span className="input-wrap">
        <input
          id={id}
          aria-label={label}
          inputMode="numeric"
          type="text"
          value={value.toLocaleString('ko-KR')}
          onChange={(e) => {
            const raw = e.target.value.replaceAll(',', '');
            if (/^\d*$/.test(raw)) onChange(Math.min(1_000_000_000_000, Number(raw)));
          }}
          onFocus={(e) => e.target.select()}
          autoComplete="off"
        />
        <span>원</span>
      </span>
      <span className="money-hint">{formatMoney(value)}</span>
    </label>
  );
}
export function Toggle({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <div className="toggle-row">
      <div>
        <span>{label}</span>
        {hint && <small>{hint}</small>}
      </div>
      <button
        className={`toggle ${checked ? 'on' : ''}`}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
      >
        <span />
      </button>
    </div>
  );
}
export function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}
export function Metric({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon: ReactNode;
}) {
  return (
    <div className="metric">
      <div className="metric-label">
        {label}
        {icon}
      </div>
      <strong key={value} className="fade-number">
        {value}
      </strong>
      <small>{sub}</small>
    </div>
  );
}
