export type ResearchType =
  | "Failed Experiment"
  | "Negative Result"
  | "Null Result"
  | "Failed Replication"
  | "Unexpected Outcome";

export type UserRole = "researcher" | "reviewer" | "administrator";
export type AttachmentKind = "paper" | "image" | "code" | "data";

export interface User {
  id: string;
  name: string;
  email: string;
  institution: string | null;
  bio: string | null;
  role: UserRole;
  verified: boolean;
  reputation: number;
  created_at: string;
}

export interface ResearchCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface Attachment {
  id: string;
  filename: string;
  kind: AttachmentKind;
  size_bytes: number;
  uploaded_at: string;
  url: string;
}

export interface Comment {
  id: string;
  body: string;
  author: User;
  created_at: string;
}

export interface ResearchEntryListItem {
  id: string;
  slug: string;
  title: string;
  research_type: ResearchType;
  abstract: string;
  view_count: number;
  citation_count: number;
  author: User;
  category: ResearchCategory;
  published_at: string | null;
}

export interface ResearchEntryDetail extends ResearchEntryListItem {
  research_question: string;
  hypothesis: string;
  methodology: string;
  expected_outcome: string;
  actual_outcome: string;
  why_it_failed: string;
  lessons_learned: string;
  references: string | null;
  attachments: Attachment[];
  comments: Comment[];
}

export interface ResearchEntryCreatePayload {
  title: string;
  category_id: string;
  research_type: ResearchType;
  abstract: string;
  research_question: string;
  hypothesis: string;
  methodology: string;
  expected_outcome: string;
  actual_outcome: string;
  why_it_failed: string;
  lessons_learned: string;
  references?: string;
}
