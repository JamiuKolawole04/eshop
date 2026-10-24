"use client";

import { useEffect, useId, useRef, useState, Fragment } from "react";
import type { SubmitEvent, KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Image as ImageIcon,
  Search,
  TriangleAlert,
  X,
} from "lucide-react";

import { SearchProductType } from "@packages/ui";
import useProductSearch from "@/hooks/use-product-search";

const MIN_TERM_LENGTH = 2;

const HIGHLIGHT_CLASS =
  "bg-[#dbeafe] text-[#0b57b5] px-0 rounded-[2px] font-semibold";

const HIGHLIGHT_PATTERN = /[.*+?^${}()|[\]\\]/g;

const Highlight = ({ text, term }: { text: string; term: string }) => {
  const query = term.trim();

  if (!query) return <>{text}</>;

  const escapedQuery = query.replace(HIGHLIGHT_PATTERN, "\\$&");
  const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));
  const normalizedQuery = query.toLowerCase();

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === normalizedQuery ? (
          <mark key={index} className={HIGHLIGHT_CLASS}>
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
};

const LoadingRows = () => (
  <Fragment>
    {Array.from({ length: 3 }).map((_, index) => (
      <li
        key={index}
        role="presentation"
        className="flex min-h-[64px] items-center gap-3 px-3 py-2"
      >
        <div className="h-12 w-12 shrink-0 animate-pulse rounded-md bg-slate-100 motion-reduce:animate-none" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100 motion-reduce:animate-none" />
          <div className="h-2.5 w-1/2 animate-pulse rounded bg-slate-100 motion-reduce:animate-none" />
        </div>
      </li>
    ))}
  </Fragment>
);

export const SearchBox = () => {
  const router = useRouter();
  const baseId = useId();
  const listboxId = `${baseId}-search-listbox`;
  const getOptionId = (index: number) => `${baseId}-search-option-${index}`;

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<Array<HTMLLIElement | null>>([]);

  const [value, setValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const {
    term,
    results,
    isLoading,
    isFetching,
    isDebouncing,
    isError,
    refetch,
  } = useProductSearch(value);

  const trimmedValue = value.trim();
  const canSearch = trimmedValue.length >= MIN_TERM_LENGTH;
  const showDropdown = isOpen && canSearch;
  const activeProduct =
    activeIndex >= 0 && activeIndex < results.length
      ? results[activeIndex]
      : undefined;

  const isSettling = isDebouncing || isLoading;
  const showSkeletons =
    !isError && results.length === 0 && (isSettling || isFetching);
  const showError = isError && !isFetching;
  const showEmpty = !showError && !showSkeletons && results.length === 0;
  const showResults = !showError && results.length > 0;
  const showProgress = !showSkeletons && (isFetching || isDebouncing);

  const closeDropdown = () => {
    setIsOpen(false);
    setActiveIndex(-1);
  };

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    setActiveIndex(-1);
  }, [term]);

  useEffect(() => {
    if (activeIndex < 0) return;

    optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const handleSelect = (product: SearchProductType) => {
    closeDropdown();
    inputRef.current?.blur();
    router.push(`/product/${product.slug}`);
  };

  const goToResults = () => {
    const query = value.trim();

    if (query.length < MIN_TERM_LENGTH) return;

    closeDropdown();
    inputRef.current?.blur();
    router.push(`/products?q=${encodeURIComponent(query)}`);
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    goToResults();
  };

  const handleChange = (nextValue: string) => {
    setValue(nextValue);
    setActiveIndex(-1);
    setIsOpen(nextValue.trim().length >= MIN_TERM_LENGTH);
  };

  const handleClear = () => {
    handleChange("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();

      if (!canSearch) return;

      if (!showDropdown) {
        setIsOpen(true);
        setActiveIndex(results.length > 0 ? 0 : -1);
        return;
      }

      if (results.length === 0) return;

      setActiveIndex((prev) => (prev + 1) % results.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      if (!canSearch) return;

      if (!showDropdown) {
        setIsOpen(true);
        setActiveIndex(results.length > 0 ? results.length - 1 : -1);
        return;
      }

      if (results.length === 0) return;

      setActiveIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1));
      return;
    }

    if (event.key === "Enter") {
      if (showDropdown && activeProduct) {
        event.preventDefault();
        handleSelect(activeProduct);
      }

      return;
    }

    if (event.key === "Escape") {
      if (showDropdown) event.preventDefault();

      closeDropdown();
      return;
    }

    if (event.key === "Tab") {
      closeDropdown();
    }
  };

  return (
    <div
      ref={containerRef}
      className="order-last md:order-none w-full md:w-auto md:flex-1 md:max-w-[600px] relative"
    >
      <form role="search" onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(event) => handleChange(event.target.value)}
          onFocus={() => {
            if (canSearch) setIsOpen(true);
          }}
          onBlur={closeDropdown}
          onKeyDown={handleKeyDown}
          placeholder="Search for products..."
          maxLength={80}
          autoComplete="off"
          role="combobox"
          aria-label="Search for products"
          aria-expanded={showDropdown}
          aria-controls={showDropdown ? listboxId : undefined}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-activedescendant={
            showDropdown && activeProduct ? getOptionId(activeIndex) : undefined
          }
          className="w-full px-3 md:px-4 pr-14 font-Poppins font-medium text-base border-2 md:border-[2.5px] border-[#3489ff] outline-none h-[44px] md:h-[55px]"
        />

        {value.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-[56px] md:right-[68px] top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3489ff] motion-reduce:transition-none"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <button
          type="submit"
          aria-label="Search"
          className="w-[48px] md:w-[60px] h-[44px] md:h-[55px] cursor-pointer flex items-center justify-center bg-[#3489ff] absolute top-0 right-0"
        >
          <Search color="#fff" className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </form>

      {showDropdown && (
        <div
          onMouseDown={(event) => event.preventDefault()}
          className="absolute left-0 right-0 top-full z-[120] mt-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl"
        >
          {showProgress && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[2px] overflow-hidden bg-[#3489ff]/15"
            >
              <div className="h-full w-1/3 animate-pulse bg-[#3489ff] motion-reduce:animate-none" />
            </div>
          )}

          <div className="max-h-[70vh] overflow-y-auto overscroll-contain">
            <ul
              id={listboxId}
              role="listbox"
              aria-label="Product suggestions"
              aria-busy={showSkeletons}
              className="py-1"
            >
              {showSkeletons && <LoadingRows />}

              {showError && (
                <li role="presentation" className="px-4 py-6 text-center">
                  <TriangleAlert
                    className="mx-auto h-5 w-5 text-slate-400"
                    aria-hidden
                  />
                  <p className="mt-2 font-Poppins text-sm text-slate-600">
                    Couldn’t load suggestions.
                  </p>
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="mt-1 font-Poppins text-sm font-medium text-[#3489ff] underline underline-offset-2 hover:text-[#1f6fe0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3489ff]"
                  >
                    Try again
                  </button>
                </li>
              )}

              {showEmpty && (
                <li role="presentation" className="px-4 py-6 text-center">
                  <p className="font-Poppins text-sm text-slate-600">
                    No products found for “
                    <span className="font-medium text-slate-800">{term}</span>”
                  </p>
                  <p className="mt-1 font-Poppins text-xs text-slate-400">
                    Try a shorter or different keyword.
                  </p>
                </li>
              )}

              {showResults &&
                results.map((product, index) => (
                  <li
                    key={product.id}
                    ref={(node) => {
                      optionRefs.current[index] = node;
                    }}
                    role="option"
                    id={getOptionId(index)}
                    aria-selected={activeIndex === index}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => handleSelect(product)}
                    className={`flex min-h-[64px] cursor-pointer items-center gap-3 px-3 py-2 transition-colors duration-150 motion-reduce:transition-none ${
                      activeIndex === index ? "bg-[#eef5ff]" : "bg-white"
                    }`}
                  >
                    {product.images?.[0]?.url ? (
                      <img
                        src={product.images[0].url}
                        alt=""
                        width={48}
                        height={48}
                        loading="lazy"
                        className="h-12 w-12 shrink-0 rounded-md object-cover"
                      />
                    ) : (
                      <div
                        aria-hidden
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-400"
                      >
                        <ImageIcon className="h-5 w-5" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <p className="min-w-0 flex-1 truncate font-Poppins text-sm font-medium text-slate-800">
                          <Highlight text={product.title} term={term} />
                        </p>
                        <p className="shrink-0 whitespace-nowrap font-Poppins text-sm leading-none">
                          <span className="font-bold text-slate-900">
                            ${product.sale_price}
                          </span>
                          <span className="ml-1.5 text-xs text-slate-400 line-through">
                            ${product.regular_price}
                          </span>
                        </p>
                      </div>
                      <p className="mt-1 line-clamp-1 font-Poppins text-xs text-slate-500">
                        <Highlight
                          text={product.short_description}
                          term={term}
                        />
                      </p>
                    </div>
                  </li>
                ))}
            </ul>

            <Link
              href={`/products?q=${encodeURIComponent(trimmedValue)}`}
              onClick={closeDropdown}
              className="group flex items-center justify-between gap-2 border-t border-slate-200 px-3 py-3 font-Poppins text-sm font-medium text-slate-500 transition-colors duration-150 hover:bg-[#f5f9ff] hover:text-[#3489ff] motion-reduce:transition-none"
            >
              <span className="min-w-0 truncate">
                See all results for “
                <span className="text-slate-800 group-hover:text-[#3489ff]">
                  {trimmedValue}
                </span>
                ”
              </span>
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
