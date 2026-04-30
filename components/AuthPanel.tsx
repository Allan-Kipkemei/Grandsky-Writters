"use client";

import { useState } from "react";
import type { FormEvent } from "react";

type AuthValues = {
  name: string;
  email: string;
  password: string;
  bio: string;
};

type AuthPanelProps = {
  isLoggedIn: boolean;
  userName?: string;
  onLogin: (email: string, password: string) => string | null;
  onRegister: (values: AuthValues) => string | null;
  onLogout: () => void;
};

export function AuthPanel({ isLoggedIn, userName, onLogin, onRegister, onLogout }: AuthPanelProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [message, setMessage] = useState<string | null>(null);

  function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim().toLowerCase();
    const password = String(data.get("password") ?? "");
    const error = onLogin(email, password);
    setMessage(error ?? "Logged in successfully.");
    if (!error) event.currentTarget.reset();
  }

  function handleRegisterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const error = onRegister({
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim().toLowerCase(),
      password: String(data.get("password") ?? ""),
      bio: String(data.get("bio") ?? "").trim(),
    });
    setMessage(error ?? "Profile created and logged in.");
    if (!error) event.currentTarget.reset();
  }

  return (
    <section className="py-10">
      <div className="mx-auto w-[min(1180px,calc(100%-2rem))] rounded-4xl border border-ink/15 bg-white/75 p-5 shadow-soft">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="w-fit rounded-full border border-leaf/20 bg-leaf/10 px-3 py-1 text-xs font-black uppercase tracking-[0.13em] text-leaf">
              Writer access
            </p>
            <h2 className="mt-2 font-display text-3xl font-black leading-none tracking-[-0.04em] md:text-4xl">
              {isLoggedIn ? `Welcome, ${userName}` : "Create profile or sign in"}
            </h2>
          </div>
          {isLoggedIn ? (
            <button
              className="rounded-full border border-ink/15 bg-white px-5 py-3 font-black"
              onClick={onLogout}
              type="button"
            >
              Logout
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                className={`rounded-full px-4 py-2 text-sm font-black ${
                  mode === "login" ? "bg-ink text-white" : "border border-ink/15 bg-white"
                }`}
                onClick={() => setMode("login")}
                type="button"
              >
                Login
              </button>
              <button
                className={`rounded-full px-4 py-2 text-sm font-black ${
                  mode === "register" ? "bg-ink text-white" : "border border-ink/15 bg-white"
                }`}
                onClick={() => setMode("register")}
                type="button"
              >
                Register
              </button>
            </div>
          )}
        </div>

        {!isLoggedIn && mode === "login" ? (
          <form className="grid gap-3 md:grid-cols-3" onSubmit={handleLoginSubmit}>
            <input className="rounded-2xl border border-ink/15 bg-white px-4 py-3" name="email" placeholder="Email" required type="email" />
            <input className="rounded-2xl border border-ink/15 bg-white px-4 py-3" name="password" placeholder="Password" required type="password" />
            <button className="rounded-2xl bg-leaf px-4 py-3 font-black text-white" type="submit">
              Sign in
            </button>
          </form>
        ) : null}

        {!isLoggedIn && mode === "register" ? (
          <form className="grid gap-3 md:grid-cols-2" onSubmit={handleRegisterSubmit}>
            <input className="rounded-2xl border border-ink/15 bg-white px-4 py-3" name="name" placeholder="Full name" required />
            <input className="rounded-2xl border border-ink/15 bg-white px-4 py-3" name="email" placeholder="Email" required type="email" />
            <input className="rounded-2xl border border-ink/15 bg-white px-4 py-3" name="password" placeholder="Password" required type="password" />
            <input className="rounded-2xl border border-ink/15 bg-white px-4 py-3" name="bio" placeholder="Field of expertise (e.g. Psychology)" required />
            <button className="rounded-2xl bg-leaf px-4 py-3 font-black text-white md:col-span-2" type="submit">
              Create profile
            </button>
          </form>
        ) : null}

        {message ? <p className="mt-3 text-sm font-bold text-muted">{message}</p> : null}
      </div>
    </section>
  );
}
