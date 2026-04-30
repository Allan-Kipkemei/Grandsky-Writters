"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { WriterDashboard } from "@/components/WriterDashboard";
import { loadApplications, loadJobs, loadSession, loadWriters, saveApplications } from "@/lib/storage";
import { exportDashboardCsv } from "@/lib/export";
import type { Job, TaskApplication, TaskStatus, WriterUser } from "@/types";

export function WriterDashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [writers, setWriters] = useState<WriterUser[]>([]);
  const [applications, setApplications] = useState<TaskApplication[]>([]);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);

  useEffect(() => {
    setJobs(loadJobs());
    setWriters(loadWriters());
    setApplications(loadApplications());
    setSessionUserId(loadSession());
  }, []);

  const currentUser = writers.find((user) => user.id === sessionUserId) ?? null;

  function updateApplicationStatus(applicationId: string, status: TaskStatus) {
    const now = new Date().toISOString();
    const next = applications.map((application) => {
      if (application.id !== applicationId || application.status === status) return application;
      return {
        ...application,
        status,
        updatedAt: now,
        statusHistory: [...application.statusHistory, { status, at: now }],
      };
    });
    setApplications(next);
    saveApplications(next);
  }

  return (
    <>
      <SiteHeader />
      <main id="main" className="py-10">
        {currentUser ? (
          <>
            <WriterDashboard
              applications={applications.filter((a) => a.userId === currentUser.id)}
              jobs={jobs}
              onStatusChange={updateApplicationStatus}
              userName={currentUser.name}
            />
            <section className="pb-10">
              <div className="mx-auto w-[min(1180px,calc(100%-2rem))] rounded-3xl border border-ink/15 bg-white/75 p-4 shadow-soft">
                <h4 className="font-display text-3xl font-black">Export my activity</h4>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    className="rounded-full bg-ink px-5 py-3 font-black text-white"
                    onClick={() =>
                      exportDashboardCsv(
                        applications.filter((a) => a.userId === currentUser.id),
                        jobs,
                        writers,
                      )
                    }
                    type="button"
                  >
                    Download CSV
                  </button>
                  <button
                    className="rounded-full border border-ink/15 bg-white px-5 py-3 font-black"
                    onClick={() => window.print()}
                    type="button"
                  >
                    Export PDF (Print)
                  </button>
                </div>
              </div>
            </section>
          </>
        ) : (
          <section className="mx-auto w-[min(1180px,calc(100%-2rem))] rounded-3xl border border-ink/15 bg-white/75 p-6 shadow-soft">
            <h1 className="font-display text-4xl font-black">Writer Dashboard</h1>
            <p className="mt-3 text-muted">Please login on the home page first to view your applied tasks.</p>
            <a className="mt-5 inline-flex rounded-full bg-leaf px-5 py-3 font-black text-white" href="/">
              Go to Home
            </a>
          </section>
        )}
      </main>
    </>
  );
}
