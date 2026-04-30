import type { Job } from "@/types";

export const seedJobs: Job[] = [
  {
    id: "job-001",
    title: "Literature review on climate adaptation",
    category: "Academic",
    field: "Environmental Studies",
    pay: 4500,
    pages: 12,
    dueDate: "2026-05-10",
    description:
      "Summarize recent sources on climate adaptation in East African agriculture with APA references.",
    fullAssignment:
      "Write a structured literature review covering adaptation techniques used by smallholder farmers in Kenya, Tanzania, and Uganda. Include comparative insights and at least ten recent sources.",
    submissionRules: [
      "Use APA 7th citation style and include in-text citations.",
      "Submit as .docx format only.",
      "Plagiarism score must be below 10%.",
      "Include a one-paragraph methodology section.",
    ],
    createdAt: "2026-04-18T10:00:00.000Z",
  },
  {
    id: "job-002",
    title: "Urgent nursing reflection paper",
    category: "Nursing",
    field: "Healthcare",
    pay: 6800,
    pages: 8,
    dueDate: "2026-05-04",
    description:
      "Write a reflective care-plan essay using supplied notes. High urgency bonus included.",
    fullAssignment:
      "Develop a reflection paper using Gibbs' model based on a patient-care scenario in a district hospital. Demonstrate empathy, ethics, and evidence-based interventions.",
    submissionRules: [
      "Use first-person reflective style where appropriate.",
      "Reference at least 5 peer-reviewed nursing sources.",
      "Attach a short confidentiality statement in the final paragraph.",
    ],
    createdAt: "2026-04-18T09:00:00.000Z",
  },
  {
    id: "job-003",
    title: "Business plan for small logistics startup",
    category: "Business",
    field: "Entrepreneurship",
    pay: 9200,
    pages: 16,
    dueDate: "2026-05-14",
    description:
      "Prepare market analysis, operations plan, and simple financial projections for a class project.",
    fullAssignment:
      "Draft a complete startup plan for a Nairobi-based last-mile delivery company targeting SMEs. Include market segmentation, operations, staffing, and first-year projection tables.",
    submissionRules: [
      "Include an executive summary (max 300 words).",
      "Provide projection tables in the appendix.",
      "Use clear section headings for each chapter.",
    ],
    createdAt: "2026-04-17T13:00:00.000Z",
  },
  {
    id: "job-004",
    title: "History essay: trade routes and empire",
    category: "History",
    field: "Humanities",
    pay: 3200,
    pages: 6,
    dueDate: "2026-05-07",
    description:
      "Discuss how trade networks shaped political power in one pre-modern empire of your choice.",
    fullAssignment:
      "Select one empire and explain how trade routes influenced governance, military expansion, and cultural exchange between 1200 and 1700 CE.",
    submissionRules: [
      "Use Chicago style footnotes.",
      "Integrate at least 4 primary or translated historical sources.",
      "Add a brief counterargument section.",
    ],
    createdAt: "2026-04-17T08:30:00.000Z",
  },
  {
    id: "job-005",
    title: "Data analysis report from survey results",
    category: "Statistics",
    field: "Data Analytics",
    pay: 7600,
    pages: 10,
    dueDate: "2026-05-12",
    description:
      "Interpret survey data, write findings, and include recommendations from the provided spreadsheet.",
    fullAssignment:
      "Analyze the provided survey dataset, generate descriptive summaries, and write a policy-oriented report with practical recommendations for youth employment programs.",
    submissionRules: [
      "Present at least 3 charts in the results section.",
      "Explain assumptions used in calculations.",
      "Submit both report (.docx) and chart images (.png).",
    ],
    createdAt: "2026-04-16T12:00:00.000Z",
  },
  {
    id: "job-006",
    title: "Psychology discussion responses bundle",
    category: "Psychology",
    field: "Behavioral Science",
    pay: 2500,
    pages: 4,
    dueDate: "2026-05-03",
    description:
      "Draft four discussion responses with friendly tone and two citations per response.",
    fullAssignment:
      "Prepare four forum responses addressing motivation, memory, and social behavior prompts. Each response should integrate one practical example and one short research-backed insight.",
    submissionRules: [
      "Each response must be 180-220 words.",
      "Cite at least 2 sources in total for each response.",
      "Maintain respectful discussion tone.",
    ],
    createdAt: "2026-04-16T07:15:00.000Z",
  },
];
