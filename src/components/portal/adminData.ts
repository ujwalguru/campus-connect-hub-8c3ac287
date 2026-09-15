import type { Complaint, ComplaintStatus } from "./data";

export type AdminNote = { author: string; text: string; time: string };

export type AdminComplaint = Complaint & {
  student: string;
  anonymous: boolean;
  assignee: string;
  notes: AdminNote[];
};

export const departments = [
  "Unassigned",
  "IT & Networking",
  "Examination Cell",
  "Hostel Office",
  "Discipline Committee",
  "Accounts",
  "Transport",
];

export const urgencyStyles: Record<string, string> = {
  Critical: "bg-destructive/12 text-destructive border-destructive/30",
  High: "bg-warning/18 text-warning-foreground border-warning/35",
  Medium: "bg-info/12 text-info border-info/25",
  Low: "bg-muted text-muted-foreground border-border",
};

export const adminComplaints: AdminComplaint[] = [
  {
    id: "#SC-2025-0148",
    subject: "Wi-Fi not working in Hostel",
    category: "Facilities",
    date: "12 Sep 2025",
    status: "In Progress",
    urgency: "High",
    description: "Hostel block C has had no Wi-Fi connectivity for the past four days.",
    student: "Aarav Mehta",
    anonymous: false,
    assignee: "IT & Networking",
    notes: [{ author: "Admin", text: "Router replacement scheduled.", time: "13 Sep 2025" }],
  },
  {
    id: "#SC-2025-0147",
    subject: "Delay in Exam Results",
    category: "Academic Issues",
    date: "10 Sep 2025",
    status: "Pending",
    urgency: "Medium",
    description: "Semester 4 results have not been published even after three weeks.",
    student: "Anonymous",
    anonymous: true,
    assignee: "Examination Cell",
    notes: [],
  },
  {
    id: "#SC-2025-0146",
    subject: "Ragging Complaint",
    category: "Behavior & Discipline",
    date: "08 Sep 2025",
    status: "Resolved",
    urgency: "Critical",
    description: "Reported an incident of ragging near the sports ground in the evening.",
    student: "Anonymous",
    anonymous: true,
    assignee: "Discipline Committee",
    notes: [{ author: "Admin", text: "Action taken, students counselled.", time: "09 Sep 2025" }],
  },
  {
    id: "#SC-2025-0145",
    subject: "College Bus Late",
    category: "Other",
    date: "05 Sep 2025",
    status: "In Progress",
    urgency: "Low",
    description: "The 8 AM route 12 bus arrives 25 minutes late almost every day.",
    student: "Ishaan Roy",
    anonymous: false,
    assignee: "Transport",
    notes: [],
  },
  {
    id: "#SC-2025-0144",
    subject: "Library AC not functioning",
    category: "Infrastructure",
    date: "04 Sep 2025",
    status: "Under Review",
    urgency: "Medium",
    description: "Reading hall on the second floor is unusable in the afternoon heat.",
    student: "Neha Sharma",
    anonymous: false,
    assignee: "Unassigned",
    notes: [],
  },
  {
    id: "#SC-2025-0143",
    subject: "Scholarship amount not credited",
    category: "Fees & Payments",
    date: "02 Sep 2025",
    status: "Submitted",
    urgency: "High",
    description: "Merit scholarship for this semester has not reached my account yet.",
    student: "Rohit Verma",
    anonymous: false,
    assignee: "Accounts",
    notes: [],
  },
  {
    id: "#SC-2025-0142",
    subject: "Broken benches in Lab 3",
    category: "Infrastructure",
    date: "29 Aug 2025",
    status: "Resolved",
    urgency: "Low",
    description: "Four benches in the electronics lab are damaged and unsafe.",
    student: "Anonymous",
    anonymous: true,
    assignee: "Hostel Office",
    notes: [],
  },
  {
    id: "#SC-2025-0141",
    subject: "Faculty absent for three lectures",
    category: "Academic Issues",
    date: "27 Aug 2025",
    status: "Pending",
    urgency: "Medium",
    description: "Data structures classes have been cancelled repeatedly without notice.",
    student: "Simran Kaur",
    anonymous: false,
    assignee: "Unassigned",
    notes: [],
  },
];

export const weeklyTrend = [
  { day: "Mon", received: 6, resolved: 4 },
  { day: "Tue", received: 9, resolved: 5 },
  { day: "Wed", received: 4, resolved: 6 },
  { day: "Thu", received: 11, resolved: 7 },
  { day: "Fri", received: 7, resolved: 9 },
  { day: "Sat", received: 3, resolved: 5 },
  { day: "Sun", received: 5, resolved: 3 },
];

export const statusOrder: ComplaintStatus[] = [
  "Submitted",
  "Under Review",
  "In Progress",
  "Pending",
  "Resolved",
];

export const initialAnnouncements = [
  {
    id: 1,
    title: "Hostel Wi-Fi maintenance",
    body: "Network upgrade in blocks B and C on Saturday, 10 AM to 4 PM.",
    date: "13 Sep 2025",
  },
  {
    id: 2,
    title: "Results publishing window",
    body: "Semester 4 results will be declared by 20 September.",
    date: "11 Sep 2025",
  },
];

export const activityFeed = [
  { text: "Ragging complaint marked Resolved", time: "2 hours ago" },
  { text: "#SC-2025-0148 assigned to IT & Networking", time: "5 hours ago" },
  { text: "New complaint received from Accounts category", time: "Yesterday" },
  { text: "Announcement published: Hostel Wi-Fi maintenance", time: "Yesterday" },
];
