"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";

type SearchInputProps = {
  initialValue: string;
  placeholder?: string;
  paramName?: string; // jemon: "search", "query", etc.
  className?: string;
};

export default function SearchInput({
  initialValue,
  placeholder = "Search...",
  paramName = "search",
  className = "w-full sm:w-56 lg:w-72",
}: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(initialValue);

  // URL-er value change hole local state update korar jonno
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setValue(val);

    const params = new URLSearchParams(searchParams.toString());
    if (val.trim()) {
      params.set(paramName, val);
    } else {
      params.delete(paramName);
    }

    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div className={`relative ${className}`}>
      <label className="group relative block w-full">
        <span className="sr-only">{placeholder}</span>
        <Search
          size={15}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted) transition group-focus-within:text-(--btn-primary-bg)"
        />
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full rounded-md border border-(--border-color) bg-(--card-bg) py-2.5 pl-10 pr-8 text-xs placeholder:text-(--text-muted) outline-none transition focus:border-(--btn-primary-bg) focus:ring-4 focus:ring-(--btn-primary-bg)/10"
        />
      </label>
      {isPending && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-(--text-muted) animate-pulse">
          ...
        </span>
      )}
    </div>
  );
}