import { useState, useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import { Job, JobInput } from '../types/database.types';
import { fetcher } from './useSWRFetcher';
import { supabase } from '../lib/supabase';

export function useJobsData() {
  // Use SWR for data fetching with automatic caching and revalidation
  const { data: jobs, error, isLoading } = useSWR<Job[]>('jobs/all', fetcher);
  
  // Select job by ID
  const getJobById = useCallback((id: string): Job | undefined => {
    return jobs?.find(job => job.id === id);
  }, [jobs]);
  
  // Update jobs search results
  const setSearchResults = useCallback((searchResults: Job[]) => {
    // This updates the cache without triggering a revalidation
    mutate('jobs/all', searchResults, false);
  }, []);
  
  // Create a new job
  const createJob = useCallback(async (job: JobInput): Promise<Job | null> => {
    try {
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
      
      if (error) throw error;
      
      // Update the cache with the new job
      mutate('jobs/all', (currentJobs: Job[] = []) => [data, ...currentJobs], false);
      
      return data;
    } catch (error) {
      console.error('Error creating job:', error);
      return null;
    }
  }, []);
  
  // Update an existing job
  const updateJob = useCallback(async (id: string, updates: Partial<JobInput>): Promise<Job | null> => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update the cache with the updated job
      mutate('jobs/all', (currentJobs: Job[] = []) => 
        currentJobs.map(job => job.id === id ? data : job), 
        false
      );
      
      return data;
    } catch (error) {
      console.error('Error updating job:', error);
      return null;
    }
  }, []);
  
  // Delete a job
  const deleteJob = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update the cache by removing the deleted job
      mutate('jobs/all', (currentJobs: Job[] = []) => 
        currentJobs.filter(job => job.id !== id), 
        false
      );
      
      return true;
    } catch (error) {
      console.error('Error deleting job:', error);
      return false;
    }
  }, []);
  
  // Search jobs by query
  const searchJobs = useCallback(async (query: string): Promise<Job[]> => {
    if (!query.trim()) {
      // If query is empty, return all jobs
      const allJobs = await fetcher<Job[]>('jobs/all');
      return allJobs;
    }
    
    try {
      const results = await fetcher<Job[]>(`jobs/search?query=${encodeURIComponent(query)}`);
      return results;
    } catch (error) {
      console.error('Error searching jobs:', error);
      return [];
    }
  }, []);

  return {
    jobs: jobs || [],
    isLoading,
    error,
    getJobById,
    setSearchResults,
    createJob,
    updateJob,
    deleteJob,
    searchJobs
  };
}