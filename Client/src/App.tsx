import { FormEvent, useEffect, useMemo, useState } from "react";

type Job = {
  id: string;
  title: string;
  category: string;
  pay: number;
  pages: number;
  deadline: string;
  description: string;
};

type UserMember = {
  id: string;
  email: string;
  activated: boolean;
};

type Dashboard = {
  totalJobs: number;
  totalUsers: number;
  activatedUsers: number;
  totalRevenue: number;
};

const ADMIN_TOKEN_KEY = "grandsky_admin_token";

function App() {
  const [view, setView] = useState<"home" | "admin">("home");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [email, setEmail] = useState("");
  const [activationMessage, setActivationMessage] = useState("");
  const [adminEmail, setAdminEmail] = useState("admin@grandsky.local");
  const [adminPassword, setAdminPassword] = useState("secret123");
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  });
  const [loginMessage, setLoginMessage] = useState("");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [newJob, setNewJob] = useState({ title: "", category: "", pay: 5000, pages: 3, deadline: "", description: "" });
  const [members, setMembers] = useState<UserMember[]>([]);
  const [apiMessage, setApiMessage] = useState("");

  const authHeaders = useMemo(() => {
    return adminToken ? { "x-admin-token": adminToken } : {};
  }, [adminToken]);

  useEffect(() => {
    if (view === "home") {
      fetchJobs();
    }
  }, [view]);

  useEffect(() => {
    if (view === "admin" && adminToken) {
      loadAdminDashboard();
      loadMembers();
    }
  }, [view, adminToken]);

  async function fetchJobs() {
    try {
      const response = await fetch("/api/jobs");
      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleActivate(event: FormEvent) {
    event.preventDefault();
    setActivationMessage("");

    try {
      const response = await fetch("/api/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      setActivationMessage(data.message || "Activation completed.");
      setEmail("");
    } catch (error) {
      setActivationMessage("Activation request failed.");
      console.error(error);
    }
  }

  async function handleAdminLogin(event: FormEvent) {
    event.preventDefault();
    setLoginMessage("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: adminEmail, password: adminPassword })
      });

      if (!response.ok) {
        setLoginMessage("Invalid admin credentials.");
        return;
      }

      const data = await response.json();
      setAdminToken(data.token);
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      setLoginMessage("Signed in successfully.");
    } catch (error) {
      setLoginMessage("Login failed.");
      console.error(error);
    }
  }

  async function loadAdminDashboard() {
    try {
      const response = await fetch("/api/admin/dashboard", {
        headers: { ...authHeaders }
      });
      if (!response.ok) {
        setDashboard(null);
        return;
      }
      const data = await response.json();
      setDashboard(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadMembers() {
    try {
      const response = await fetch("/api/admin/members", {
        headers: { ...authHeaders }
      });
      const data = await response.json();
      setMembers(data.members || []);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleCreateJob(event: FormEvent) {
    event.preventDefault();
    setApiMessage("");

    try {
      const response = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(newJob)
      });

      if (!response.ok) {
        setApiMessage("Could not create job.");
        return;
      }

      setApiMessage("Job created successfully.");
      setNewJob({ title: "", category: "", pay: 5000, pages: 3, deadline: "", description: "" });
      loadAdminDashboard();
    } catch (error) {
      setApiMessage("Failed to create job.");
      console.error(error);
    }
  }

  function logoutAdmin() {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setAdminToken(null);
    setDashboard(null);
    setMembers([]);
    setLoginMessage("Signed out.");
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">WH</span>
          <div>
            <h1>WritersHub Kenya</h1>
            <p>React simulator with a Go admin API.</p>
          </div>
        </div>
        <nav className="topnav">
          <button className={view === "home" ? "nav-active" : "nav-button"} onClick={() => setView("home")}>Landing</button>
          <button className={view === "admin" ? "nav-active" : "nav-button"} onClick={() => setView("admin")}>Admin Panel</button>
        </nav>
      </header>

      {view === "home" ? (
        <main className="content">
          <section className="hero-section">
            <div>
              <span className="eyebrow">Fraud Awareness Simulator</span>
              <h2>Explore how an online writing scam can appear real.</h2>
              <p>This React landing page displays fake job listings and lets learners trigger the activation process that mimics a scam payment barrier.</p>
              <div className="home-actions">
                <button onClick={() => setView("admin")} className="button button-primary">Open Admin Panel</button>
              </div>
            </div>
            <div className="hero-panel">
              <h3>Public View</h3>
              <p>Live sample assignments from the API.</p>
              <div className="job-summary">
                <strong>{jobs.length}</strong> active jobs
              </div>
            </div>
          </section>

          <section className="section-card">
            <h3>Available Opportunities</h3>
            <div className="job-grid">
              {jobs.length === 0 ? (
                <div className="empty-state">No listings available yet.</div>
              ) : (
                jobs.map((job) => (
                  <article key={job.id} className="job-card">
                    <div className="job-header">
                      <h4>{job.title}</h4>
                      <span>{job.category}</span>
                    </div>
                    <p>{job.description}</p>
                    <div className="job-meta">
                      <span>Pay: KSh {job.pay.toLocaleString()}</span>
                      <span>Pages: {job.pages}</span>
                      <span>Deadline: {job.deadline}</span>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="section-card">
            <h3>Activate your account</h3>
            <form onSubmit={handleActivate} className="form-grid">
              <label>
                Email address
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
              </label>
              <button type="submit" className="button button-secondary">Pay KSh 500</button>
            </form>
            {activationMessage && <p className="status-message">{activationMessage}</p>}
          </section>
        </main>
      ) : (
        <main className="content">
          <section className="section-card admin-header">
            <h2>Admin Dashboard</h2>
            <p>Use the Go API to manage fake postings and view simulated activation revenue.</p>
          </section>

          {!adminToken ? (
            <section className="section-card">
              <h3>Admin Sign In</h3>
              <form onSubmit={handleAdminLogin} className="form-grid">
                <label>
                  Username
                  <input type="text" value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} />
                </label>
                <label>
                  Password
                  <input type="password" value={adminPassword} onChange={(event) => setAdminPassword(event.target.value)} />
                </label>
                <button type="submit" className="button button-primary">Sign In</button>
              </form>
              {loginMessage && <p className="status-message">{loginMessage}</p>}
            </section>
          ) : (
            <>
              <section className="section-card summary-grid">
                <article>
                  <h4>Revenue</h4>
                  <p>KSh {dashboard ? dashboard.totalRevenue.toLocaleString() : "0"}</p>
                </article>
                <article>
                  <h4>Jobs</h4>
                  <p>{dashboard?.totalJobs ?? 0}</p>
                </article>
                <article>
                  <h4>Members</h4>
                  <p>{dashboard?.totalUsers ?? 0}</p>
                </article>
                <article>
                  <h4>Activated</h4>
                  <p>{dashboard?.activatedUsers ?? 0}</p>
                </article>
              </section>

              <section className="section-card">
                <h3>Create a fake job</h3>
                <form onSubmit={handleCreateJob} className="form-grid">
                  <label>
                    Title
                    <input value={newJob.title} onChange={(event) => setNewJob({ ...newJob, title: event.target.value })} required />
                  </label>
                  <label>
                    Category
                    <input value={newJob.category} onChange={(event) => setNewJob({ ...newJob, category: event.target.value })} required />
                  </label>
                  <label>
                    Pay (KSh)
                    <input type="number" value={newJob.pay} min={100} onChange={(event) => setNewJob({ ...newJob, pay: Number(event.target.value) })} required />
                  </label>
                  <label>
                    Pages
                    <input type="number" value={newJob.pages} min={1} onChange={(event) => setNewJob({ ...newJob, pages: Number(event.target.value) })} required />
                  </label>
                  <label>
                    Deadline
                    <input value={newJob.deadline} onChange={(event) => setNewJob({ ...newJob, deadline: event.target.value })} required />
                  </label>
                  <label className="full-width">
                    Description
                    <textarea value={newJob.description} onChange={(event) => setNewJob({ ...newJob, description: event.target.value })} required />
                  </label>
                  <button type="submit" className="button button-primary">Publish Job</button>
                </form>
                {apiMessage && <p className="status-message">{apiMessage}</p>}
              </section>

              <section className="section-card">
                <div className="section-heading-row">
                  <h3>Members</h3>
                  <button className="button button-secondary" onClick={logoutAdmin}>Sign Out</button>
                </div>
                <div className="member-grid">
                  {members.map((member) => (
                    <article key={member.id} className="member-card">
                      <strong>{member.email}</strong>
                      <span>Status: {member.activated ? "Activated" : "Blocked"}</span>
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}
        </main>
      )}
    </div>
  );
}

export default App;
