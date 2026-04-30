export type Job = {
  id: string;
  title: string;
  category: string;
  field: string;
  pay: number;
  pages: number;
  dueDate: string;
  description: string;
  fullAssignment: string;
  submissionRules: string[];
  createdAt: string;
};

export type NewJobInput = Omit<Job, "id" | "createdAt">;

export type WriterUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  bio: string;
  createdAt: string;
};

export type TaskStatus = "open" | "in_review" | "submitted";

export type TaskApplication = {
  id: string;
  userId: string;
  jobId: string;
  status: TaskStatus;
  appliedAt: string;
  updatedAt: string;
  statusHistory: Array<{
    status: TaskStatus;
    at: string;
  }>;
};

export type TaskMessage = {
  id: string;
  jobId: string;
  fromRole: "admin" | "writer";
  fromName: string;
  text: string;
  createdAt: string;
};
