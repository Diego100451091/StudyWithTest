import React, { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

interface InfoButtonProps {
  content: string;
}

const InfoButton: React.FC<InfoButtonProps> = ({ content }) => {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        buttonRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-slate-400 hover:text-primary dark:text-slate-500 dark:hover:text-blue-400 transition-colors"
        aria-label="More information"
      >
        <Info className="w-4 h-4" />
      </button>
      
      {isOpen && (
        <div
          ref={tooltipRef}
          className="absolute left-0 top-6 z-50 w-64 p-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg text-xs text-slate-600 dark:text-slate-300 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200"
        >
          <div className="absolute -top-1 left-2 w-2 h-2 bg-white dark:bg-slate-700 border-l border-t border-slate-200 dark:border-slate-600 transform rotate-45"></div>
          {content}
        </div>
      )}
    </div>
  );
};

export default InfoButton;
