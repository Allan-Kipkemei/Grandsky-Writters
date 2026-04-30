import { formatKsh } from "@/lib/format";
import type { Job } from "@/types";

type ActivationModalProps = {
  job: Job | null;
  onClose: () => void;
  onSimulatePayment: () => void;
  revealed: boolean;
};

export function ActivationModal({
  job,
  onClose,
  onSimulatePayment,
  revealed,
}: ActivationModalProps) {
  if (!job) return null;

  return (
    <div
      aria-labelledby="activation-modal-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center p-4"
      role="dialog"
    >
      <button
        aria-label="Close activation modal"
        className="absolute inset-0 bg-ink/55 backdrop-blur-md"
        onClick={onClose}
        type="button"
      />

      <div className="relative w-[min(620px,100%)] rounded-4xl border border-ink/15 bg-white/90 p-6 shadow-soft md:p-8">
        <button
          aria-label="Close activation modal"
          className="absolute right-4 top-4 grid size-10 place-items-center rounded-full border border-ink/15 bg-white font-black"
          onClick={onClose}
          type="button"
        >
          x
        </button>

        <p className="w-fit rounded-full border border-leaf/20 bg-leaf/10 px-3 py-1 text-xs font-black uppercase tracking-[0.13em] text-leaf">
          Bid blocked
        </p>
        <h2
          id="activation-modal-title"
          className="mt-4 font-display text-4xl font-black leading-none tracking-[-0.04em] md:text-5xl"
        >
          Activate your account to bid
        </h2>
        <p className="mt-4 font-black text-leaf">Assignment: {job.title}</p>
        <p className="mt-3 text-muted">
          The simulated platform asks for <strong>{formatKsh(500)}</strong> before allowing a bid.
          This is the exact red flag the classroom exercise is designed to reveal.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="rounded-full bg-leaf px-5 py-3 font-black text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-leaf-dark"
            onClick={onSimulatePayment}
            type="button"
          >
            Simulate {formatKsh(500)} payment
          </button>
          <button
            className="rounded-full border border-ink/15 bg-white px-5 py-3 font-black transition hover:-translate-y-0.5"
            onClick={onClose}
            type="button"
          >
            Keep browsing
          </button>
        </div>

        {revealed ? (
          <div className="mt-5 rounded-2xl bg-[#fff1eb] p-4 text-[#9b351d]">
            <strong>Educational reveal:</strong> Pay-to-bid schemes profit from activation fees,
            not from real writing work.
          </div>
        ) : null}
      </div>
    </div>
  );
}
