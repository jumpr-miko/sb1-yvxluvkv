import { supabase } from '../lib/supabase';

// Type for database tables
type Tables = 'jobs' | 'applicants' | 'conversations';

// Custom fetcher for SWR with Supabase
export const fetcher = async <T>(resource: string): Promise<T> => {
  // Parse the resource URL to extract table and parameters
  // Expected format: [table]/[query_type]?[params]
  // Examples:
  // - jobs/all
  // - jobs/one?id=123
  // - applicants/job?jobId=456
  const [path, queryParams] = resource.split('?');
  const [table, queryType] = path.split('/');
  
  const params = new URLSearchParams(queryParams);
  
  // Select the appropriate query based on the table and query type
  switch (table as Tables) {
    case 'jobs': {
      switch (queryType) {
        case 'all': {
          const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (error) throw new Error(`Error fetching jobs: ${error.message}`);
          return data as T;
        }
        
        case 'one': {
          const id = params.get('id');
          if (!id) throw new Error('Job ID is required');
          
          const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) throw new Error(`Error fetching job: ${error.message}`);
          return data as T;
        }
        
        case 'search': {
          const query = params.get('query');
          if (!query) return [] as T;
          
          const { data, error } = await supabase
            .rpc('search_jobs', { search_query: query });
          
          if (error) throw new Error(`Error searching jobs: ${error.message}`);
          return data as T;
        }
        
        default:
          throw new Error(`Unknown query type: ${queryType}`);
      }
    }
    
    case 'applicants': {
      switch (queryType) {
        case 'job': {
          const jobId = params.get('jobId');
          if (!jobId) throw new Error('Job ID is required');
          
          const { data, error } = await supabase
            .from('applicants')
            .select('*')
            .eq('job_id', jobId)
            .order('applied_at', { ascending: false });
          
          if (error) throw new Error(`Error fetching applicants: ${error.message}`);
          return data as T;
        }
        
        case 'one': {
          const id = params.get('id');
          if (!id) throw new Error('Applicant ID is required');
          
          const { data, error } = await supabase
            .from('applicants')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) throw new Error(`Error fetching applicant: ${error.message}`);
          return data as T;
        }
        
        default:
          throw new Error(`Unknown query type: ${queryType}`);
      }
    }
    
    case 'conversations': {
      switch (queryType) {
        case 'job': {
          const jobId = params.get('jobId');
          if (!jobId) throw new Error('Job ID is required');
          
          // First check if there are any conversations for this job
          const { data, error: countError } = await supabase
            .from('conversations')
            .select('id')
            .eq('job_id', jobId);
          
          // If there are no conversations or an error occurred, return null
          if (countError || !data || data.length === 0) {
            return null as T;
          }
          
          // If we have conversations, get the full conversation
          const { data: conversationData, error } = await supabase
            .from('conversations')
            .select('*')
            .eq('job_id', jobId)
            .single();
          
          if (error) throw new Error(`Error fetching conversation: ${error.message}`);
          return conversationData as T;
        }
        
        default:
          throw new Error(`Unknown query type: ${queryType}`);
      }
    }
    
    default:
      throw new Error(`Unknown table: ${table}`);
  }
};