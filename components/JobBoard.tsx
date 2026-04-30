"use client";

import { useDeferredValue, useMemo, useState } from "react";
import type { Job } from "@/types";
import { JobCard } from "./JobCard";
import { RedFlagBadge } from "./RedFlagBadge";

type JobBoardProps = {
  jobs: Job[];
  eduMode: boolean;
  onOpenTask: (job: Job) => void;
  canAccessTask: boolean;
};

export function JobBoard({ jobs, eduMode, onOpenTask, canAccessTask }: JobBoardProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const deferredSearch = useDeferredValue(search);

  const categories = useMemo(
    () => Array.from(new Set(jobs.map((job) => job.category))).sort(),
    [jobs],
  );

  const filteredJobs = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    return jobs
      .filter((job) => category === "all" || job.category === category)
      .filter((job) => {
        if (!query) return true;
        return [job.title, job.category, job.description, String(job.pay), job.dueDate, job.field]
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [category, deferredSearch, jobs]);

  return (
    <section id="jobs" className="py-16 md:py-24">
      <div className="mx-auto w-[min(1180px,calc(100%-2rem))]">
        <div className="mb-7 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="w-fit rounded-full border border-leaf/20 bg-leaf/10 px-3 py-1 text-xs font-black uppercase tracking-[0.13em] text-leaf">
              Public job board
            </p>
            <h2 className="mt-3 font-display text-5xl font-black leading-none tracking-[-0.04em] md:text-6xl">
              Fake writing assignments
            </h2>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="grid gap-1 text-xs font-black uppercase tracking-wider text-muted">
              Search
              <input
                className="w-full rounded-2xl border border-ink/15 bg-white/80 px-4 py-3 text-base font-medium normal-case tracking-normal text-ink outline-none focus:border-leaf focus:ring-4 focus:ring-leaf/10"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title, category, pay..."
                type="search"
                value={search}
              />
            </label>

            <label className="grid gap-1 text-xs font-black uppercase tracking-wider text-muted">
              Category
              <select
                className="w-full rounded-2xl border border-ink/15 bg-white/80 px-4 py-3 text-base font-medium normal-case tracking-normal text-ink outline-none focus:border-leaf focus:ring-4 focus:ring-leaf/10"
                onChange={(event) => setCategory(event.target.value)}
                value={category}
              >
                <option value="all">All categories</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          {["Verified client pool", "Daily payouts", "2,418 active writers"].map((signal) => (
            <span key={signal} className="rounded-full bg-ink px-4 py-2 text-sm font-black text-white">
              {signal}
            </span>
          ))}
          <RedFlagBadge eduMode={eduMode}>
            Trust numbers are shown without proof or verifiable source.
          </RedFlagBadge>
        </div>

        {filteredJobs.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                canAccessTask={canAccessTask}
                eduMode={eduMode}
                job={job}
                onOpenTask={onOpenTask}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-[1.4rem] border border-dashed border-ink/15 p-8 text-center text-muted">
            No assignments match your search yet.
          </p>
        )}
      </div>
    </section>
  );
}
