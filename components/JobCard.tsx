import { formatKsh } from "@/lib/format";
import type { Job } from "@/types";
import { RedFlagBadge } from "./RedFlagBadge";

type JobCardProps = {
  job: Job;
  eduMode: boolean;
  onOpenTask: (job: Job) => void;
  canAccessTask: boolean;
};

export function JobCard({ job, eduMode, onOpenTask, canAccessTask }: JobCardProps) {
  return (
    <article className="flex min-h-full flex-col rounded-[1.4rem] border border-ink/15 bg-white/75 p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <span className="w-fit rounded-full border border-leaf/20 bg-leaf/10 px-3 py-1 text-xs font-black uppercase tracking-[0.13em] text-leaf">
          {job.category}
        </span>
        <span className="text-sm font-black text-coral">{job.dueDate}</span>
      </div>

      <h3 className="mt-5 font-display text-2xl font-black leading-none tracking-[-0.04em]">
        {job.title}
      </h3>
      <p className="mt-3 text-sm font-bold text-muted">
        Field: <span className="text-ink">{job.field}</span>
      </p>
      <p className="mt-3 text-muted">{job.description}</p>

      <dl className="mt-auto grid grid-cols-2 gap-3 py-5">
        <div className="rounded-2xl bg-[#f4ead4]/80 p-3">
          <dt className="text-xs font-black uppercase text-muted">Pay</dt>
          <dd className="mt-1 font-black">{formatKsh(job.pay)}</dd>
        </div>
        <div className="rounded-2xl bg-[#f4ead4]/80 p-3">
          <dt className="text-xs font-black uppercase text-muted">Pages</dt>
          <dd className="mt-1 font-black">{job.pages} pages</dd>
        </div>
      </dl>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          className="rounded-full bg-leaf px-5 py-3 font-black text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-leaf-dark"
          onClick={() => onOpenTask(job)}
          type="button"
        >
          {canAccessTask ? "View full task" : "View & apply"}
        </button>
        <RedFlagBadge eduMode={eduMode}>
          Bid access is intentionally blocked behind an upfront fee.
        </RedFlagBadge>
      </div>
    </article>
  );
}
