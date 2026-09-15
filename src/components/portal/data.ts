import {
  GraduationCap,
  Building2,
  Wifi,
  Users,
  IndianRupee,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";

export type ComplaintStatus = "Submitted" | "Under Review" | "In Progress" | "Pending" | "Resolved";

export type Complaint = {
  id: string;
  subject: string;
  category: string;
  date: string;
  status: ComplaintStatus;
  urgency: string;
  description: string;
};

export const categories: {
  name: string;
  hint: string;
  icon: LucideIcon;
}[] = [
  { name: "Academic Issues", hint: "Results, Attendance, Faculty", icon: GraduationCap },
  { name: "Infrastructure", hint: "Hostel, Classrooms, Labs", icon: Building2 },
  { name: "Facilities", hint: "Wi-Fi, Library, Sports", icon: Wifi },
  { name: "Behavior & Discipline", hint: "Ragging, Harassment", icon: Users },
  { name: "Fees & Payments", hint: "Refunds, Dues, Scholarship", icon: IndianRupee },
  { name: "Other", hint: "General / Miscellaneous", icon: MoreHorizontal },
];

export const initialComplaints: Complaint[] = [
  {
    id: "#SC-2025-0148",
    subject: "Wi-Fi not working in Hostel",
    category: "Facilities",
    date: "12 Sep 2025",
    status: "In Progress",
    urgency: "High",
    description: "Hostel block C has had no Wi-Fi connectivity for the past four days.",
  },
  {
    id: "#SC-2025-0147",
    subject: "Delay in Exam Results",
    category: "Academic Issues",
    date: "10 Sep 2025",
    status: "Pending",
    urgency: "Medium",
    description: "Semester 4 results have not been published even after three weeks.",
  },
  {
    id: "#SC-2025-0146",
    subject: "Ragging Complaint",
    category: "Behavior & Discipline",
    date: "08 Sep 2025",
    status: "Resolved",
    urgency: "Critical",
    description: "Reported an incident of ragging near the sports ground in the evening.",
  },
  {
    id: "#SC-2025-0145",
    subject: "College Bus Late",
    category: "Other",
    date: "05 Sep 2025",
    status: "In Progress",
    urgency: "Low",
    description: "The 8 AM route 12 bus arrives 25 minutes late almost every day.",
  },
];

export const statusStyles: Record<ComplaintStatus, string> = {
  Submitted: "bg-secondary text-secondary-foreground border-border",
  "Under Review": "bg-accent text-accent-foreground border-border",
  "In Progress": "bg-info/12 text-info border-info/25",
  Pending: "bg-warning/18 text-warning-foreground border-warning/35",
  Resolved: "bg-success/12 text-success border-success/25",
};

export const timelineSteps: ComplaintStatus[] = [
  "Submitted",
  "Under Review",
  "In Progress",
  "Resolved",
];

export function stepIndexFor(status: ComplaintStatus) {
  if (status === "Pending") return 0;
  return Math.max(0, timelineSteps.indexOf(status));
}

export const notifications = [
  { title: "Your Wi-Fi complaint moved to In Progress", time: "2 hours ago" },
  { title: "Admin requested more details on exam results", time: "Yesterday" },
  { title: "Ragging complaint has been resolved", time: "3 days ago" },
];

export const faqs = [
  {
    q: "How long does a complaint take to resolve?",
    a: "Most complaints are reviewed within 48 hours and resolved within 7 working days.",
  },
  {
    q: "Can I submit a complaint anonymously?",
    a: "Yes. Turn on the anonymous toggle in the submission form and your name stays hidden.",
  },
  {
    q: "Can I edit a complaint after submitting?",
    a: "You can add details while a complaint is still Under Review from its tracking view.",
  },
];
