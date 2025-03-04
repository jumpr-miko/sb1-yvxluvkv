export type Job = {
  id: string;
  title: string;
  type: string;
  location: string;
  description: string;
  requirements: string[];
  status: 'active' | 'paused' | 'closed';
  candidate_count: number;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type JobInput = Omit<Job, 'id' | 'created_at' | 'updated_at' | 'user_id'>;

export type Applicant = {
  id: string;
  job_id: string;
  name: string;
  email: string;
  status: 'new' | 'reviewed' | 'interviewed' | 'shortlisted' | 'rejected';
  resume_url?: string;
  interview_sent: boolean;
  interview_completed: boolean;
  applied_at: string;
  updated_at: string;
  ai_rating?: number; // Rating from 1-10
  ai_summary?: string; // AI-generated summary of the applicant
  consent_to_ai_interview: boolean; // Consent to AI interview
};

export type Conversation = {
  id: string;
  job_id: string;
  user_id: string;
  messages: Array<Message>;
  created_at: string;
  updated_at: string;
};

export type Message = {
  role: 'user' | 'assistant';
  content: string;
  isTyping?: boolean;
};

export type FileAttachment = {
  id: string;
  name: string;
  path: string;
  type: string;
  size: number;
  created_at: string;
};

export type UserSettings = {
  id: string;
  user_id: string;
  app_id: string;
  custom_instructions: string;
  created_at: string;
  updated_at: string;
};