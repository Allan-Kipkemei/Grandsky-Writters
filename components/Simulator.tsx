"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { AdminApplicationsPanel } from "@/components/AdminApplicationsPanel";
import { AdminPanel } from "@/components/AdminPanel";
import { AuthPanel } from "@/components/AuthPanel";
import { EduBanner } from "@/components/EduBanner";
import { JobBoard } from "@/components/JobBoard";
import { RedFlagBadge } from "@/components/RedFlagBadge";
import { SiteHeader } from "@/components/SiteHeader";
import { TaskModal } from "@/components/TaskModal";
import { WriterDashboard } from "@/components/WriterDashboard";
import { exportDashboardCsv } from "@/lib/export";
import {
  loadApplications,
  loadJobs,
  loadMessages,
  loadPayments,
  loadSession,
  loadWriters,
  saveApplications,
  saveJobs,
  saveMessages,
  savePayments,
  saveSession,
  saveWriters,
} from "@/lib/storage";
import type { Job, NewJobInput, TaskApplication, TaskMessage, TaskStatus, WriterUser } from "@/types";

export function Simulator() {
  const [eduMode, setEduMode] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [payments, setPayments] = useState(0);
  const [writers, setWriters] = useState<WriterUser[]>([]);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [applications, setApplications] = useState<TaskApplication[]>([]);
  const [messages, setMessages] = useState<TaskMessage[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [unlockRevealed, setUnlockRevealed] = useState(false);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEduMode(params.get("edu") === "true");
    setJobs(loadJobs());
    setPayments(loadPayments());
    setWriters(loadWriters());
    setSessionUserId(loadSession());
    setApplications(loadApplications());
    setMessages(loadMessages());
  }, []);

  const currentUser = writers.find((user) => user.id === sessionUserId) ?? null;

  function createJob(input: NewJobInput) {
    const job: Job = { ...input, id: `job-${Date.now()}`, createdAt: new Date().toISOString() };
    const nextJobs = [job, ...jobs];
    setJobs(nextJobs);
    saveJobs(nextJobs);
  }

  function openTask(job: Job) {
    setSelectedJob(job);
    setUnlockRevealed(false);
  }

  function simulateUnlockFlow() {
    const next = payments + 1;
    setPayments(next);
    savePayments(next);
    setUnlockRevealed(true);
  }

  function login(email: string, password: string) {
    const user = writers.find((item) => item.email === email);
    if (!user) return "Profile not found. Register first.";
    if (user.password !== password) return "Incorrect password.";
    setSessionUserId(user.id);
    saveSession(user.id);
    return null;
  }

  function register(values: { name: string; email: string; password: string; bio: string }) {
    if (writers.some((user) => user.email === values.email)) return "Email already in use.";
    const createdUser: WriterUser = {
      id: `writer-${Date.now()}`,
      name: values.name,
      email: values.email,
      password: values.password,
      bio: values.bio,
      createdAt: new Date().toISOString(),
    };
    const nextUsers = [createdUser, ...writers];
    setWriters(nextUsers);
    saveWriters(nextUsers);
    setSessionUserId(createdUser.id);
    saveSession(createdUser.id);
    return null;
  }

  function logout() {
    setSessionUserId(null);
    saveSession(null);
  }

  function adminLogin(password: string) {
    if (password === "lecturer123") {
      setAdminLoggedIn(true);
      return null;
    }
    return "Invalid admin password.";
  }

  function applyToTask(jobId: string) {
    if (!currentUser) return;
    const exists = applications.some((a) => a.userId === currentUser.id && a.jobId === jobId);
    if (exists) return;
    const now = new Date().toISOString();
    const app: TaskApplication = {
      id: `app-${Date.now()}`,
      userId: currentUser.id,
      jobId,
      status: "open",
      appliedAt: now,
      updatedAt: now,
      statusHistory: [{ status: "open", at: now }],
    };
    const next = [app, ...applications];
    setApplications(next);
    saveApplications(next);
  }

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

  function sendMessage(payload: { jobId: string; fromRole: "admin" | "writer"; fromName: string; text: string }) {
    const message: TaskMessage = {
      id: `msg-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...payload,
    };
    const next = [...messages, message];
    setMessages(next);
    saveMessages(next);
  }

  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero eduMode={eduMode} />
        <EduBanner active={eduMode} />
        <AuthPanel
          isLoggedIn={Boolean(currentUser)}
          onLogin={login}
          onLogout={logout}
          onRegister={register}
          userName={currentUser?.name}
        />
        {!adminLoggedIn ? <AdminLogin onLogin={adminLogin} /> : <AdminBadge />}
        <JobBoard
          canAccessTask={Boolean(currentUser)}
          eduMode={eduMode}
          jobs={jobs}
          onOpenTask={openTask}
        />
        <HowItWorks />
        <PayoutsSection />
        <TestimonialsSection />
        <FaqSection />
        {currentUser ? (
          <WriterDashboard
            applications={applications.filter((a) => a.userId === currentUser.id)}
            jobs={jobs}
            onStatusChange={updateApplicationStatus}
            userName={currentUser.name}
          />
        ) : null}
        <ClassroomNotes />
        {adminLoggedIn ? (
          <>
            <AdminApplicationsPanel applications={applications} jobs={jobs} writers={writers} />
            <section className="pb-10">
              <div className="mx-auto w-[min(1180px,calc(100%-2rem))] rounded-3xl border border-ink/15 bg-white/75 p-4 shadow-soft">
                <h4 className="font-display text-3xl font-black">Export lecture activity</h4>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    className="rounded-full bg-ink px-5 py-3 font-black text-white"
                    onClick={() => exportDashboardCsv(applications, jobs, writers)}
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
        ) : null}
        <AdminPanel
          isAdmin={adminLoggedIn}
          jobsCount={jobs.length}
          payments={payments}
          onCreateJob={createJob}
        />
      </main>
      <TaskModal
        canAccessTask={Boolean(currentUser) || unlockRevealed}
        canApply={Boolean(currentUser)}
        messages={messages}
        actorName={adminLoggedIn ? "Admin" : currentUser?.name ?? "Guest"}
        actorRole={adminLoggedIn ? "admin" : "writer"}
        job={selectedJob}
        onApply={applyToTask}
        onClose={() => setSelectedJob(null)}
        onSendMessage={sendMessage}
        onUnlock={simulateUnlockFlow}
      />
      <footer className="bg-ink py-8 text-white/75">
        <div className="mx-auto flex w-[min(1180px,calc(100%-2rem))] flex-col justify-between gap-3 md:flex-row md:items-center">
          <p>WritersHub Kenya classroom platform for assignment workflow practice and submission tracking.</p>
          <div className="flex flex-wrap items-center gap-4">
            <a className="font-black text-white underline-offset-4 hover:underline" href="/legal/terms">Terms</a>
            <a className="font-black text-white underline-offset-4 hover:underline" href="/legal/privacy">Privacy</a>
            <a className="font-black text-white underline-offset-4 hover:underline" href="/legal/compliance">Compliance</a>
            <a className="font-black text-white underline-offset-4 hover:underline" href="#top">Back to top</a>
          </div>
        </div>
      </footer>
    </>
  );
}

function AdminLogin({ onLogin }: { onLogin: (password: string) => string | null }) {
  const [message, setMessage] = useState<string | null>(null);
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = String(new FormData(event.currentTarget).get("adminPassword") ?? "");
    const error = onLogin(password);
    setMessage(error ?? "Admin mode enabled.");
  }
  return (
    <section className="pb-8">
      <div className="mx-auto w-[min(1180px,calc(100%-2rem))] rounded-3xl border border-ink/15 bg-white/75 p-4 shadow-soft">
        <form className="flex flex-wrap items-end gap-3" onSubmit={handleSubmit}>
          <label className="grid gap-1 text-xs font-black uppercase tracking-wider text-muted">
            Admin password
            <input
              className="rounded-2xl border border-ink/15 bg-white px-4 py-3"
              name="adminPassword"
              placeholder="Enter lecturer admin password"
              required
              type="password"
            />
          </label>
          <button className="rounded-full bg-ink px-5 py-3 font-black text-white" type="submit">
            Unlock admin posting
          </button>
        </form>
        {message ? <p className="mt-2 text-sm font-bold text-muted">{message}</p> : null}
      </div>
    </section>
  );
}

function AdminBadge() {
  return (
    <section className="pb-8">
      <div className="mx-auto w-[min(1180px,calc(100%-2rem))] rounded-2xl border border-leaf/20 bg-leaf/10 px-4 py-3 font-bold text-leaf">
        Admin mode enabled.
      </div>
    </section>
  );
}

function Hero({ eduMode }: { eduMode: boolean }) {
  return (
    <section id="top" className="py-16 md:py-28">
      <div className="mx-auto grid w-[min(1180px,calc(100%-2rem))] items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="w-fit rounded-full border border-leaf/20 bg-leaf/10 px-3 py-1 text-xs font-black uppercase tracking-[0.13em] text-leaf">
            Professional writing marketplace
          </p>
          <h1 className="mt-4 max-w-5xl font-display text-6xl font-black leading-[0.93] tracking-[-0.05em] md:text-8xl">
            Access verified writing assignments and grow your freelance profile.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted md:text-xl">
            A dynamic writer platform with profiles, assignment pipelines, and admin-posted tasks.
            Writers can onboard, apply, collaborate on task threads, and track progress end-to-end.
            Lecturers can switch on guided classroom annotations with{" "}
            <code className="rounded-full border border-ink/15 bg-white/70 px-2 py-1">?edu=true</code>.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a className="rounded-full bg-leaf px-5 py-3 text-center font-black text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-leaf-dark" href="#jobs">
              Browse assignments
            </a>
            <a className="rounded-full border border-ink/15 bg-white/70 px-5 py-3 text-center font-black transition hover:-translate-y-0.5" href="?edu=true#jobs">
              Enable classroom notes
            </a>
          </div>
        </div>

        <aside className="rotate-0 rounded-4xl border border-ink/15 bg-white/75 p-5 shadow-soft lg:rotate-2">
          <div className="flex items-center gap-2 text-sm font-black text-muted">
            <span className="size-3 rounded-full bg-[#27ae60] shadow-[0_0_0_6px_rgba(39,174,96,0.12)]" />
            Marketplace preview
          </div>
          <div className="mt-4 grid gap-1 rounded-[1.4rem] bg-paper p-5">
            <span>Featured academic assignment</span>
            <strong className="text-4xl">KSh 6,800</strong>
            <small>Deadline: 18 hours</small>
          </div>
          <div className="mt-4 rounded-[1.4rem] bg-leaf-dark p-5 text-white">
            <p className="text-white/70">Writer verification tier</p>
            <strong>KSh 500 account verification</strong>
            <div className="mt-3">
              <RedFlagBadge eduMode={eduMode}>
                Classroom note: upfront verification fees should always be independently verified.
              </RedFlagBadge>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-ink/10 bg-white/40 py-16 md:py-24">
      <div className="mx-auto w-[min(1180px,calc(100%-2rem))]">
        <div className="max-w-3xl">
          <p className="w-fit rounded-full border border-leaf/20 bg-leaf/10 px-3 py-1 text-xs font-black uppercase tracking-[0.13em] text-leaf">
            Workflow
          </p>
          <h2 className="mt-3 font-display text-5xl font-black leading-none tracking-[-0.04em] md:text-6xl">
            End-to-end assignment workflow
          </h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["01", "Create your profile", "Onboard with your expertise field and build your writer presence."],
            ["02", "Apply and communicate", "Open assignment briefs and coordinate through task threads."],
            ["03", "Track delivery status", "Move tasks from open to in-review to submitted with full timeline."],
          ].map(([step, title, body]) => (
            <article key={step} className="rounded-[1.4rem] border border-ink/15 bg-white/75 p-5 shadow-soft">
              <span className="grid size-10 place-items-center rounded-full bg-gold font-black">{step}</span>
              <h3 className="mt-4 font-display text-2xl font-black">{title}</h3>
              <p className="mt-2 text-muted">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PayoutsSection() {
  return (
    <section className="py-16">
      <div className="mx-auto w-[min(1180px,calc(100%-2rem))] rounded-4xl border border-ink/15 bg-white/75 p-6 shadow-soft">
        <p className="w-fit rounded-full border border-leaf/20 bg-leaf/10 px-3 py-1 text-xs font-black uppercase tracking-[0.13em] text-leaf">
          Payout operations
        </p>
        <h2 className="mt-3 font-display text-4xl font-black md:text-5xl">Transparent payout cycle</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            ["1. Task accepted", "Writers confirm scope and due date before work begins."],
            ["2. Quality review", "Assignments are reviewed against requirements and quality checks."],
            ["3. Weekly settlement", "Approved tasks are batched into weekly payout summaries."],
          ].map(([title, body]) => (
            <article key={title} className="rounded-2xl border border-ink/10 bg-[#fffaf0] p-4">
              <h3 className="font-display text-2xl font-black">{title}</h3>
              <p className="mt-2 text-muted">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="py-8">
      <div className="mx-auto w-[min(1180px,calc(100%-2rem))]">
        <h2 className="font-display text-4xl font-black md:text-5xl">Writer success stories</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            ["Angela N., Research Writer", "The task briefs are detailed and the status workflow keeps delivery organized."],
            ["Kelvin M., Business Analyst", "I can track every assignment from application to submission without confusion."],
            ["Fatma A., Medical Writer", "Threaded instructions make revisions clear and turnaround times much faster."],
          ].map(([name, quote]) => (
            <article key={name} className="rounded-2xl border border-ink/15 bg-white/75 p-4 shadow-soft">
              <p className="text-muted">{quote}</p>
              <p className="mt-3 font-black">{name}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="py-16">
      <div className="mx-auto w-[min(1180px,calc(100%-2rem))]">
        <h2 className="font-display text-4xl font-black md:text-5xl">Frequently asked questions</h2>
        <div className="mt-5 space-y-3">
          {[
            ["How do I start receiving tasks?", "Create a writer profile, verify your account tier, and apply to open assignments."],
            ["How are deadlines managed?", "Each task includes a due date and update checkpoints in your dashboard timeline."],
            ["Can I talk to admin on each task?", "Yes. Use the task thread in each assignment to receive instructions and clarifications."],
            ["How do I export my activity?", "Use the dashboard export actions to download CSV or print your records as PDF."],
          ].map(([question, answer]) => (
            <details key={question} className="rounded-2xl border border-ink/15 bg-white/75 p-4">
              <summary className="cursor-pointer font-black">{question}</summary>
              <p className="mt-2 text-muted">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClassroomNotes() {
  return (
    <section id="red-flags" className="py-16 md:py-24">
      <div className="mx-auto grid w-[min(1180px,calc(100%-2rem))] items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="w-fit rounded-full border border-leaf/20 bg-leaf/10 px-3 py-1 text-xs font-black uppercase tracking-[0.13em] text-leaf">
            Classroom notes
          </p>
          <h2 className="mt-3 font-display text-5xl font-black leading-none tracking-[-0.04em] md:text-6xl">
            Classroom annotation mode for lecturer guidance.
          </h2>
        </div>
      </div>
    </section>
  );
}
