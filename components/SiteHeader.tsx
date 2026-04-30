"use client";

import { useState } from "react";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/80 backdrop-blur-xl">
      <a
        className="absolute left-4 top-[-4rem] z-50 rounded-full bg-leaf px-4 py-3 font-black text-white focus:top-4"
        href="#main"
      >
        Skip to content
      </a>

      <div className="mx-auto flex w-[min(1180px,calc(100%-2rem))] items-center justify-between gap-5 py-4">
        <a className="flex items-center gap-3 no-underline" href="#top" aria-label="WritersHub Kenya home">
          <span className="grid size-12 place-items-center rounded-[17px] border-2 border-ink bg-gold font-black shadow-[5px_5px_0_#17211b]">
            WH
          </span>
          <span className="hidden sm:block">
            <strong className="block">WritersHub Kenya</strong>
            <small className="block text-xs font-black uppercase tracking-wider text-muted">
              fraud awareness lab
            </small>
          </span>
        </a>

        <button
          aria-controls="site-nav"
          aria-expanded={open}
          className="rounded-full border border-ink/15 bg-white px-4 py-2 font-black md:hidden"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          Menu
        </button>

        <nav
          id="site-nav"
          className={`absolute left-4 right-4 top-[calc(100%+0.5rem)] rounded-[1.4rem] border border-ink/15 bg-paper/95 p-2 shadow-soft md:static md:flex md:border-0 md:bg-transparent md:p-0 md:shadow-none ${
            open ? "grid" : "hidden md:flex"
          }`}
          aria-label="Primary navigation"
        >
          {[
            ["Jobs", "#jobs"],
            ["Dashboard", "/dashboard"],
            ["How it works", "#how-it-works"],
            ["Red flags", "#red-flags"],
            ["Admin demo", "#admin"],
          ].map(([label, href]) => (
            <a
              key={href}
              className="rounded-full px-4 py-3 font-black text-muted transition hover:bg-leaf/10 hover:text-leaf-dark"
              href={href}
              onClick={() => setOpen(false)}
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
