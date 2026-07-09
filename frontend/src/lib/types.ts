export type User = {
  id: number;
  email: string;
  full_name: string;
  preferred_location: string | null;
};

export type Resume = {
  id: number;
  original_filename: string;
  extracted_skills: string[];
  extracted_keywords: string[];
  extracted_job_titles: string[];
  experience_level: string | null;
  processing_status: "pending" | "processing" | "completed" | "failed";
  is_active: boolean;
};

export type Job = {
  id: number;
  title: string;
  company: string | null;
  location: string | null;
  description: string | null;
  job_url: string;
  posted_at: string | null;
  keyword_source: string | null;
};

export type Match = {
  id: number;
  match_score: number;
  match_level: "strong" | "good" | "weak";
  matched_skills: string[];
  missing_skills: string[];
  matched_keywords: string[];
  match_reason: string | null;
  status: "new" | "saved" | "applied" | "ignored";
  job: Job;
};
