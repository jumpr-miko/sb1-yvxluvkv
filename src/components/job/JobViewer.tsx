import React from 'react';
import { ChevronRight, User } from 'lucide-react';
import { Job } from '../../types/database.types';
import TypeWriter from '../TypeWriter';
import ApplicantsList from '../ApplicantsList';

interface JobViewerProps {
  job: Job;
  isJobTitleTyping: boolean;
  getStatusColor: (status: string) => string;
  onSendInterview: (applicant: any) => Promise<void>;
  onJobTitleTypingComplete: () => void;
}

const JobViewer: React.FC<JobViewerProps> = ({
  job,
  isJobTitleTyping,
  getStatusColor,
  onSendInterview,
  onJobTitleTypingComplete
}) => {
  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="font-medium text-bolt-light text-sm">
          {isJobTitleTyping ? (
            <TypeWriter
              text={job.title}
              delay={{ min: 30, max: 80 }}
              onComplete={onJobTitleTypingComplete}
            />
          ) : (
            job.title
          )}
        </h3>
        <p className="text-xs text-gray-400 mt-1">{job.type} • {job.location}</p>
      </div>
      
      <div className="mb-4">
        <h4 className="text-xs font-medium text-gray-400 mb-2">Job Description</h4>
        <p className="text-xs text-bolt-light">
          {job.description}
        </p>
      </div>
      
      <div className="mb-4">
        <h4 className="text-xs font-medium text-gray-400 mb-2">Requirements</h4>
        <ul className="text-xs text-bolt-light space-y-1">
          {job.requirements.map((requirement, index) => (
            <li key={index} className="flex items-start">
              <ChevronRight className="h-3 w-3 text-bolt-blue mt-0.5 mr-1 flex-shrink-0" />
              <span>{requirement}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="mb-4">
        <h4 className="text-xs font-medium text-gray-400 mb-2">Status</h4>
        <div className="flex items-center">
          <div className={`h-2 w-2 rounded-full ${getStatusColor(job.status)} mr-2`}></div>
          <span className="text-xs text-bolt-light capitalize">
            {job.status} ({job.candidate_count} candidates)
          </span>
        </div>
      </div>
      
      {/* Applicants List Section */}
      <div className="border-t border-border pt-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-medium flex items-center text-gray-400">
            <User className="h-3.5 w-3.5 mr-1.5" />
            Applicants
          </h4>
        </div>
        <ApplicantsList 
          jobId={job.id} 
          onSendInterview={onSendInterview}
        />
      </div>
    </div>
  );
};

export default React.memo(JobViewer);