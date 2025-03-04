import React, { useCallback } from 'react';
import { Code, User, Settings, LogOut, Plus, Bot, FileText, FileInput as FileInvoice, BarChart4, Trash2 } from 'lucide-react';
import { Job } from '../types/database.types';

// Define app types
export interface App {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface JobListSidebarProps {
  jobs: Job[];
  selectedJob: Job | null;
  currentApp: App;
  apps: App[];
  onJobSelect: (job: Job) => void;
  onLogout: () => void;
  onToggleAppSwitcher: () => void;
  onToggleSidebar: () => void;
  onStartNewJobCreation: () => void;
  onOpenSettings: () => void;
  onDeleteJob?: (id: string) => void;
}

const JobListSidebar: React.FC<JobListSidebarProps> = ({
  jobs,
  selectedJob,
  currentApp,
  apps,
  onJobSelect,
  onLogout,
  onToggleAppSwitcher,
  onToggleSidebar,
  onStartNewJobCreation,
  onOpenSettings,
  onDeleteJob
}) => {
  // Handle job deletion with confirmation
  const handleDeleteJob = useCallback((e: React.MouseEvent, jobId: string) => {
    e.stopPropagation(); // Prevent job selection
    
    if (window.confirm('Are you sure you want to delete this job?')) {
      onDeleteJob?.(jobId);
    }
  }, [onDeleteJob]);

  return (
    <div className="w-64 bg-secondary border-r border-border flex flex-col">
      <div 
        className="p-4 border-b border-border flex flex-col items-center cursor-pointer"
        onClick={onToggleAppSwitcher}
      >
        <div className="h-10 w-10 mb-1 flex items-center justify-center text-bolt-blue">
          {currentApp.icon}
        </div>
        <h1 className="text-lg font-bold">{currentApp.name}</h1>
      </div>
      
      <div className="p-3">
        <button 
          className="w-full flex items-center justify-between p-2 bg-bolt-blue bg-opacity-10 text-bolt-blue rounded-md hover:bg-opacity-20 transition-all"
          onClick={onStartNewJobCreation}
        >
          <div className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            <span>New Job</span>
          </div>
          <span className="h-4 w-4">›</span>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs uppercase tracking-wider text-gray-400">Recent Jobs</h2>
            <button 
              className="text-gray-400 hover:text-bolt-light"
              onClick={onStartNewJobCreation}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <ul className="space-y-1">
            {jobs.map(job => (
              <li 
                key={job.id}
                className={`p-2 rounded cursor-pointer text-sm flex items-center justify-between transition-colors ${
                  selectedJob?.id === job.id 
                    ? 'bg-bolt-blue bg-opacity-20 text-bolt-blue' 
                    : 'hover:bg-bolt-gray'
                }`}
                onClick={() => onJobSelect(job)}
              >
                <div className="flex items-center overflow-hidden">
                  <Code className={`h-4 w-4 mr-2 flex-shrink-0 ${selectedJob?.id === job.id ? 'text-bolt-blue' : 'text-gray-400'}`} />
                  <span className="truncate">{job.title}</span>
                </div>
                {onDeleteJob && (
                  <button 
                    className="ml-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-bolt-gray hover:text-red-500 transition-opacity"
                    onClick={(e) => handleDeleteJob(e, job.id)}
                    title="Delete job"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </li>
            ))}
            {jobs.length === 0 && (
              <li className="p-2 text-center text-sm text-gray-400">
                No jobs found
              </li>
            )}
          </ul>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs uppercase tracking-wider text-gray-400">Candidates</h2>
            <button className="text-gray-400 hover:text-bolt-light">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <ul className="space-y-1">
            <li className="p-2 rounded hover:bg-bolt-gray cursor-pointer text-sm flex items-center">
              <User className="h-4 w-4 mr-2 text-green-500" />
              <span>Shortlisted</span>
              <span className="ml-auto text-xs bg-bolt-gray px-1.5 py-0.5 rounded">12</span>
            </li>
            <li className="p-2 rounded hover:bg-bolt-gray cursor-pointer text-sm flex items-center">
              <User className="h-4 w-4 mr-2 text-yellow-500" />
              <span>Interviewed</span>
              <span className="ml-auto text-xs bg-bolt-gray px-1.5 py-0.5 rounded">5</span>
            </li>
            <li className="p-2 rounded hover:bg-bolt-gray cursor-pointer text-sm flex items-center">
              <User className="h-4 w-4 mr-2 text-red-500" />
              <span>Rejected</span>
              <span className="ml-auto text-xs bg-bolt-gray px-1.5 py-0.5 rounded">8</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="p-3 border-t border-border">
        <div 
          className="flex items-center space-x-2 p-2 rounded hover:bg-bolt-gray cursor-pointer text-sm"
          onClick={onOpenSettings}
        >
          <Settings className="h-4 w-4 text-gray-400" />
          <span>Settings</span>
        </div>
        <div 
          className="flex items-center space-x-2 p-2 rounded hover:bg-bolt-gray cursor-pointer text-sm"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 text-gray-400" />
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
};

// Define default apps
export const defaultApps: App[] = [
  {
    id: 'recruitment',
    name: 'Recruitment',
    icon: <Bot size={32} strokeWidth={1.5} />
  },
  {
    id: 'quoting',
    name: 'Quoting',
    icon: <FileText size={32} strokeWidth={1.5} />
  },
  {
    id: 'invoicing',
    name: 'Invoicing',
    icon: <FileInvoice size={32} strokeWidth={1.5} />
  },
  {
    id: 'marketing',
    name: 'Marketing',
    icon: <BarChart4 size={32} strokeWidth={1.5} />
  }
];

// Memoize the component to prevent unnecessary re-renders
export default React.memo(JobListSidebar);