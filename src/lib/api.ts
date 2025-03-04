import { supabase } from './supabase';
import { Job, JobInput, Conversation, Message, Applicant, UserSettings } from '../types/database.types';

// Use a debounced search function to prevent excessive API calls
let searchTimeout: NodeJS.Timeout | null = null;

export async function fetchJobs() {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
  
  return data as Job[];
}

export async function searchJobs(query: string): Promise<Job[]> {
  if (!query.trim()) {
    return fetchJobs();
  }

  const { data, error } = await supabase
    .rpc('search_jobs', { search_query: query });
  
  if (error) {
    console.error('Error searching jobs:', error);
    throw error;
  }
  
  return data as Job[];
}

// Debounced search function
export function debouncedSearchJobs(
  query: string, 
  callback: (jobs: Job[]) => void, 
  errorCallback: (error: any) => void,
  delay = 300
) {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  searchTimeout = setTimeout(async () => {
    try {
      const jobs = await searchJobs(query);
      callback(jobs);
    } catch (error) {
      errorCallback(error);
    }
  }, delay);
}

export async function fetchJob(id: string) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching job:', error);
    throw error;
  }
  
  return data as Job;
}

export async function createJob(job: JobInput) {
  // Get the current user
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData?.user) {
    throw new Error('You must be logged in to create a job');
  }
  
  // Add user_id to the job data
  const jobWithUserId = {
    ...job,
    user_id: userData.user.id
  };
  
  const { data, error } = await supabase
    .from('jobs')
    .insert([jobWithUserId])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating job:', error);
    throw error;
  }
  
  return data as Job;
}

export async function updateJob(id: string, job: Partial<JobInput>) {
  const { data, error } = await supabase
    .from('jobs')
    .update({ ...job, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating job:', error);
    throw error;
  }
  
  return data as Job;
}

export async function deleteJob(id: string) {
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
  
  return true;
}

// Conversation related functions

export async function fetchConversation(jobId: string) {
  // First check if there are any conversations for this job
  const { data, error: countError } = await supabase
    .from('conversations')
    .select('id')
    .eq('job_id', jobId);
  
  // If there are no conversations or an error occurred, return null
  if (countError || !data || data.length === 0) {
    return null;
  }
  
  // If we have conversations, get the full conversation
  const { data: conversationData, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('job_id', jobId)
    .single();
  
  if (error) {
    console.error('Error fetching conversation:', error);
    throw error;
  }
  
  return conversationData as Conversation;
}

export async function saveConversation(jobId: string, messages: Message[]) {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData?.user) {
    throw new Error('You must be logged in to save a conversation');
  }
  
  // Check if a conversation already exists for this job
  const existingConversation = await fetchConversation(jobId);
  
  if (existingConversation) {
    // Update the existing conversation
    const { data, error } = await supabase
      .from('conversations')
      .update({
        messages: messages,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingConversation.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating conversation:', error);
      throw error;
    }
    
    return data as Conversation;
  } else {
    // Create a new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert([{
        job_id: jobId,
        user_id: userData.user.id,
        messages: messages
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
    
    return data as Conversation;
  }
}

// Applicant related functions

export async function fetchApplicants(jobId: string) {
  const { data, error } = await supabase
    .from('applicants')
    .select('*')
    .eq('job_id', jobId)
    .order('applied_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching applicants:', error);
    throw error;
  }
  
  return data as Applicant[];
}

export async function createApplicant(applicant: Omit<Applicant, 'id' | 'applied_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('applicants')
    .insert([applicant])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating applicant:', error);
    throw error;
  }
  
  return data as Applicant;
}

export async function updateApplicant(id: string, updates: Partial<Applicant>) {
  const { data, error } = await supabase
    .from('applicants')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating applicant:', error);
    throw error;
  }
  
  return data as Applicant;
}

export async function sendAIInterview(applicantId: string) {
  // Mark the applicant as having an interview sent
  const { data, error } = await supabase
    .from('applicants')
    .update({ 
      interview_sent: true,
      status: 'interviewed',
      updated_at: new Date().toISOString() 
    })
    .eq('id', applicantId)
    .select()
    .single();
  
  if (error) {
    console.error('Error sending AI interview:', error);
    throw error;
  }
  
  // In a real application, you would trigger an email here with the interview link
  
  return data as Applicant;
}

// User settings related functions

export async function fetchUserSettings(appId: string) {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData?.user) {
    throw new Error('You must be logged in to view settings');
  }
  
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userData.user.id)
    .eq('app_id', appId)
    .maybeSingle(); // Changed from .single() to .maybeSingle()
  
  if (error) {
    console.error('Error fetching user settings:', error);
    throw error;
  }
  
  return data as UserSettings | null;
}

export async function saveUserSettings(appId: string, customInstructions: string) {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData?.user) {
    throw new Error('You must be logged in to save settings');
  }
  
  // Check if settings already exist
  const existingSettings = await fetchUserSettings(appId);
  
  if (existingSettings) {
    // Update existing settings
    const { data, error } = await supabase
      .from('user_settings')
      .update({
        custom_instructions: customInstructions,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingSettings.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
    
    return data as UserSettings;
  } else {
    // Create new settings
    const { data, error } = await supabase
      .from('user_settings')
      .insert([{
        user_id: userData.user.id,
        app_id: appId,
        custom_instructions: customInstructions
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user settings:', error);
      throw error;
    }
    
    return data as UserSettings;
  }
}