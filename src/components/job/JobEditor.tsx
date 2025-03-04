import React, { useCallback } from 'react';
import { Plus, X, AlertCircle } from 'lucide-react';
import { Job, JobInput } from '../../types/database.types';

interface JobEditorProps {
  isCreatingJob: boolean;
  editedJob: Partial<Job>;
  newJob: Partial<JobInput>;
  jobError: string | null;
  isSaving: boolean;
  newRequirement: string;
  setNewRequirement: (value: string) => void;
  handleInputChange: (field: keyof JobInput, value: string | string[] | number) => void;
  handleNewJobInputChange: (field: keyof JobInput, value: string | string[] | number) => void;
  addRequirement: () => void;
  addNewJobRequirement: () => void;
  removeRequirement: (index: number) => void;
  removeNewJobRequirement: (index: number) => void;
  saveJob: () => Promise<Job | null>;
  saveNewJob: () => Promise<Job | null>;
}

const JobEditor: React.FC<JobEditorProps> = ({
  isCreatingJob,
  editedJob,
  newJob,
  jobError,
  isSaving,
  newRequirement,
  setNewRequirement,
  handleInputChange,
  handleNewJobInputChange,
  addRequirement,
  addNewJobRequirement,
  removeRequirement,
  removeNewJobRequirement,
  saveJob,
  saveNewJob
}) => {
  // Memoize the handlers to prevent unnecessary re-creation
  const handleRequirementInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewRequirement(e.target.value);
  }, [setNewRequirement]);

  const handleRequirementKeyPress = useCallback((e: React.KeyboardEvent, addFn: () => void) => {
    if (e.key === 'Enter') {
      addFn();
    }
  }, []);

  // Render job creation form
  const renderJobCreationForm = () => (
    <div className="p-4">
      {jobError && (
        <div className="mb-4 p-3 rounded-md flex items-start space-x-2 bg-red-900/20 text-red-400">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{jobError}</span>
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-400 mb-1">
          Job Title
        </label>
        <input
          type="text"
          value={newJob.title || ''}
          onChange={(e) => handleNewJobInputChange('title', e.target.value)}
          className="w-full p-2 bg-bolt-dark border border-border text-bolt-light rounded-md focus:outline-none focus:ring-1 focus:ring-bolt-blue text-sm mb-2"
          placeholder="Enter job title"
        />
        
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Type
            </label>
            <select
              value={newJob.type || 'Full-time'}
              onChange={(e) => handleNewJobInputChange('type', e.target.value)}
              className="w-full p-2 bg-bolt-dark border border-border text-bolt-light rounded-md focus:outline-none focus:ring-1 focus:ring-bolt-blue text-sm"
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Freelance">Freelance</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Location
            </label>
            <select
              value={newJob.location || 'Remote'}
              onChange={(e) => handleNewJobInputChange('location', e.target.value)}
              className="w-full p-2 bg-bolt-dark border border-border text-bolt-light rounded-md focus:outline-none focus:ring-1 focus:ring-bolt-blue text-sm"
            >
              <option value="Remote">Remote</option>
              <option value="On-site">On-site</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Job Description
          </label>
          <textarea
            value={newJob.description || ''}
            onChange={(e) => handleNewJobInputChange('description', e.target.value)}
            rows={4}
            className="w-full p-2 bg-bolt-dark border border-border text-bolt-light rounded-md focus:outline-none focus:ring-1 focus:ring-bolt-blue text-sm resize-none"
            placeholder="Enter job description"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Requirements
          </label>
          <ul className="text-xs text-bolt-light space-y-1 mb-2">
            {newJob.requirements?.map((requirement, index) => (
              <li key={index} className="flex items-start">
                <button
                  onClick={() => removeNewJobRequirement(index)}
                  className="p-0.5 text-red-500 hover:text-red-400 mr-1"
                >
                  <X size={12} />
                </button>
                <span>{requirement}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-center mt-2">
            <input
              type="text"
              value={newRequirement}
              onChange={handleRequirementInputChange}
              placeholder="Add requirement"
              className="flex-1 p-1.5 text-xs bg-bolt-dark border border-border text-bolt-light rounded-md focus:outline-none focus:ring-1 focus:ring-bolt-blue"
              onKeyPress={(e) => handleRequirementKeyPress(e, addNewJobRequirement)}
            />
            <button
              onClick={addNewJobRequirement}
              className="ml-2 p-1.5 bg-bolt-blue text-white rounded-md hover:bg-opacity-90 focus:outline-none"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>
      </div>
      
      <button
        onClick={saveNewJob}
        disabled={isSaving}
        className="w-full py-2 px-4 bg-bolt-blue text-white rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bolt-blue focus:ring-offset-bolt-dark disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? 'Saving...' : 'Save Job'}
      </button>
    </div>
  );

  // Render job edit form
  const renderJobEditForm = () => (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1">
        Job Title
      </label>
      <input
        type="text"
        value={editedJob.title || ''}
        onChange={(e) => handleInputChange('title', e.target.value)}
        className="w-full p-2 bg-bolt-dark border border-border text-bolt-light rounded-md focus:outline-none focus:ring-1 focus:ring-bolt-blue text-sm mb-2"
      />
      
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Type
          </label>
          <select
            value={editedJob.type || ''}
            onChange={(e) => handleInputChange('type', e.target.value)}
            className="w-full p-2 bg-bolt-dark border border-border text-bolt-light rounded-md focus:outline-none focus:ring-1 focus:ring-bolt-blue text-sm"
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Freelance">Freelance</option>
            <option value="Internship">Internship</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Location
          </label>
          <select
            value={editedJob.location || ''}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full p-2 bg-bolt-dark border border-border text-bolt-light rounded-md focus:outline-none focus:ring-1 focus:ring-bolt-blue text-sm"
          >
            <option value="Remote">Remote</option>
            <option value="On-site">On-site</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Status
          </label>
          <select
            value={editedJob.status || ''}
            onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'paused' | 'closed')}
            className="w-full p-2 bg-bolt-dark border border-border text-bolt-light rounded-md focus:outline-none focus:ring-1 focus:ring-bolt-blue text-sm"
          >
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Candidates
          </label>
          <input
            type="number"
            min="0"
            value={editedJob.candidate_count || 0}
            onChange={(e) => handleInputChange('candidate_count', parseInt(e.target.value) || 0)}
            className="w-full p-2 bg-bolt-dark border border-border text-bolt-light rounded-md focus:outline-none focus:ring-1 focus:ring-bolt-blue text-sm"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-xs font-medium text-gray-400 mb-1">
          Job Description
        </label>
        <textarea
          value={editedJob.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          className="w-full p-2 bg-bolt-dark border border-border text-bolt-light rounded-md focus:outline-none focus:ring-1 focus:ring-bolt-blue text-sm resize-none"
        />
      </div>

      <div className="mt-4">
        <label className="block text-xs font-medium text-gray-400 mb-1">
          Requirements
        </label>
        <ul className="text-xs text-bolt-light space-y-1 mb-2">
          {editedJob.requirements?.map((requirement, index) => (
            <li key={index} className="flex items-start">
              <button
                onClick={() => removeRequirement(index)}
                className="p-0.5 text-red-500 hover:text-red-400 mr-1"
              >
                <X size={12} />
              </button>
              <span>{requirement}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-center mt-2">
          <input
            type="text"
            value={newRequirement}
            onChange={handleRequirementInputChange}
            placeholder="Add requirement"
            className="flex-1 p-1.5 text-xs bg-bolt-dark border border-border text-bolt-light rounded-md focus:outline-none focus:ring-1 focus:ring-bolt-blue"
            onKeyPress={(e) => handleRequirementKeyPress(e, addRequirement)}
          />
          <button
            onClick={addRequirement}
            className="ml-2 p-1.5 bg-bolt-blue text-white rounded-md hover:bg-opacity-90 focus:outline-none"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>
    </div>
  );

  return isCreatingJob ? renderJobCreationForm() : renderJobEditForm();
};

export default React.memo(JobEditor);