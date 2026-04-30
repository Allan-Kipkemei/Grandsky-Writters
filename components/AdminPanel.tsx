"use client";

import { startTransition, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { formatKsh } from "@/lib/format";
import type { NewJobInput } from "@/types";

type AdminPanelProps = {
  jobsCount: number;
  payments: number;
  onCreateJob: (job: NewJobInput) => void;
  isAdmin: boolean;
};

type FormState = NewJobInput;

const initialFormState: FormState = {
  title: "",
  category: "",
  field: "",
  pay: 4500,
  pages: 8,
  dueDate: "2026-05-20",
  description: "",
  fullAssignment: "",
  submissionRules: [],
};

function getFormData(form: HTMLFormElement): FormState {
  const data = new FormData(form);

  return {
    title: String(data.get("title") ?? "").trim(),
    category: String(data.get("category") ?? "").trim(),
    field: String(data.get("field") ?? "").trim(),
    pay: Number(data.get("pay") ?? 0),
    pages: Number(data.get("pages") ?? 0),
    dueDate: String(data.get("dueDate") ?? "").trim(),
    description:
      String(data.get("description") ?? "").trim() ||
      "Freshly posted assignment. Details are intentionally vague to mimic scam job boards.",
    fullAssignment:
      String(data.get("fullAssignment") ?? "").trim() ||
      "Complete the assignment according to the listed expectations and submit on time.",
    submissionRules: String(data.get("submissionRules") ?? "")
      .split("\n")
      .map((rule) => rule.trim())
      .filter(Boolean),
  };
}

export function AdminPanel({ jobsCount, payments, onCreateJob, isAdmin }: AdminPanelProps) {
  const [formKey, setFormKey] = useState(0);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const job = getFormData(event.currentTarget);

    startTransition(() => {
      onCreateJob(job);
      setFormKey((key) => key + 1);
    });

    document.querySelector("#jobs")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section
      id="admin"
      className="bg-[linear-gradient(135deg,rgba(18,61,49,0.94),rgba(31,91,69,0.84)),radial-gradient(circle_at_20%_20%,rgba(240,185,79,0.42),transparent_24rem)] py-16 text-white md:py-24"
    >
      <div className="mx-auto grid w-[min(1180px,calc(100%-2rem))] gap-5 rounded-4xl border border-white/15 bg-white/10 p-5 shadow-soft md:p-8">
        <div>
          <p className="w-fit rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.13em] text-white/80">
            Admin demo
          </p>
          <h2 className="mt-3 font-display text-5xl font-black leading-none tracking-[-0.04em] md:text-6xl">
            Operator dashboard preview
          </h2>
          <p className="mt-4 max-w-3xl text-white/75">
            This frontend-only dashboard lets an educator add assignments and watch simulated activation
            revenue rise. Data is stored in the browser until the backend is wired in.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <StatCard label="posted jobs" value={String(jobsCount)} />
          <StatCard label="activation attempts" value={String(payments)} />
          <StatCard label="simulated revenue" value={formatKsh(payments * 500)} />
        </div>

        {isAdmin ? (
          <form key={formKey} className="grid gap-4 rounded-[1.4rem] border border-white/15 bg-white/10 p-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Job title">
              <input
                className="rounded-2xl border border-transparent bg-white/95 px-4 py-3 text-ink outline-none focus:border-gold focus:ring-4 focus:ring-gold/20"
                defaultValue={initialFormState.title}
                maxLength={90}
                name="title"
                placeholder="Literature review on climate adaptation"
                required
              />
            </Field>
            <Field label="Category">
              <input
                className="rounded-2xl border border-transparent bg-white/95 px-4 py-3 text-ink outline-none focus:border-gold focus:ring-4 focus:ring-gold/20"
                defaultValue={initialFormState.category}
                maxLength={40}
                name="category"
                placeholder="Academic"
                required
              />
            </Field>
            <Field label="Field">
              <input
                className="rounded-2xl border border-transparent bg-white/95 px-4 py-3 text-ink outline-none focus:border-gold focus:ring-4 focus:ring-gold/20"
                defaultValue={initialFormState.field}
                maxLength={60}
                name="field"
                placeholder="Behavioral Science"
                required
              />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Pay (KSh)">
              <input
                className="rounded-2xl border border-transparent bg-white/95 px-4 py-3 text-ink outline-none focus:border-gold focus:ring-4 focus:ring-gold/20"
                defaultValue={initialFormState.pay}
                min={500}
                name="pay"
                required
                step={100}
                type="number"
              />
            </Field>
            <Field label="Pages">
              <input
                className="rounded-2xl border border-transparent bg-white/95 px-4 py-3 text-ink outline-none focus:border-gold focus:ring-4 focus:ring-gold/20"
                defaultValue={initialFormState.pages}
                max={80}
                min={1}
                name="pages"
                required
                type="number"
              />
            </Field>
            <Field label="Deadline">
              <input
                className="rounded-2xl border border-transparent bg-white/95 px-4 py-3 text-ink outline-none focus:border-gold focus:ring-4 focus:ring-gold/20"
                defaultValue={initialFormState.dueDate}
                name="dueDate"
                required
                type="date"
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              className="min-h-28 resize-y rounded-2xl border border-transparent bg-white/95 px-4 py-3 text-ink outline-none focus:border-gold focus:ring-4 focus:ring-gold/20"
              maxLength={240}
              name="description"
              placeholder="Short brief shown to bidders"
            />
          </Field>
          <Field label="Full assignment brief">
            <textarea
              className="min-h-32 resize-y rounded-2xl border border-transparent bg-white/95 px-4 py-3 text-ink outline-none focus:border-gold focus:ring-4 focus:ring-gold/20"
              maxLength={800}
              name="fullAssignment"
              placeholder="Write the full assignment requirements here..."
              required
            />
          </Field>
          <Field label="Submission rules (one per line)">
            <textarea
              className="min-h-24 resize-y rounded-2xl border border-transparent bg-white/95 px-4 py-3 text-ink outline-none focus:border-gold focus:ring-4 focus:ring-gold/20"
              maxLength={900}
              name="submissionRules"
              placeholder={"Use APA 7th style\nSubmit in .docx format\nPlagiarism below 10%"}
              required
            />
          </Field>

          <button
            className="w-fit rounded-full bg-gold px-5 py-3 font-black text-ink shadow-soft transition hover:-translate-y-0.5"
            type="submit"
          >
            Post fake assignment
          </button>
          </form>
        ) : (
          <div className="rounded-[1.4rem] border border-white/15 bg-white/10 p-4 text-white/80">
            Admin posting is locked. Login as admin to post assignments.
          </div>
        )}
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-[1.4rem] border border-white/15 bg-white/10 p-4">
      <span className="block text-3xl font-black md:text-4xl">{value}</span>
      <small className="font-black uppercase tracking-wide text-white/70">{label}</small>
    </article>
  );
}

function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="grid gap-2 text-xs font-black uppercase tracking-wider text-white/75">
      {label}
      {children}
    </label>
  );
}
