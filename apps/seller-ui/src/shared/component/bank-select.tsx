"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

export type BankOption = {
  code: string;
  name: string;
};

type BankSelectProps = {
  banks: BankOption[];
  value: string | null;
  onChange: (bank: BankOption) => void;
  isLoading?: boolean;
  disabled?: boolean;
};

const BankSelect = ({
  banks,
  value,
  onChange,
  isLoading = false,
  disabled = false,
}: BankSelectProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = useMemo(
    () => banks.find((bank) => bank.code === value) ?? null,
    [banks, value],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return banks;

    return banks.filter(
      (bank) =>
        bank.name.toLowerCase().includes(term) ||
        bank.code.toLowerCase().includes(term),
    );
  }, [banks, query]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  useEffect(() => {
    if (!open) return;

    const node = listRef.current?.children[activeIndex] as
      HTMLElement | undefined;

    node?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const selectBank = (bank: BankOption) => {
    onChange(bank);
    setOpen(false);
    setQuery("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) =>
        Math.min(index + 1, Math.max(filtered.length - 1, 0)),
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const bank = filtered[activeIndex];
      if (bank) selectBank(bank);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  };

  const isDisabled = disabled || isLoading;

  return (
    <div ref={containerRef} className="relative mt-1.5">
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Bank"
        disabled={isDisabled}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-left text-sm text-white outline-none transition-colors focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className={selected ? "text-white" : "text-slate-500"}>
          {isLoading
            ? "Loading banks..."
            : (selected?.name ?? "Select your bank")}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-slate-600 bg-slate-800 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-700 px-3 py-2">
            <Search size={14} className="shrink-0 text-slate-400" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search banks..."
              aria-label="Search banks"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <ul
            ref={listRef}
            role="listbox"
            aria-label="Banks"
            className="max-h-60 overflow-y-auto py-1"
          >
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-xs text-slate-400">
                No bank found
              </li>
            )}

            {filtered.map((bank, index) => {
              const isSelected = bank.code === value;

              return (
                <li key={index + 1} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectBank(bank)}
                    className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors ${
                      index === activeIndex ? "bg-slate-700" : ""
                    } ${isSelected ? "text-blue-400" : "text-slate-200"}`}
                  >
                    <span className="truncate">{bank.name}</span>
                    <span className="flex shrink-0 items-center gap-1 text-xs text-slate-500">
                      {isSelected && (
                        <Check size={14} className="text-blue-400" />
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BankSelect;
