type EduBannerProps = {
  active: boolean;
};

export function EduBanner({ active }: EduBannerProps) {
  if (!active) return null;

  return (
    <section className="bg-leaf-dark py-3 text-white">
      <div className="mx-auto flex w-[min(1180px,calc(100%-2rem))] flex-wrap items-center justify-between gap-3">
        <p>
          <strong>Educator overlay is active.</strong>{" "}
          <span className="text-white/75">
            Red badges explain the manipulative design patterns learners should notice.
          </span>
        </p>
        <a className="font-black text-gold underline-offset-4 hover:underline" href="/#jobs">
          Hide overlay
        </a>
      </div>
    </section>
  );
}
