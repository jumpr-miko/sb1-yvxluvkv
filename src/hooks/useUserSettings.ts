import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { UserSettings } from '../types/database.types';

interface UseUserSettingsOptions {
  appId: string;
}

/**
 * Hook for managing user settings
 */
export function useUserSettings({ appId }: UseUserSettingsOptions) {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user settings
  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
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
        throw error;
      }
      
      setSettings(data as UserSettings);
      return data as UserSettings;
    } catch (err) {
      console.error('Error loading user settings:', err);
      setError('Failed to load settings');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [appId]);

  // Save user settings
  const saveSettings = useCallback(async (customInstructions: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        throw new Error('You must be logged in to save settings');
      }
      
      // Check if settings already exist
      if (settings?.id) {
        // Update existing settings
        const { error } = await supabase
          .from('user_settings')
          .update({
            custom_instructions: customInstructions,
            updated_at: new Date().toISOString()
          })
          .eq('id', settings.id);
        
        if (error) throw error;
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
        
        if (error) throw error;
        
        setSettings(data as UserSettings);
      }
      
      return true;
    } catch (err) {
      console.error('Error saving user settings:', err);
      setError('Failed to save settings');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [appId, settings]);

  return {
    settings,
    isLoading,
    error,
    loadSettings,
    saveSettings
  };
}