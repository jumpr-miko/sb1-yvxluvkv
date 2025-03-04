import { useState, useCallback } from 'react';
import { Job, JobInput } from '../types/database.types';
import { useJobsData } from './useJobs';
import { useChat } from './useChat';

/**
 * Custom hook for managing job creation and editing
 */
export function useJobManagement(options: {
  chatManager: ReturnType<typeof useChat>;
}) {
  const { chatManager } = options;
  const jobsManager = useJobsData();
  
  // Job management state
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isCreatingJob, setIsCreatingJob] = useState(true);
  const [isJobTitleTyping, setIsJobTitleTyping] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedJob, setEditedJob] = useState<Partial<Job>>({});
  const [newJob, setNewJob] = useState<Partial<Job>>({
    title: '',
    type: 'Full-time',
    location: 'Remote',
    description: '',
    requirements: [],
    status: 'active',
    candidate_count: 0
  });
  const [newRequirement, setNewRequirement] = useState('');
  const [jobError, setJobError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Handle job selection
  const handleJobSelect = useCallback((job: Job) => {
    setSelectedJob(job);
    chatManager.addAssistantMessage(`You've selected the ${job.title} position. What would you like to do with this job posting?`);
  }, [chatManager]);
  
  // Process job creation input
  const processJobCreationInput = useCallback((userInput: string) => {
    const lowerInput = userInput.toLowerCase();
    
    // Determine which field to update based on the last assistant message
    const lastAssistantMessage = chatManager.getLastAssistantMessage();
    
    setTimeout(() => {
      let response = '';
      let nextQuestion = '';
      
      // Process based on what we're currently asking about
      if (lastAssistantMessage.includes('job title')) {
        // Extract job title
        setNewJob(prev => ({ ...prev, title: userInput.trim() }));
        response = `Great! I've set the job title to "${userInput.trim()}".`;
        nextQuestion = "What type of position is this? (Full-time, Part-time, Contract, etc.)";
      } 
      else if (lastAssistantMessage.includes('type of position')) {
        // Extract job type
        let jobType = 'Full-time';
        if (lowerInput.includes('part')) jobType = 'Part-time';
        else if (lowerInput.includes('contract')) jobType = 'Contract';
        else if (lowerInput.includes('freelance')) jobType = 'Freelance';
        else if (lowerInput.includes('intern')) jobType = 'Internship';
        
        setNewJob(prev => ({ ...prev, type: jobType }));
        response = `I've set the job type to "${jobType}".`;
        nextQuestion = "What's the location for this position? (Remote, On-site, Hybrid)";
      }
      else if (lastAssistantMessage.includes('location')) {
        // Extract location
        let location = 'Remote';
        if (lowerInput.includes('on-site') || lowerInput.includes('onsite') || lowerInput.includes('office')) {
          location = 'On-site';
        } else if (lowerInput.includes('hybrid')) {
          location = 'Hybrid';
        }
        
        setNewJob(prev => ({ ...prev, location: location }));
        response = `I've set the location to "${location}".`;
        nextQuestion = "Please provide a detailed job description.";
      }
      else if (lastAssistantMessage.includes('job description')) {
        // Set job description
        setNewJob(prev => ({ ...prev, description: userInput.trim() }));
        response = "Thanks for the description! I've added it to the job posting.";
        nextQuestion = "What are the key requirements for this position? Please list them one by one, or provide them all at once.";
      }
      else if (lastAssistantMessage.includes('requirements')) {
        // Extract requirements
        const requirements = userInput
          .split(/[.,;]/)
          .map(req => req.trim())
          .filter(req => req.length > 0);
        
        if (requirements.length > 0) {
          setNewJob(prev => ({
            ...prev,
            requirements: [...(prev.requirements || []), ...requirements]
          }));
          
          response = `I've added ${requirements.length} requirement${requirements.length > 1 ? 's' : ''} to the job posting.`;
          nextQuestion = "Would you like to add more requirements? If not, you can review the job posting on the right panel and save it when ready.";
        } else {
          response = "I couldn't identify specific requirements. Could you please list them more clearly?";
          nextQuestion = "For example: 'Bachelor's degree in Computer Science, 3+ years of experience in React'";
        }
      }
      else {
        // Default response if we can't determine the context
        response = "I've updated the job posting based on your input.";
        nextQuestion = "Please review the job details on the right panel and make any necessary adjustments before saving.";
      }
      
      // Add the response and next question to messages
      chatManager.addAssistantMessage(`${response} ${nextQuestion}`);
    }, 200);
  }, [chatManager]);
  
  // Start creating a new job
  const startNewJobCreation = useCallback(() => {
    setIsCreatingJob(true);
    setSelectedJob(null);
    setNewJob({
      title: '',
      type: 'Full-time',
      location: 'Remote',
      description: '',
      requirements: [],
      status: 'active',
      candidate_count: 0
    });
    chatManager.clearMessages();
    chatManager.addAssistantMessage("Let's create a new job posting. What's the job title?");
  }, [chatManager]);
  
  // Handle job title typing complete
  const handleJobTitleTypingComplete = useCallback(() => {
    setIsJobTitleTyping(false);
  }, []);
  
  // Start editing job
  const startEditing = useCallback(() => {
    if (!selectedJob) return;
    
    setEditedJob({
      title: selectedJob.title,
      type: selectedJob.type,
      location: selectedJob.location,
      description: selectedJob.description,
      requirements: [...selectedJob.requirements],
      status: selectedJob.status,
      candidate_count: selectedJob.candidate_count
    });
    
    setIsEditing(true);
  }, [selectedJob]);
  
  // Cancel editing
  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setJobError(null);
  }, []);
  
  // Handle input change for editing job
  const handleInputChange = useCallback((field: keyof Job, value: string | string[] | number) => {
    setEditedJob(prev => ({ ...prev, [field]: value }));
  }, []);
  
  // Handle input change for new job
  const handleNewJobInputChange = useCallback((field: keyof Job, value: string | string[] | number) => {
    setNewJob(prev => ({ ...prev, [field]: value }));
  }, []);
  
  // Add requirement for edited job
  const addRequirement = useCallback(() => {
    if (!newRequirement.trim()) return;
    
    setEditedJob(prev => ({
      ...prev,
      requirements: [...(prev.requirements || []), newRequirement]
    }));
    
    setNewRequirement('');
  }, [newRequirement]);
  
  // Add requirement for new job
  const addNewJobRequirement = useCallback(() => {
    if (!newRequirement.trim()) return;
    
    setNewJob(prev => ({
      ...prev,
      requirements: [...(prev.requirements || []), newRequirement]
    }));
    
    setNewRequirement('');
  }, [newRequirement]);
  
  // Remove requirement from edited job
  const removeRequirement = useCallback((index: number) => {
    setEditedJob(prev => ({
      ...prev,
      requirements: prev.requirements?.filter((_, i) => i !== index) || []
    }));
  }, []);
  
  // Remove requirement from new job
  const removeNewJobRequirement = useCallback((index: number) => {
    setNewJob(prev => ({
      ...prev,
      requirements: prev.requirements?.filter((_, i) => i !== index) || []
    }));
  }, []);
  
  // Save edited job
  const saveJob = useCallback(async () => {
    if (!selectedJob || !editedJob.title || !editedJob.description) {
      setJobError('Title and description are required');
      return null;
    }
    
    setIsSaving(true);
    setJobError(null);
    
    try {
      const updatedJob = await jobsManager.updateJob(selectedJob.id, editedJob);
      
      if (updatedJob) {
        setSelectedJob(updatedJob);
        setIsEditing(false);
        setIsSaving(false);
        chatManager.addAssistantMessage(`I've updated the ${updatedJob.title} job posting with your changes.`);
      }
      
      return updatedJob;
    } catch (error) {
      console.error('Failed to update job:', error);
      setJobError('Failed to update job. Please try again.');
      setIsSaving(false);
      return null;
    }
  }, [selectedJob, editedJob, jobsManager, chatManager]);
  
  // Save new job
  const saveNewJob = useCallback(async () => {
    if (!newJob.title || !newJob.description) {
      setJobError('Title and description are required');
      return null;
    }
    
    setIsSaving(true);
    setJobError(null);
    
    try {
      const createdJob = await jobsManager.createJob(newJob);
      
      if (createdJob) {
        setSelectedJob(createdJob);
        setIsCreatingJob(false);
        setIsJobTitleTyping(true);
        setIsSaving(false);
        chatManager.addAssistantMessage(`Great! I've created the new ${createdJob.title} job posting. What would you like to do next?`);
      }
      
      return createdJob;
    } catch (error) {
      console.error('Failed to create job:', error);
      setJobError('Failed to create job. Please try again.');
      setIsSaving(false);
      return null;
    }
  }, [newJob, jobsManager, chatManager]);
  
  // Handle job deletion
  const handleDeleteJob = useCallback(async (jobId: string) => {
    const success = await jobsManager.deleteJob(jobId);
    if (success) {
      chatManager.addAssistantMessage('The job has been deleted successfully.');
      
      // If the deleted job was selected, prompt user to create a new one
      if (selectedJob?.id === jobId) {
        setSelectedJob(null);
        setIsCreatingJob(true);
        chatManager.clearMessages();
        chatManager.addAssistantMessage("Let's create a new job posting. What's the job title?");
      }
    }
  }, [jobsManager, chatManager, selectedJob]);
  
  // Get status color based on job status
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'paused':
        return 'bg-yellow-500';
      case 'closed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  }, []);
  
  return {
    selectedJob,
    isCreatingJob,
    isJobTitleTyping,
    isEditing,
    editedJob,
    newJob,
    newRequirement,
    jobError,
    isSaving,
    setSelectedJob,
    setNewRequirement,
    handleJobSelect,
    processJobCreationInput,
    startNewJobCreation,
    handleJobTitleTypingComplete,
    startEditing,
    cancelEditing,
    handleInputChange,
    handleNewJobInputChange,
    addRequirement,
    addNewJobRequirement,
    removeRequirement,
    removeNewJobRequirement,
    saveJob,
    saveNewJob,
    handleDeleteJob,
    getStatusColor
  };
}