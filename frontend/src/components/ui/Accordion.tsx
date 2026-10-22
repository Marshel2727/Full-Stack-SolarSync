'use client';

import React, { useState, useId } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  badge?: string;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpenId?: string;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  defaultOpenId,
  className = '',
}) => {
  const prefix = useId();
  const [openIds, setOpenIds] = useState<string[]>(defaultOpenId ? [defaultOpenId] : []);

  const toggle = (id: string) => {
    if (allowMultiple) {
      setOpenIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setOpenIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        return (
          <div
            key={item.id}
            className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
              isOpen ? 'border-primary/40 bg-white shadow-sm ring-1 ring-primary/10' : 'border-surface-border bg-white hover:border-slate-300'
            }`}
          >
            <button
              type="button"
              id={`${prefix}-${item.id}-trigger`}
              aria-expanded={isOpen}
              aria-controls={`${prefix}-${item.id}-panel`}
              onClick={() => toggle(item.id)}
              className="flex items-center justify-between w-full p-5 text-left font-medium text-slateText focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              <div className="flex items-center gap-3 pr-4">
                <span className="font-semibold text-base font-heading">{item.title}</span>
                {item.badge && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    {item.badge}
                  </span>
                )}
              </div>
              <ChevronDown
                className={`w-5 h-5 text-slateText-muted transition-transform duration-300 ease-out shrink-0 ${
                  isOpen ? 'transform rotate-180 text-primary' : ''
                }`}
              />
            </button>
            <div
              id={`${prefix}-${item.id}-panel`}
              role="region"
              aria-labelledby={`${prefix}-${item.id}-trigger`}
              aria-hidden={!isOpen}
              className={`grid transition-[grid-template-rows,opacity] duration-250 ease-out ${
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-5 pb-5 pt-1 text-sm text-slateText-muted border-t border-slate-100 leading-relaxed">
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
