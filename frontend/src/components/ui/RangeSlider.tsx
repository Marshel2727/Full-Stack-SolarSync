import React from 'react';

interface RangeSliderProps {
  label?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  helperText?: string;
  markers?: { value: number; label: string }[];
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  helperText,
  markers,
}) => {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        {label && <label className="text-sm font-medium text-slateText">{label}</label>}
        <div className="inline-flex items-baseline gap-1 px-3 py-1 bg-primary/10 border border-primary/20 rounded-lg text-primary font-bold text-base font-sans">
          <span>{value.toLocaleString('id-ID')}</span>
          {unit && <span className="text-xs font-medium text-primary-light">{unit}</span>}
        </div>
      </div>

      <div className="relative flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          style={{
            background: `linear-gradient(to right, #064E3B 0%, #064E3B ${percentage}%, #E2E8F0 ${percentage}%, #E2E8F0 100%)`
          }}
        />
      </div>

      {markers && markers.length > 0 && (
        <div className="flex justify-between text-[11px] text-slateText-muted font-medium px-1">
          {markers.map((m) => (
            <span
              key={m.value}
              className="cursor-pointer hover:text-primary transition-colors"
              onClick={() => onChange(m.value)}
            >
              {m.label}
            </span>
          ))}
        </div>
      )}

      {helperText && <p className="text-xs text-slateText-muted">{helperText}</p>}
    </div>
  );
};
