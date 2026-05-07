import { useState, useRef } from 'react';

interface Props<T> {
  value: string;
  onChange: (val: string) => void;
  onSelect: (item: T) => void;
  options: T[];
  getLabel: (item: T) => string;
  getSublabel?: (item: T) => string;
  placeholder?: string;
  disabled?: boolean;
}

export default function AutocompleteInput<T,>({
  value, onChange, onSelect, options, getLabel, getSublabel, placeholder, disabled,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filtered = options
    .filter((o) => getLabel(o).toLowerCase().includes(value.toLowerCase()))
    .slice(0, 8);

  const select = (item: T) => {
    onSelect(item);
    onChange('');
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) { if (e.key === 'ArrowDown') setOpen(true); return; }
    if (e.key === 'ArrowDown') { setIdx((i) => Math.min(i + 1, filtered.length - 1)); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { setIdx((i) => Math.max(i - 1, 0)); e.preventDefault(); }
    else if (e.key === 'Enter' && filtered[idx]) { select(filtered[idx]); e.preventDefault(); }
    else if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <input
        value={value}
        onChange={(e) => { onChange(e.target.value); setIdx(0); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => { closeTimer.current = setTimeout(() => setOpen(false), 150); }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        style={{ width: '100%' }}
      />
      {open && filtered.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 6, marginTop: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          maxHeight: 280, overflowY: 'auto',
        }}>
          {filtered.map((item, i) => (
            <div
              key={i}
              onMouseDown={(e) => { e.preventDefault(); if (closeTimer.current) clearTimeout(closeTimer.current); select(item); }}
              onMouseEnter={() => setIdx(i)}
              style={{
                padding: '6px 10px', cursor: 'pointer',
                background: i === idx ? 'var(--bg-hover, rgba(255,255,255,0.06))' : 'transparent',
              }}
            >
              <div style={{ fontSize: 13 }}>{getLabel(item)}</div>
              {getSublabel && (
                <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 1 }}>
                  {getSublabel(item)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
