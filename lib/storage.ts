import { seedJobs } from "@/lib/seed-jobs";
import type { Job, TaskApplication, WriterUser } from "@/types";

const JOBS_KEY = "writershub.jobs";
const PAYMENTS_KEY = "writershub.payments";
const WRITERS_KEY = "writershub.writers";
const SESSION_KEY = "writershub.session";
const APPLICATIONS_KEY = "writershub.applications";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadJobs(): Job[] {
  const jobs = readJson<Job[]>(JOBS_KEY, seedJobs);

  if (typeof window !== "undefined" && !window.localStorage.getItem(JOBS_KEY)) {
    writeJson(JOBS_KEY, jobs);
  }

  return jobs;
}

export function saveJobs(jobs: Job[]) {
  writeJson(JOBS_KEY, jobs);
}

export function loadPayments(): number {
  return readJson<number>(PAYMENTS_KEY, 0);
}

export function savePayments(payments: number) {
  writeJson(PAYMENTS_KEY, payments);
}

export function loadWriters(): WriterUser[] {
  return readJson<WriterUser[]>(WRITERS_KEY, []);
}

export function saveWriters(users: WriterUser[]) {
  writeJson(WRITERS_KEY, users);
}

export function loadSession(): string | null {
  return readJson<string | null>(SESSION_KEY, null);
}

export function saveSession(userId: string | null) {
  writeJson(SESSION_KEY, userId);
}

export function loadApplications(): TaskApplication[] {
  return readJson<TaskApplication[]>(APPLICATIONS_KEY, []);
}

export function saveApplications(applications: TaskApplication[]) {
  writeJson(APPLICATIONS_KEY, applications);
}
