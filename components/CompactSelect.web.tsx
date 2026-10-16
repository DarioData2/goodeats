import { useId } from 'react';
import type { SelectProps } from './CompactSelect';
import { colors, ui } from '../constants/theme';

// Native HTML select provides arrow-key navigation and one tab stop per field.
export function CompactSelect({ label, values, value, onChange, disabled }: SelectProps) {
  const id = useId();
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0, fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
    <label htmlFor={id} style={{ color: colors.ink, fontSize: 15, fontWeight: 700 }}>{label}</label>
    <select id={id} value={value} disabled={disabled} onChange={event => onChange(event.target.value)} style={{ width: '100%', minHeight: 48, padding: 12, border: `1px solid ${colors.controlBorder}`, borderRadius: ui.radius.control, background: colors.surface, color: colors.ink, font: 'inherit', fontSize: 16 }}>
      {values.map(option => <option key={option} value={option}>{option}</option>)}
    </select>
  </div>;
}
