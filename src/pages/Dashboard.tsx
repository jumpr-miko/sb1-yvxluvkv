import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useJobsData } from '../hooks/useJobs';
import { useChat } from '../hooks/useChat';
import { useSnackbar } from '../hooks/useSnackbar';
import { useJobManagement } from '../hooks/useJobManagement';
import JobListSidebar, { defaultApps, App } from '../components/JobListSidebar';
import AppSwitcherModal from '../components/AppSwitcherModal';
import ChatPanel from '../components/ChatPanel';
import DashboardHeader from '../components/DashboardHeader';
import JobDetailsPanel from '../components/JobDetailsPanel';
import Snackbar from '../components/Snackbar';
import SettingsModal from '../components/SettingsModal';
import { Job, Applicant } from '../types/database.types';
import { sendAIInterview } from '../lib/api';

function Dashboard() {
  // App state
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [currentApp, setCurrentApp] = useState<App>(defaultApps[0]);
  const [appSwitcherOpen, setAppSwitcherOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  
  // Hooks
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const jobsManager = useJobsData();
  const chatManager = useChat({ 
    jobId: null // Will be updated once a job is selected
  });
  const snackbar = useSnackbar();

  // Initialize the job management hook
  const jobManager = useJobManagement({
    chatManager
  });

  // Update chat's jobId when selectedJob changes
  useEffect(() => {
    chatManager.updateJobId(jobManager.selectedJob?.id || null);
  }, [jobManager.selectedJob]); // Remove chatManager from dependencies to avoid infinite loop

  // Handle logout
  const handleLogout = useCallback(async () => {
    await signOut();
    navigate('/login');
  }, [signOut, navigate]);

  // Toggle sidebar visibility
  const toggleSidebar = useCallback(() => {
    setSidebarVisible(prev => !prev);
  }, []);

  // Handle search results
  const handleSearchResults = useCallback((jobs: Job[]) => {
    jobsManager.setSearchResults(jobs);
  }, [jobsManager]);

  // Toggle app switcher
  const toggleAppSwitcher = useCallback(() => {
    setAppSwitcherOpen(prev => !prev);
  }, []);

  // Toggle settings modal
  const toggleSettingsModal = useCallback(() => {
    setSettingsModalOpen(prev => !prev);
  }, []);

  // Switch app
  const switchApp = useCallback((app: App) => {
    setCurrentApp(app);
    setAppSwitcherOpen(false);
    chatManager.addAssistantMessage(`You've switched to the ${app.name} app. How can I help you with ${app.name.toLowerCase()}?`);
  }, [chatManager]);

  // Handle sending a message
  const handleSendMessage = useCallback(() => {
    if (!chatManager.input.trim()) return;
    
    // Add user message
    chatManager.addUserMessage(chatManager.input);
    
    // Process user input for job creation if in creation mode
    if (jobManager.isCreatingJob) {
      jobManager.processJobCreationInput(chatManager.input);
    } else {
      // Simulate AI response for regular chat
      setTimeout(() => {
        const randomResponse = chatManager.generateRandomResponse();
        chatManager.addAssistantMessage(randomResponse);
      }, 1000);
    }
    
    chatManager.clearInput();
  }, [chatManager, jobManager]);

  // Handle sending AI interview
  const handleSendInterview = useCallback(async (applicant: Applicant) => {
    try {
      await sendAIInterview(applicant.id);
      
      snackbar.showSuccess(`AI Interview sent to ${applicant.name}`);
      
      // Add message to chat
      chatManager.addAssistantMessage(
        `I've sent an AI interview to ${applicant.name}. They'll receive an email with instructions on how to complete it. I'll notify you once they've completed the interview.`
      );
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error sending AI interview:', error);
      snackbar.showError('Failed to send AI interview. Please try again.');
      return Promise.reject(error);
    }
  }, [chatManager, snackbar]);

  return (
    <div className="flex h-screen bg-bolt-dark text-bolt-light">
      {/* App Switcher Modal */}
      <AppSwitcherModal
        isOpen={appSwitcherOpen}
        currentApp={currentApp}
        apps={defaultApps}
        onClose={toggleAppSwitcher}
        onSwitchApp={switchApp}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        appId={currentApp.id}
        appName={currentApp.name}
        onClose={toggleSettingsModal}
      />

      {/* Sidebar */}
      {sidebarVisible && (
        <JobListSidebar
          jobs={jobsManager.jobs}
          selectedJob={jobManager.selectedJob}
          currentApp={currentApp}
          apps={defaultApps}
          onJobSelect={jobManager.handleJobSelect}
          onLogout={handleLogout}
          onToggleAppSwitcher={toggleAppSwitcher}
          onToggleSidebar={toggleSidebar}
          onStartNewJobCreation={jobManager.startNewJobCreation}
          onOpenSettings={toggleSettingsModal}
          onDeleteJob={jobManager.handleDeleteJob}
        />
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <DashboardHeader
          currentApp={currentApp}
          onToggleSidebar={toggleSidebar}
          onSearch={handleSearchResults}
          userEmail={user?.email}
        />
        
        {/* Chat Panel */}
        <ChatPanel
          messages={chatManager.messages}
          input={chatManager.input}
          setInput={chatManager.setInput}
          onSendMessage={handleSendMessage}
          loading={chatManager.loading}
          chatEndRef={chatManager.chatEndRef}
          messagesContainerRef={chatManager.messagesContainerRef}
        />
      </div>
      
      {/* Job Details Panel */}
      <JobDetailsPanel
        selectedJob={jobManager.selectedJob}
        isEditing={jobManager.isEditing}
        editedJob={jobManager.editedJob}
        newJob={jobManager.newJob}
        newRequirement={jobManager.newRequirement}
        setNewRequirement={jobManager.setNewRequirement}
        jobError={jobManager.jobError}
        isSaving={jobManager.isSaving}
        isJobTitleTyping={jobManager.isJobTitleTyping}
        isCreatingJob={jobManager.isCreatingJob}
        handleInputChange={jobManager.handleInputChange}
        handleNewJobInputChange={jobManager.handleNewJobInputChange}
        addRequirement={jobManager.addRequirement}
        addNewJobRequirement={jobManager.addNewJobRequirement}
        removeRequirement={jobManager.removeRequirement}
        removeNewJobRequirement={jobManager.removeNewJobRequirement}
        startEditing={jobManager.startEditing}
        cancelEditing={jobManager.cancelEditing}
        saveJob={jobManager.saveJob}
        saveNewJob={jobManager.saveNewJob}
        handleJobTitleTypingComplete={jobManager.handleJobTitleTypingComplete}
        getStatusColor={jobManager.getStatusColor}
        onSendInterview={handleSendInterview}
      />
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        variant={snackbar.variant}
        autoHideDuration={snackbar.autoHideDuration}
        onClose={snackbar.hideSnackbar}
      />
    </div>
  );
}

export default React.memo(Dashboard);