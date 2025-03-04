import { useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import { Applicant } from '../types/database.types';
import { fetcher } from './useSWRFetcher';
import { supabase } from '../lib/supabase';

export function useApplicants(jobId?: string | null) {
  // SWR key that depends on jobId
  const key = jobId ? `applicants/job?jobId=${jobId}` : null;
  
  // Fetch applicants for a specific job
  const { data: applicants, error, isLoading } = useSWR<Applicant[]>(key, fetcher);
  
  // Create a new applicant
  const createApplicant = useCallback(async (applicant: Omit<Applicant, 'id' | 'applied_at' | 'updated_at'>): Promise<Applicant | null> => {
    if (!jobId) return null;
    
    try {
      const { data, error } = await supabase
        .from('applicants')
        .insert([applicant])
        .select()
        .single();
      
      if (error) throw error;
      
      // Update the cache with the new applicant
      mutate(key, (currentApplicants: Applicant[] = []) => 
        [data, ...currentApplicants], 
        false
      );
      
      return data;
    } catch (error) {
      console.error('Error creating applicant:', error);
      return null;
    }
  }, [jobId, key]);
  
  // Update an existing applicant
  const updateApplicant = useCallback(async (id: string, updates: Partial<Applicant>): Promise<Applicant | null> => {
    try {
      const { data, error } = await supabase
        .from('applicants')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update the cache with the updated applicant
      mutate(key, (currentApplicants: Applicant[] = []) => 
        currentApplicants.map(applicant => applicant.id === id ? data : applicant), 
        false
      );
      
      return data;
    } catch (error) {
      console.error('Error updating applicant:', error);
      return null;
    }
  }, [key]);
  
  // Send AI interview to an applicant
  const sendAIInterview = useCallback(async (applicantId: string): Promise<Applicant | null> => {
    try {
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
      
      if (error) throw error;
      
      // Update the cache with the updated applicant
      mutate(key, (currentApplicants: Applicant[] = []) => 
        currentApplicants.map(applicant => applicant.id === applicantId ? data : applicant), 
        false
      );
      
      return data;
    } catch (error) {
      console.error('Error sending AI interview:', error);
      return null;
    }
  }, [key]);

  return {
    applicants: applicants || [],
    isLoading,
    error,
    createApplicant,
    updateApplicant,
    sendAIInterview
  };
}