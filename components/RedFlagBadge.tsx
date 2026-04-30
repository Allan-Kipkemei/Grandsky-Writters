type RedFlagBadgeProps = {
  children: string;
  eduMode: boolean;
};

export function RedFlagBadge({ children, eduMode }: RedFlagBadgeProps) {
  if (!eduMode) return null;

  return (
    <span className="group relative inline-flex min-h-8 items-center rounded-full border border-coral/30 bg-[#fff1eb] px-3 py-1 text-xs font-black text-[#9b351d]">
      <span className="mr-1.5 grid size-4 place-items-center rounded-full bg-coral text-[10px] text-white">
        !
      </span>
      Red flag
      <span className="pointer-events-none absolute bottom-[calc(100%+0.5rem)] right-0 z-20 w-64 rounded-2xl bg-ink p-3 text-left text-sm font-bold leading-snug text-white opacity-0 shadow-soft transition group-hover:opacity-100 group-focus:opacity-100">
        {children}
      </span>
    </span>
  );
}
