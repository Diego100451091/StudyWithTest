import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ 
  checked, 
  onChange, 
  label,
  disabled = false,
  className = ''
}) => {
  return (
    <label className={`flex items-center gap-2 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <div 
        className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors duration-300 ease-in-out ${
          checked 
            ? 'bg-blue-600 dark:bg-blue-500' 
            : 'bg-slate-300 dark:bg-slate-600'
        } ${disabled ? '' : 'hover:opacity-80'}`}
        onClick={(e) => {
          if (!disabled) {
            e.preventDefault();
            onChange(!checked);
          }
        }}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </div>
      {label && (
        <span className="text-sm text-slate-600 dark:text-slate-300 select-none">
          {label}
        </span>
      )}
    </label>
  );
};

export default ToggleSwitch;
