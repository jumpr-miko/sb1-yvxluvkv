import React, { useCallback } from 'react';
import { Edit2, Save, X, AlertCircle } from 'lucide-react';
import { Job, Applicant } from '../types/database.types';
import FileAttachmentPanel from './FileAttachmentPanel';
import JobEditor from './job/JobEditor';
import JobViewer from './job/JobViewer';

interface JobDetailsPanelProps {
  selectedJob: Job | null;
  isEditing: boolean;
  editedJob: Partial<Job>;
  newJob: Partial<Job>;
  newRequirement: string;
  setNewRequirement: (value: string) => void;
  jobError: string | null;
  isSaving: boolean;
  isJobTitleTyping: boolean;
  isCreatingJob: boolean;
  handleInputChange: (field: keyof Job, value: string | string[] | number) => void;
  handleNewJobInputChange: (field: keyof Job, value: string | string[] | number) => void;
  addRequirement: () => void;
  addNewJobRequirement: () => void;
  removeRequirement: (index: number) => void;
  removeNewJobRequirement: (index: number) => void;
  startEditing: () => void;
  cancelEditing: () => void;
  saveJob: () => Promise<Job | null>;
  saveNewJob: () => Promise<Job | null>;
  handleJobTitleTypingComplete: () => void;
  getStatusColor: (status: string) => string;
  onSendInterview?: (applicant: Applicant) => Promise<void>;
}

const JobDetailsPanel: React.FC<JobDetailsPanelProps> = ({
  selectedJob,
  isEditing,
  editedJob,
  newJob,
  newRequirement,
  setNewRequirement,
  jobError,
  isSaving,
  isJobTitleTyping,
  isCreatingJob,
  handleInputChange,
  handleNewJobInputChange,
  addRequirement,
  addNewJobRequirement,
  removeRequirement,
  removeNewJobRequirement,
  startEditing,
  cancelEditing,
  saveJob,
  saveNewJob,
  handleJobTitleTypingComplete,
  getStatusColor,
  onSendInterview = async () => {}
}) => {
  // Memoize the files updated callback to prevent unnecessary re-creation
  const handleFilesUpdated = useCallback(() => {
    // This will be called when files are added or removed
    console.log('Files updated for job:', selectedJob?.id || 'new job');
  }, [selectedJob?.id]);

  return (
    <div className="w-80 bg-secondary border-l border-border hidden lg:block overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <h2 className="font-medium text-sm">
          {isCreatingJob ? 'New Job' : 'Current Job'}
        </h2>
        {selectedJob && !isEditing && !isCreatingJob && (
          <div className="flex space-x-2">
            <button 
              onClick={startEditing}
              className="p-1 rounded hover:bg-bolt-gray text-gray-400 hover:text-bolt-light"
              title="Edit job"
            >
              <Edit2 size={16} />
            </button>
          </div>
        )}
        {isEditing && (
          <div className="flex space-x-2">
            <button 
              onClick={saveJob}
              disabled={isSaving}
              className="p-1 rounded hover:bg-bolt-gray text-green-500 hover:text-green-400 disabled:opacity-50"
              title="Save changes"
            >
              <Save size={16} />
            </button>
            <button 
              onClick={cancelEditing}
              className="p-1 rounded hover:bg-bolt-gray text-gray-400 hover:text-bolt-light"
              title="Cancel editing"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
      
      {/* Main content area - scrollable */}
      <div className="flex-1 overflow-y-auto">
        {/* Display job error if present */}
        {jobError && (
          <div className="p-4">
            <div className="mb-4 p-3 rounded-md flex items-start space-x-2 bg-red-900/20 text-red-400">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{jobError}</span>
            </div>
          </div>
        )}
        
        {isCreatingJob ? (
          /* Job Creation Form */
          <JobEditor
            isCreatingJob={true}
            editedJob={{}}
            newJob={newJob}
            jobError={jobError}
            isSaving={isSaving}
            newRequirement={newRequirement}
            setNewRequirement={setNewRequirement}
            handleInputChange={handleInputChange}
            handleNewJobInputChange={handleNewJobInputChange}
            addRequirement={addRequirement}
            addNewJobRequirement={addNewJobRequirement}
            removeRequirement={removeRequirement}
            removeNewJobRequirement={removeNewJobRequirement}
            saveJob={saveJob}
            saveNewJob={saveNewJob}
          />
        ) : selectedJob ? (
          isEditing ? (
            /* Job Editing Form */
            <div className="p-4">
              <JobEditor
                isCreatingJob={false}
                editedJob={editedJob}
                newJob={newJob}
                jobError={jobError}
                isSaving={isSaving}
                newRequirement={newRequirement}
                setNewRequirement={setNewRequirement}
                handleInputChange={handleInputChange}
                handleNewJobInputChange={handleNewJobInputChange}
                addRequirement={addRequirement}
                addNewJobRequirement={addNewJobRequirement}
                removeRequirement={removeRequirement}
                removeNewJobRequirement={removeNewJobRequirement}
                saveJob={saveJob}
                saveNewJob={saveNewJob}
              />
            </div>
          ) : (
            /* Job View Mode */
            <JobViewer
              job={selectedJob}
              isJobTitleTyping={isJobTitleTyping}
              getStatusColor={getStatusColor}
              onSendInterview={onSendInterview}
              onJobTitleTypingComplete={handleJobTitleTypingComplete}
            />
          )
        ) : (
          <div className="p-4 text-center text-gray-400">
            <p className="text-sm">No job selected</p>
          </div>
        )}
      </div>
      
      {/* File attachments panel at the bottom */}
      <FileAttachmentPanel 
        jobId={selectedJob?.id}
        readOnly={isEditing}
        onFilesUpdated={handleFilesUpdated}
      />
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(JobDetailsPanel);