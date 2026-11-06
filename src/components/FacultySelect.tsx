import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, Building, X } from 'lucide-react';
import { UTM_FACULTIES, FacultyOption } from '../data/mockData';

interface FacultySelectProps {
  value: string;
  onChange: (fullName: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

export const FacultySelect: React.FC<FacultySelectProps> = ({
  value,
  onChange,
  label,
  required = false,
  className = '',
  placeholder = 'Select your faculty...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Find currently selected faculty object
  const currentOption = useMemo(() => {
    return UTM_FACULTIES.find(
      (f) =>
        f.fullName.toLowerCase() === (value || '').toLowerCase() ||
        f.abbr.toLowerCase() === (value || '').toLowerCase() ||
        (value || '').toLowerCase().includes(f.abbr.toLowerCase())
    ) || UTM_FACULTIES[4]; // Default to FC if empty/unmatched
  }, [value]);

  // Filter faculties by query (searches full name and abbreviation)
  const filteredFaculties = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return UTM_FACULTIES;
    return UTM_FACULTIES.filter(
      (f) =>
        f.fullName.toLowerCase().includes(q) ||
        f.abbr.toLowerCase().includes(q) ||
        f.name.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleSelect = (fac: FacultyOption) => {
    onChange(fac.fullName);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block font-bold text-slate-700 text-xs mb-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-medium flex items-center justify-between gap-2 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-left transition-all"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Building className="w-4 h-4 text-slate-400 shrink-0" />
          {currentOption ? (
            <div className="flex items-center gap-1.5 min-w-0 truncate">
              <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px] shrink-0 border border-blue-200">
                {currentOption.abbr}
              </span>
              <span className="truncate text-slate-800 text-xs sm:text-sm font-semibold">
                {currentOption.fullName}
              </span>
            </div>
          ) : (
            <span className="text-slate-400 text-xs">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-600' : ''
          }`}
        />
      </button>

      {/* Searchable Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-fadeIn">
          {/* Search Header */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/80">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search faculty name or abbreviation (e.g. FC, MJIIT, AI)..."
                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* List of 13 Faculties */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin text-left">
            {filteredFaculties.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No faculty found matching "{searchQuery}"
              </div>
            ) : (
              filteredFaculties.map((fac, idx) => {
                const isSelected =
                  currentOption?.fullName.toLowerCase() === fac.fullName.toLowerCase();
                return (
                  <button
                    key={fac.abbr}
                    type="button"
                    onClick={() => handleSelect(fac)}
                    className={`w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-blue-800 font-bold'
                        : 'hover:bg-slate-50 text-slate-700 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-slate-400 text-[10px] w-4 text-right shrink-0">
                        {idx + 1}.
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {fac.abbr}
                      </span>
                      <span className="truncate">{fac.name}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer note indicating 13 official faculties */}
          <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Official UTM Faculties</span>
            <span>{UTM_FACULTIES.length} Options</span>
          </div>
        </div>
      )}
    </div>
  );
};
