import { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";

type Job = {
  id: string;
  title: string;
  category: string;
  pay: number;
  pages: number;
  deadline: string;
  description: string;
};

type User = {
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
const USER_SESSION_KEY = "grandsky_user_email";

function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}

function Shell() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [user, setUser] = useState<User | null>(() => {
    const storedEmail = localStorage.getItem(USER_SESSION_KEY);
    return storedEmail ? { email: storedEmail, activated: false } : null;
  });
  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem(ADMIN_TOKEN_KEY));
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [statusText, setStatusText] = useState<string>("");
  const [jobCreated, setJobCreated] = useState(false);

  const authHeaders = useMemo(
    () => (adminToken ? { "x-admin-token": adminToken } : {}),
    [adminToken]
  );

  useEffect(() => {
    fetchJobs();
  }, [jobCreated]);

  async function fetchJobs() {
    try {
      const response = await fetch("/api/jobs");
      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error(error);
    }
  }

  async function registerUser(email: string, password: string) {
    setStatusText("");
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      setStatusText(data.message || "Registration failed.");
      return false;
    }
    setStatusText(data.message || "Registration successful.");
    return true;
  }

  async function loginUser(email: string, password: string) {
    setStatusText("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      setStatusText(data.message || "Login failed.");
      return false;
    }
    setUser({ email: data.email, activated: data.activated });
    localStorage.setItem(USER_SESSION_KEY, data.email);
    setStatusText("Logged in successfully.");
    return true;
  }

  async function activateAccount(email: string) {
    const response = await fetch("/api/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    setStatusText(data.message || "Activation completed.");
    if (response.ok && user?.email === email) {
      setUser({ ...user, activated: true });
    }
  }

  async function bidOnJob(jobId: string) {
    if (!user) {
      setStatusText("Please log in before bidding.");
      return;
    }
    const response = await fetch("/api/bids", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, jobId }),
    });
    const data = await response.json();
    setStatusText(data.message || "Bid submitted.");
    if (response.status === 402) {
      setUser({ ...user, activated: false });
    }
  }

  async function adminLogin(username: string, password: string) {
    setStatusText("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      setStatusText(data.message || "Admin login failed.");
      return false;
    }
    setAdminToken(data.token);
    localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
    setStatusText("Admin signed in.");
    return true;
  }

  async function fetchAdminDashboard() {
    try {
      const response = await fetch("/api/admin/dashboard", { headers: authHeaders });
      if (!response.ok) return;
      const data = await response.json();
      setDashboard(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchMembers() {
    try {
      const response = await fetch("/api/admin/members", { headers: authHeaders });
      const data = await response.json();
      setMembers(data.members || []);
    } catch (error) {
      console.error(error);
    }
  }

  async function createJob(job: Omit<Job, "id">) {
    setStatusText("");
    const response = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify(job),
    });
    const data = await response.json();
    if (!response.ok) {
      setStatusText(data.message || "Failed to create job.");
      return false;
    }
    setStatusText(data.message || "Job created.");
    setJobCreated((value) => !value);
    return true;
  }

  function logoutUser() {
    localStorage.removeItem(USER_SESSION_KEY);
    setUser(null);
    setStatusText("Signed out.");
  }

  function logoutAdmin() {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setAdminToken(null);
    setDashboard(null);
    setMembers([]);
    setStatusText("Admin signed out.");
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">WH</span>
          <div>
            <h1>WritersHub Kenya</h1>
            <p>React frontend with a Go API backend.</p>
          </div>
        </div>
        <nav className="topnav">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/jobs" className="nav-link">
            Jobs
          </Link>
          <Link to="/activate" className="nav-link">
            Activate
          </Link>
          {!user ? (
            <>
              <Link to="/register" className="nav-link">
                Register
              </Link>
              <Link to="/login" className="nav-link">
                Login
              </Link>
            </>
          ) : (
            <button className="nav-button" onClick={logoutUser}>
              Logout
            </button>
          )}
          <Link to="/admin" className="nav-link">
            Admin
          </Link>
        </nav>
      </header>

      <main className="content">
        <Routes>
          <Route path="/" element={<HomePage jobs={jobs} user={user} />} />
          <Route path="/jobs" element={<JobsPage jobs={jobs} />} />
          <Route path="/jobs/:id" element={<JobDetailPage jobs={jobs} onBid={bidOnJob} user={user} />} />
          <Route path="/activate" element={<ActivatePage onActivate={activateAccount} user={user} />} />
          <Route path="/register" element={<RegisterPage onRegister={registerUser} statusText={statusText} />} />
          <Route path="/login" element={<LoginPage onLogin={loginUser} statusText={statusText} />} />
          <Route path="/admin/login" element={<AdminLoginPage onLogin={adminLogin} statusText={statusText} />} />
          <Route
            path="/admin/*"
            element={
              adminToken ? (
                <AdminShell
                  dashboard={dashboard}
                  members={members}
                  jobs={jobs}
                  onLoadDashboard={fetchAdminDashboard}
                  onLoadMembers={fetchMembers}
                  onCreateJob={createJob}
                  onLogout={logoutAdmin}
                  statusText={statusText}
                />
              ) : (
                <Navigate to="/admin/login" replace />
              )
            }
          >
            <Route index element={<AdminOverview dashboard={dashboard} />} />
            <Route path="jobs" element={<AdminJobs jobs={jobs} onCreateJob={createJob} />} />
            <Route path="members" element={<AdminMembers members={members} />} />
            <Route path="revenue" element={<AdminRevenue dashboard={dashboard} />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}

function HomePage({ jobs, user }: { jobs: Job[]; user: User | null }) {
  return (
    <section>
      <div className="hero-section">
        <div>
          <span className="eyebrow">Fraud Awareness Simulator</span>
          <h2>Experience the fake writing agency scam in a safe environment.</h2>
          <p>WritersHub Kenya replicates the victim-facing job board and activation fee flow described in the README.</p>
        </div>
        <div className="hero-panel">
          <h3>{jobs.length} fake gigs ready</h3>
          <p>{user ? `Logged in as ${user.email}.` : "Sign in to bid and activate your account."}</p>
        </div>
      </div>
    </section>
  );
}

function JobsPage({ jobs }: { jobs: Job[] }) {
  return (
    <section className="section-card">
      <h2>Job Board</h2>
      <div className="job-grid">
        {jobs.length === 0 ? (
          <div className="empty-state">No jobs available.</div>
        ) : (
          jobs.map((job) => (
            <Link key={job.id} to={`/jobs/${job.id}`} className="job-card link-card">
              <div className="job-header">
                <h4>{job.title}</h4>
                <span>{job.category}</span>
              </div>
              <p>{job.description}</p>
              <div className="job-meta">
                <span>Pay: KSh {job.pay.toLocaleString()}</span>
                <span>{job.pages} pages</span>
                <span>{job.deadline}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}

function JobDetailPage({ jobs, onBid, user }: { jobs: Job[]; onBid: (jobId: string) => Promise<void>; user: User | null }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const job = jobs.find((item) => item.id === id);

  if (!job) {
    return <NotFoundPage />;
  }

  return (
    <section className="section-card">
      <div className="section-heading-row">
        <div>
          <h2>{job.title}</h2>
          <p>{job.category}</p>
        </div>
        <button className="button button-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
      <p>{job.description}</p>
      <div className="job-meta" style={{ marginTop: "1rem" }}>
        <span>Pay: KSh {job.pay.toLocaleString()}</span>
        <span>Pages: {job.pages}</span>
        <span>Deadline: {job.deadline}</span>
      </div>
      <div className="actions-row">
        <button className="button button-primary" onClick={() => onBid(job.id)}>
          Bid Now
        </button>
        {!user && <p className="status-note">Log in to place a bid.</p>}
      </div>
    </section>
  );
}

function ActivatePage({ onActivate, user }: { onActivate: (email: string) => Promise<void>; user: User | null }) {
  const [email, setEmail] = useState(user?.email ?? "");

  return (
    <section className="section-card">
      <h2>Activation fee</h2>
      <p>Submit a KSh 500 activation request to unlock bidding and reveal the scam process.</p>
      <form
        className="form-grid"
        onSubmit={(event) => {
          event.preventDefault();
          if (email) onActivate(email);
        }}
      >
        <label>
          Email address
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <button type="submit" className="button button-primary">
          Pay KSh 500
        </button>
      </form>
    </section>
  );
}

function RegisterPage({ onRegister, statusText }: { onRegister: (email: string, password: string) => Promise<boolean>; statusText: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  return (
    <section className="section-card">
      <h2>Create account</h2>
      <form
        className="form-grid"
        onSubmit={async (event) => {
          event.preventDefault();
          const success = await onRegister(email, password);
          if (success) navigate("/login");
        }}
      >
        <label>
          Email address
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        <button type="submit" className="button button-primary">
          Register
        </button>
      </form>
      {statusText && <p className="status-message">{statusText}</p>}
    </section>
  );
}

function LoginPage({ onLogin, statusText }: { onLogin: (email: string, password: string) => Promise<boolean>; statusText: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  return (
    <section className="section-card">
      <h2>Login</h2>
      <form
        className="form-grid"
        onSubmit={async (event) => {
          event.preventDefault();
          const success = await onLogin(email, password);
          if (success) navigate("/jobs");
        }}
      >
        <label>
          Email address
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        <button type="submit" className="button button-primary">
          Sign In
        </button>
      </form>
      {statusText && <p className="status-message">{statusText}</p>}
    </section>
  );
}

function AdminLoginPage({ onLogin, statusText }: { onLogin: (username: string, password: string) => Promise<boolean>; statusText: string }) {
  const [username, setUsername] = useState("admin@grandsky.local");
  const [password, setPassword] = useState("secret123");
  const navigate = useNavigate();

  return (
    <section className="section-card">
      <h2>Admin login</h2>
      <form
        className="form-grid"
        onSubmit={async (event) => {
          event.preventDefault();
          const success = await onLogin(username, password);
          if (success) navigate("/admin");
        }}
      >
        <label>
          Username
          <input type="email" value={username} onChange={(event) => setUsername(event.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        <button type="submit" className="button button-primary">
          Sign In
        </button>
      </form>
      {statusText && <p className="status-message">{statusText}</p>}
    </section>
  );
}

function AdminShell({
  dashboard,
  members,
  jobs,
  onLoadDashboard,
  onLoadMembers,
  onCreateJob,
  onLogout,
  statusText,
}: {
  dashboard: Dashboard | null;
  members: User[];
  jobs: Job[];
  onLoadDashboard: () => Promise<void>;
  onLoadMembers: () => Promise<void>;
  onCreateJob: (job: Omit<Job, "id">) => Promise<boolean>;
  onLogout: () => void;
  statusText: string;
}) {
  useEffect(() => {
    onLoadDashboard();
    onLoadMembers();
  }, [onLoadDashboard, onLoadMembers]);

  return (
    <section>
      <div className="admin-nav">
        <Link to="/admin" className="nav-link">
          Overview
        </Link>
        <Link to="/admin/jobs" className="nav-link">
          Jobs
        </Link>
        <Link to="/admin/members" className="nav-link">
          Members
        </Link>
        <Link to="/admin/revenue" className="nav-link">
          Revenue
        </Link>
        <button className="nav-button" onClick={onLogout}>
          Sign Out
        </button>
      </div>

      <Outlet />
      {statusText && <p className="status-message">{statusText}</p>}
    </section>
  );
}

function AdminOverview({ dashboard }: { dashboard: Dashboard | null }) {
  return (
    <section className="section-card">
      <h2>Admin Dashboard</h2>
      <div className="summary-grid">
        <article>
          <h4>Total jobs</h4>
          <p>{dashboard?.totalJobs ?? 0}</p>
        </article>
        <article>
          <h4>Total users</h4>
          <p>{dashboard?.totalUsers ?? 0}</p>
        </article>
        <article>
          <h4>Activated</h4>
          <p>{dashboard?.activatedUsers ?? 0}</p>
        </article>
        <article>
          <h4>Revenue</h4>
          <p>KSh {dashboard?.totalRevenue.toLocaleString() ?? 0}</p>
        </article>
      </div>
    </section>
  );
}

function AdminJobs({ jobs, onCreateJob }: { jobs: Job[]; onCreateJob: (job: Omit<Job, "id">) => Promise<boolean> }) {
  const [newJob, setNewJob] = useState({ title: "", category: "", pay: 5000, pages: 3, deadline: "", description: "" });

  return (
    <section className="section-card">
      <h2>Manage Jobs</h2>
      <form
        className="form-grid"
        onSubmit={async (event) => {
          event.preventDefault();
          const success = await onCreateJob(newJob);
          if (success) {
            setNewJob({ title: "", category: "", pay: 5000, pages: 3, deadline: "", description: "" });
          }
        }}
      >
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
        <button type="submit" className="button button-primary">
          Publish Job
        </button>
      </form>
      <div className="job-grid" style={{ marginTop: "1.5rem" }}>
        {jobs.map((job) => (
          <article key={job.id} className="job-card">
            <div className="job-header">
              <h4>{job.title}</h4>
              <span>{job.category}</span>
            </div>
            <div className="job-meta">
              <span>KSh {job.pay.toLocaleString()}</span>
              <span>{job.pages} pages</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AdminMembers({ members }: { members: User[] }) {
  return (
    <section className="section-card">
      <h2>Members</h2>
      <div className="member-grid">
        {members.map((member) => (
          <article key={member.email} className="member-card">
            <strong>{member.email}</strong>
            <span>Status: {member.activated ? "Activated" : "Blocked"}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function AdminRevenue({ dashboard }: { dashboard: Dashboard | null }) {
  return (
    <section className="section-card">
      <h2>Revenue</h2>
      <div className="summary-grid">
        <article>
          <h4>Total revenue</h4>
          <p>KSh {dashboard?.totalRevenue.toLocaleString() ?? 0}</p>
        </article>
        <article>
          <h4>Activated users</h4>
          <p>{dashboard?.activatedUsers ?? 0}</p>
        </article>
        <article>
          <h4>Total users</h4>
          <p>{dashboard?.totalUsers ?? 0}</p>
        </article>
      </div>
    </section>
  );
}

function NotFoundPage() {
  return (
    <section className="section-card">
      <h2>Page not found</h2>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" className="button button-secondary">
        Return home
      </Link>
    </section>
  );
}

export default App;
