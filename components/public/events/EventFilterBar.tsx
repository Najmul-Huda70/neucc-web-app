"use client";

import Button from "@/components/ui/Button";
import SearchInput from "@/components/ui/SearchInput";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const eventGroups = [
  { value: "WORKSHOP", label: "Workshop" },
  { value: "SEMINAR", label: "Seminar" },
  { value: "CONFERENCE", label: "Conference" },
  { value: "CONTEST", label: "Contest" },
  { value: "OTHER", label: "Others" },
];

const statusOptions = [
  { value: "ALL", label: "All Time" },
  { value: "UPCOMING", label: "Upcoming" },
  { value: "PAST", label: "Past" },
];

type Props = {
  initialSearch: string;
  initialType: string;
  initialStatus: string;
};

export default function EventFilterBar({ initialSearch, initialType, initialStatus }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateQuery(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div className="space-y-5">
      {/* Header with Reusable Search Input */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl flex items-center gap-2">
          Events {isPending && <span className="text-xs font-normal text-(--text-muted) animate-pulse">Loading...</span>}
        </h1>

        {/* Reusable Search Input Component */}
        <SearchInput
          initialValue={initialSearch}
          placeholder="Search events..."
          paramName="search"
        />
      </div>

      {/* Filter Buttons Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Type Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => updateQuery("type", "ALL")}
            className={
              initialType === "ALL"
                ? "bg-(--btn-primary-bg) text-(--btn-primary-text)"
                : "bg-(--card-bg) text-(--text-primary) border border-(--border-color) hover:bg-(--card-hover) hover:border-(--btn-primary-bg)"
            }
          >
            All Types
          </Button>

          {eventGroups.map((group) => (
            <Button
              key={group.value}
              type="button"
              size="sm"
              onClick={() => updateQuery("type", group.value)}
              className={`capitalize ${
                initialType === group.value
                  ? "bg-(--btn-primary-bg) text-(--btn-primary-text)"
                  : "bg-(--card-bg) text-(--text-primary) border border-(--border-color) hover:bg-(--card-hover) hover:border-(--btn-primary-bg)"
              }`}
            >
              {group.label}
            </Button>
          ))}
        </div>

        {/* Status Filter (All/Upcoming/Past) */}
        <div className="flex flex-wrap gap-2 sm:justify-end">
          {statusOptions.map((status) => (
            <Button
              key={status.value}
              type="button"
              size="sm"
              onClick={() => updateQuery("status", status.value)}
              className={
                initialStatus === status.value
                  ? "bg-(--btn-primary-bg) text-(--btn-primary-text)"
                  : "bg-(--card-bg) text-(--text-primary) border border-(--border-color) hover:bg-(--card-hover) hover:border-(--btn-primary-bg)"
              }
            >
              {status.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}