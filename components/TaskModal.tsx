import { formatKsh } from "@/lib/format";
import type { Job } from "@/types";

type TaskModalProps = {
  job: Job | null;
  canAccessTask: boolean;
  canApply: boolean;
  onClose: () => void;
  onUnlock: () => void;
  onApply: (jobId: string) => void;
};

export function TaskModal({
  job,
  canAccessTask,
  canApply,
  onClose,
  onUnlock,
  onApply,
}: TaskModalProps) {
  if (!job) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <button
        aria-label="Close task modal"
        className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
        onClick={onClose}
        type="button"
      />
      <div className="relative max-h-[90vh] w-[min(860px,100%)] overflow-auto rounded-4xl border border-ink/15 bg-white p-6 shadow-soft md:p-8">
        <button
          aria-label="Close task modal"
          className="absolute right-4 top-4 grid size-9 place-items-center rounded-full border border-ink/15 bg-white font-black"
          onClick={onClose}
          type="button"
        >
          x
        </button>
        <p className="w-fit rounded-full border border-leaf/20 bg-leaf/10 px-3 py-1 text-xs font-black uppercase tracking-[0.13em] text-leaf">
          Assignment details
        </p>
        <h3 className="mt-4 font-display text-4xl font-black leading-none tracking-[-0.04em]">{job.title}</h3>
        <div className="mt-4 grid gap-3 text-sm font-bold text-muted md:grid-cols-4">
          <p>Field: <span className="text-ink">{job.field}</span></p>
          <p>Category: <span className="text-ink">{job.category}</span></p>
          <p>Pay: <span className="text-ink">{formatKsh(job.pay)}</span></p>
          <p>Due: <span className="text-ink">{job.dueDate}</span></p>
        </div>

        {canAccessTask ? (
          <>
            <div className="mt-6 rounded-3xl border border-ink/10 bg-[#fffaf0] p-5">
              <h4 className="font-display text-2xl font-black">Full brief</h4>
              <p className="mt-3 text-muted">{job.fullAssignment}</p>
            </div>
            <div className="mt-5 rounded-3xl border border-ink/10 bg-[#fffaf0] p-5">
              <h4 className="font-display text-2xl font-black">Submission rules</h4>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-muted">
                {job.submissionRules.map((rule, index) => (
                  <li key={`${job.id}-rule-${index}`}>{rule}</li>
                ))}
              </ul>
            </div>
            <div className="mt-5">
              <button
                className="rounded-full bg-leaf px-5 py-3 font-black text-white"
                disabled={!canApply}
                onClick={() => onApply(job.id)}
                type="button"
              >
                {canApply ? "Apply for this task" : "Login as writer to apply"}
              </button>
            </div>
          </>
        ) : (
          <div className="mt-6 rounded-3xl border border-coral/30 bg-[#fff1eb] p-5">
            <p className="font-bold text-[#9b351d]">
              Sign in with a writer profile to view full assignment requirements and submission rules.
            </p>
            <button
              className="mt-4 rounded-full bg-leaf px-5 py-3 font-black text-white"
              onClick={onUnlock}
              type="button"
            >
              Simulate unlock flow
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
