"use client";

import type { Job, TaskApplication, WriterUser } from "@/types";

type AdminApplicationsPanelProps = {
  jobs: Job[];
  writers: WriterUser[];
  applications: TaskApplication[];
};

export function AdminApplicationsPanel({ jobs, writers, applications }: AdminApplicationsPanelProps) {
  const jobMap = new Map(jobs.map((job) => [job.id, job]));
  const userMap = new Map(writers.map((writer) => [writer.id, writer]));

  return (
    <section className="py-10">
      <div className="mx-auto w-[min(1180px,calc(100%-2rem))] rounded-4xl border border-ink/15 bg-white/75 p-5 shadow-soft">
        <h3 className="font-display text-4xl font-black">Admin application monitor</h3>
        {applications.length === 0 ? (
          <p className="mt-3 text-muted">No applications yet.</p>
        ) : (
          <div className="mt-4 grid gap-3">
            {applications.map((application) => {
              const job = jobMap.get(application.jobId);
              const writer = userMap.get(application.userId);
              return (
                <article key={application.id} className="rounded-2xl border border-ink/15 bg-white p-4">
                  <p className="font-black">{job?.title ?? "Unknown task"}</p>
                  <p className="text-sm text-muted">
                    Writer: {writer?.name ?? "Unknown"} ({writer?.email ?? "n/a"})
                  </p>
                  <p className="text-sm text-muted">
                    Status: {application.status} | Updated: {new Date(application.updatedAt).toLocaleString()}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
