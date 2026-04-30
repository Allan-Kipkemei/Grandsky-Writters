"use client";

import { formatKsh } from "@/lib/format";
import type { Job, TaskApplication, TaskStatus } from "@/types";

type WriterDashboardProps = {
  userName: string;
  applications: TaskApplication[];
  jobs: Job[];
  onStatusChange: (applicationId: string, status: TaskStatus) => void;
};

export function WriterDashboard({
  userName,
  applications,
  jobs,
  onStatusChange,
}: WriterDashboardProps) {
  const jobMap = new Map(jobs.map((job) => [job.id, job]));

  return (
    <section id="writer-dashboard" className="py-16">
      <div className="mx-auto w-[min(1180px,calc(100%-2rem))]">
        <div className="mb-6">
          <p className="w-fit rounded-full border border-leaf/20 bg-leaf/10 px-3 py-1 text-xs font-black uppercase tracking-[0.13em] text-leaf">
            Writer dashboard
          </p>
          <h2 className="mt-3 font-display text-5xl font-black leading-none tracking-[-0.04em] md:text-6xl">
            {userName}&apos;s applied tasks
          </h2>
        </div>

        {applications.length === 0 ? (
          <p className="rounded-[1.4rem] border border-dashed border-ink/15 bg-white/70 p-6 text-muted">
            You have not applied to any tasks yet. Open a task and click apply.
          </p>
        ) : (
          <div className="grid gap-4">
            {applications.map((application) => {
              const job = jobMap.get(application.jobId);
              if (!job) return null;

              return (
                <article
                  key={application.id}
                  className="rounded-[1.4rem] border border-ink/15 bg-white/75 p-5 shadow-soft"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-display text-3xl font-black leading-none tracking-[-0.04em]">
                      {job.title}
                    </h3>
                    <span className="rounded-full bg-ink px-3 py-1 text-xs font-black uppercase text-white">
                      {application.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm font-bold text-muted">
                    <span>Due: {job.dueDate}</span>
                    <span>Pay: {formatKsh(job.pay)}</span>
                    <span>Field: {job.field}</span>
                    <span>Applied: {new Date(application.appliedAt).toLocaleString()}</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <StatusButton
                      active={application.status === "open"}
                      label="Open"
                      onClick={() => onStatusChange(application.id, "open")}
                    />
                    <StatusButton
                      active={application.status === "in_review"}
                      label="In review"
                      onClick={() => onStatusChange(application.id, "in_review")}
                    />
                    <StatusButton
                      active={application.status === "submitted"}
                      label="Submitted"
                      onClick={() => onStatusChange(application.id, "submitted")}
                    />
                  </div>

                  <div className="mt-4 rounded-2xl bg-[#fffaf0] p-3 text-sm">
                    <p className="font-black">Timeline</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
                      {application.statusHistory.map((entry, index) => (
                        <li key={`${application.id}-${index}`}>
                          {entry.status.replace("_", " ")} - {new Date(entry.at).toLocaleString()}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function StatusButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`rounded-full px-4 py-2 text-sm font-black ${
        active ? "bg-leaf text-white" : "border border-ink/15 bg-white"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
