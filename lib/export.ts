import type { Job, TaskApplication, WriterUser } from "@/types";

function csvEscape(value: string) {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}

export function exportDashboardCsv(
  applications: TaskApplication[],
  jobs: Job[],
  writers: WriterUser[],
) {
  const jobMap = new Map(jobs.map((job) => [job.id, job]));
  const writerMap = new Map(writers.map((writer) => [writer.id, writer]));

  const headers = ["Writer", "Email", "Task", "Status", "Applied At", "Updated At"];
  const rows = applications.map((application) => {
    const job = jobMap.get(application.jobId);
    const writer = writerMap.get(application.userId);
    return [
      writer?.name ?? "",
      writer?.email ?? "",
      job?.title ?? "",
      application.status,
      application.appliedAt,
      application.updatedAt,
    ];
  });

  const csv = [headers, ...rows]
    .map((row) => row.map((col) => csvEscape(String(col))).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `writershub-dashboard-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
