import { useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import { Conversation, Message } from '../types/database.types';
import { fetcher } from './useSWRFetcher';
import { supabase } from '../lib/supabase';

export function useConversation(jobId?: string | null) {
  // SWR key that depends on jobId
  const key = jobId ? `conversations/job?jobId=${jobId}` : null;
  
  // Fetch conversation for a specific job
  const { data: conversation, error, isLoading } = useSWR<Conversation | null>(key, fetcher);
  
  // Save messages to conversation
  const saveMessages = useCallback(async (messages: Message[]): Promise<Conversation | null> => {
    if (!jobId) return null;
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        throw new Error('You must be logged in to save a conversation');
      }
      
      if (conversation) {
        // Update existing conversation
        const { data, error } = await supabase
          .from('conversations')
          .update({
            messages: messages,
            updated_at: new Date().toISOString()
          })
          .eq('id', conversation.id)
          .select()
          .single();
        
        if (error) throw error;
        
        // Update the cache with the updated conversation
        mutate(key, data, false);
        
        return data;
      } else {
        // Create new conversation
        const { data, error } = await supabase
          .from('conversations')
          .insert([{
            job_id: jobId,
            user_id: userData.user.id,
            messages: messages
          }])
          .select()
          .single();
        
        if (error) throw error;
        
        // Update the cache with the new conversation
        mutate(key, data, false);
        
        return data;
      }
    } catch (error) {
      console.error('Error saving conversation:', error);
      return null;
    }
  }, [jobId, conversation, key]);

  return {
    conversation,
    messages: conversation?.messages as Message[] || [],
    isLoading,
    error,
    saveMessages
  };
}