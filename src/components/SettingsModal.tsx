import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SettingsModalProps {
  isOpen: boolean;
  appId: string;
  appName: string;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  appId,
  appName,
  onClose
}) => {
  const [customInstructions, setCustomInstructions] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen, appId]);

  const loadSettings = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        throw new Error('You must be logged in to view settings');
      }
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('custom_instructions')
        .eq('user_id', userData.user.id)
        .eq('app_id', appId)
        .maybeSingle(); // Changed from .single() to .maybeSingle()
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setCustomInstructions(data.custom_instructions || '');
      } else {
        // If no settings exist yet, use defaults
        setCustomInstructions('');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setError('Failed to load settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        throw new Error('You must be logged in to save settings');
      }
      
      // Check if settings already exist
      const { data: existingSettings, error: queryError } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', userData.user.id)
        .eq('app_id', appId)
        .maybeSingle(); // Changed from .single() to .maybeSingle()
      
      if (queryError) throw queryError;
      
      if (existingSettings) {
        // Update existing settings
        const { error } = await supabase
          .from('user_settings')
          .update({
            custom_instructions: customInstructions,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSettings.id);
        
        if (error) throw error;
      } else {
        // Create new settings
        const { error } = await supabase
          .from('user_settings')
          .insert([{
            user_id: userData.user.id,
            app_id: appId,
            custom_instructions: customInstructions
          }]);
        
        if (error) throw error;
      }
      
      setSuccess('Settings saved successfully!');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div className="bg-secondary rounded-lg border-2 border-bolt-blue shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h2 className="font-medium text-lg">{appName} Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-bolt-gray text-gray-400 hover:text-bolt-light"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="h-8 w-8 border-4 border-bolt-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 rounded-md flex items-start space-x-3 bg-red-900/20 text-red-400">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 rounded-md flex items-start space-x-3 bg-green-900/20 text-green-400">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Custom Instructions</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Define how the AI should behave when assisting with recruitment tasks. These instructions will guide the AI's responses and actions.
                </p>
                
                <div className="bg-bolt-gray p-4 rounded-md mb-4 flex items-start space-x-3">
                  <Info className="h-5 w-5 flex-shrink-0 mt-0.5 text-bolt-blue" />
                  <div className="text-sm">
                    <p className="mb-2">Examples of effective instructions:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-300">
                      <li>"Prioritize candidates with experience in React and Node.js"</li>
                      <li>"Always suggest follow-up questions for promising candidates"</li>
                      <li>"Be thorough in screening for soft skills like communication"</li>
                      <li>"For technical roles, emphasize problem-solving abilities"</li>
                    </ul>
                  </div>
                </div>
                
                <textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="Enter your custom instructions for the recruitment AI..."
                  className="w-full h-48 p-3 bg-bolt-dark border border-border text-bolt-light rounded-md focus:outline-none focus:ring-1 focus:ring-bolt-blue text-sm resize-none"
                />
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t border-border flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-bolt-gray rounded hover:bg-opacity-80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={saveSettings}
            disabled={isSaving || isLoading}
            className="px-4 py-2 bg-bolt-blue text-white rounded hover:bg-opacity-90 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(SettingsModal);