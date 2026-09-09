import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface DropdownProps {
  options: SelectOption[];
  value?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  searchable?: boolean;
  maxHeight?: string;
}

export const Dropdown = ({
  options,
  value,
  placeholder = 'Select...',
  onChange,
  disabled = false,
  error = false,
  className = '',
  searchable = false,
  maxHeight = '200px',
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`input ${error ? 'input-error' : ''} justify-between ${!value && 'text-text-muted'} `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={placeholder}
      >
        <span>{selectedOption?.label || placeholder}</span>
        <ChevronDown className={`w-5 h-5 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-xl bg-white border border-border shadow-lg overflow-hidden">
          {searchable && (
            <div className="p-2 border-b border-border">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onClick={e => e.stopPropagation()}
                className="input py-2 text-sm"
                autoFocus
              />
            </div>
          )}
          <div className="max-h-[200px] overflow-y-auto" style={{ maxHeight }}>
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-text-muted">No options found</div>
            ) : (
              filteredOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    if (!option.disabled) {
                      onChange(option.value);
                      setIsOpen(false);
                    }
                  }}
                  disabled={option.disabled}
                  className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                    option.value === value
                      ? 'bg-primary-bg text-primary font-medium'
                      : 'text-text hover:bg-gray-50'
                  } ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  role="option"
                  aria-selected={option.value === value}
                >
                  <div className="flex items-center gap-2">
                    {option.icon && <span>{option.icon}</span>}
                    <span>{option.label}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface MultiSelectProps {
  options: SelectOption[];
  value: string[];
  placeholder?: string;
  onChange: (values: string[]) => void;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  maxHeight?: string;
  maxSelections?: number;
}

export const MultiSelect = ({
  options,
  value,
  placeholder = 'Select options...',
  onChange,
  disabled = false,
  error = false,
  className = '',
  maxHeight = '200px',
  maxSelections,
}: MultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (optionValue: string) => {
    if (disabled) return;
    const newValues = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    if (maxSelections && newValues.length > maxSelections) return;
    onChange(newValues);
  };

  const selectedOptions = options.filter(opt => value.includes(opt.value));

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`input ${error ? 'input-error' : ''} justify-between min-h-[44px] ${value.length === 0 && 'text-text-muted'}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={placeholder}
      >
        <div className="flex flex-wrap gap-1.5 flex-1">
          {selectedOptions.length > 0 ? (
            selectedOptions.map(option => (
              <span
                key={option.value}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-bg text-primary text-xs font-medium"
              >
                {option.label}
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); toggleOption(option.value); }}
                  className="p-0.5 rounded hover:bg-primary/20"
                  aria-label={`Remove ${option.label}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          ) : (
            <span>{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-xl bg-white border border-border shadow-lg overflow-hidden">
          <div className="p-2 border-b border-border">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onClick={e => e.stopPropagation()}
              className="input py-2 text-sm"
              autoFocus
            />
          </div>
          <div className="max-h-[200px] overflow-y-auto" style={{ maxHeight }}>
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-text-muted">No options found</div>
            ) : (
              filteredOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => !option.disabled && toggleOption(option.value)}
                  disabled={!!(option.disabled || (maxSelections && value.length >= maxSelections && !value.includes(option.value)))}
                  className={`w-full px-3 py-2 text-left text-sm transition-colors flex items-center gap-2 ${
                    value.includes(option.value)
                      ? 'bg-primary-bg text-primary font-medium'
                      : 'text-text hover:bg-gray-50'
                  } ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  role="option"
                  aria-selected={value.includes(option.value)}
                >
                  <input
                    type="checkbox"
                    checked={value.includes(option.value)}
disabled={!!(option.disabled || (maxSelections && value.length >= maxSelections && !value.includes(option.value)))}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                    readOnly
                  />
                  {option.icon && <span>{option.icon}</span>}
                  <span>{option.label}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};