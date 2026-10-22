import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  id: string | number;
  label: string;
  description?: string;
}

interface ProgressStepperProps {
  steps: Step[];
  currentStep: number; // 0-indexed or 1-indexed
  onStepClick?: (stepIndex: number) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  orientation = 'horizontal',
  className = '',
}) => {
  if (orientation === 'vertical') {
    return (
      <div className={`space-y-6 ${className}`}>
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;
          const isPending = idx > currentStep;

          return (
            <div key={step.id} className="relative flex items-start gap-4">
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div
                  className={`absolute left-4 top-8 -bottom-6 w-0.5 transition-colors duration-300 ${
                    idx < currentStep ? 'bg-primary' : 'bg-slate-200'
                  }`}
                />
              )}

              {/* Step indicator */}
              <button type="button" disabled={!onStepClick || idx > currentStep}
                aria-label={`Langkah ${idx + 1}: ${step.label}`} aria-current={isCurrent ? "step" : undefined}
                onClick={() => onStepClick && onStepClick(idx)}
                className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full font-semibold text-xs transition-all duration-300 ${
                  onStepClick ? 'cursor-pointer' : ''
                } ${
                  isCompleted
                    ? 'bg-primary text-white shadow-sm ring-4 ring-primary/10'
                    : isCurrent
                    ? 'bg-solar text-primary-forest ring-4 ring-solar/30 animate-pulse font-bold'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
              </button>

              {/* Text */}
              <div className="flex-1 pt-0.5">
                <p
                  className={`text-sm font-semibold transition-colors ${
                    isCurrent ? 'text-primary' : isCompleted ? 'text-slateText' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-xs text-slateText-muted mt-0.5 leading-relaxed">{step.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Desktop Horizontal Stepper */}
      <div className="hidden sm:flex items-start relative">
        {/* Equal-width steps put each center half a column from the edges. */}
        {steps.length > 1 && (
          <div
            aria-hidden="true"
            className="absolute top-[1.125rem] h-0.5 bg-slate-200 -translate-y-1/2 pointer-events-none"
            style={{ left: `${50 / steps.length}%`, right: `${50 / steps.length}%` }}
          >
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${Math.min(1, Math.max(0, currentStep / (steps.length - 1))) * 100}%` }}
            />
          </div>
        )}

        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <button type="button" disabled={!onStepClick || idx > currentStep}
              aria-current={isCurrent ? "step" : undefined}
              key={step.id}
              onClick={() => onStepClick && onStepClick(idx)}
              className={`relative z-10 flex min-w-0 flex-1 flex-col items-center group ${
                onStepClick ? 'cursor-pointer' : ''
              }`}
            >
              <div
                className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-primary text-white ring-4 ring-primary/10 shadow-sm'
                    : isCurrent
                    ? 'bg-solar text-primary-forest ring-4 ring-solar/30 shadow-solar-glow'
                    : 'bg-white text-slate-400 border-2 border-slate-200'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
              </div>
              <span
                className={`w-full px-2 text-center text-xs font-semibold mt-2 break-words transition-colors ${
                  isCurrent ? 'text-primary font-bold' : isCompleted ? 'text-slateText' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile Stepper Summary */}
      <div className="sm:hidden flex items-center justify-between px-2 py-3 bg-surface-muted rounded-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
            {currentStep + 1}
          </div>
          <div>
            <p className="text-xs text-slateText-muted uppercase tracking-wider">Langkah {currentStep + 1} dari {steps.length}</p>
            <p className="text-sm font-bold text-slateText">{steps[currentStep]?.label}</p>
          </div>
        </div>
        <div className="flex gap-1">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full ${
                idx === currentStep ? 'bg-solar w-4' : idx < currentStep ? 'bg-primary' : 'bg-slate-300'
              } transition-all duration-300`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
