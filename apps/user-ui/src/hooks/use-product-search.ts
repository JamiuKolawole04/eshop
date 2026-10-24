import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { SearchProductsResponseType } from "@packages/ui";
import axiosInstance from "@/utils/axiosInstance";
import { isPublic } from "@/utils/protected";

const DEBOUNCE_MS = 280;
const MIN_TERM_LENGTH = 2;
const MAX_TERM_LENGTH = 80;

const useDebouncedValue = <T>(value: T, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delay);

    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debouncedValue;
};

const fetchSearchResults = async (term: string, signal: AbortSignal) => {
  const response = await axiosInstance.get<SearchProductsResponseType>(
    "/api/products/search-products",
    {
      ...isPublic,
      params: { q: term },
      signal,
    },
  );

  return response.data.products;
};

const useProductSearch = (input: string) => {
  const term = useDebouncedValue(input.trim(), DEBOUNCE_MS);
  const isSearchable =
    term.length >= MIN_TERM_LENGTH && term.length <= MAX_TERM_LENGTH;

  const { data, isPending, isFetching, isError, refetch } = useQuery({
    queryKey: ["product-search", term],
    queryFn: ({ signal }) => fetchSearchResults(term, signal),
    enabled: isSearchable,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
    retry: 1,
  });

  return {
    term,
    results: data ?? [],
    isLoading: isSearchable && isPending,
    isFetching,
    isDebouncing: input.trim() !== term,
    isError,
    refetch,
  };
};

export default useProductSearch;
