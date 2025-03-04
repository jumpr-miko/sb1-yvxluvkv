import React from 'react';
import { Mail, FileText, Calendar, Clock, CheckCircle, XCircle, Send, Check } from 'lucide-react';
import { Applicant } from '../../types/database.types';

interface ApplicantCardProps {
  applicant: Applicant;
  getStatusColor: (status: string) => string;
  onSendInterview: (applicant: Applicant) => void;
  formatDate: (dateString: string) => string;
}

const ApplicantCard: React.FC<ApplicantCardProps> = ({
  applicant,
  getStatusColor,
  onSendInterview,
  formatDate
}) => {
  // Check if applicant can receive AI interview
  const canSendInterview = (applicant: Applicant) => {
    return applicant.consent_to_ai_interview && 
           !applicant.interview_sent && 
           applicant.status !== 'rejected' && 
           applicant.status !== 'interviewed';
  };

  return (
    <div className="bg-bolt-gray rounded-md p-3 text-xs">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-medium text-bolt-light">{applicant.name}</h4>
          <div className="flex items-center text-gray-400 mt-1">
            <Mail className="h-3 w-3 mr-1" />
            <span>{applicant.email}</span>
          </div>
        </div>
        <div className="flex items-center">
          <div className={`h-2 w-2 rounded-full ${getStatusColor(applicant.status)} mr-1`}></div>
          <span className="capitalize">{applicant.status}</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center text-gray-400">
          <Calendar className="h-3 w-3 mr-1" />
          <span>Applied: {formatDate(applicant.applied_at)}</span>
        </div>
        
        {applicant.resume_url && (
          <a 
            href={applicant.resume_url}
            target="_blank"
            rel="noopener noreferrer" 
            className="text-bolt-blue flex items-center hover:underline"
          >
            <FileText className="h-3 w-3 mr-1" />
            <span>Resume</span>
          </a>
        )}
      </div>
      
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center text-gray-400">
          <Clock className="h-3 w-3 mr-1" />
          <span>
            {applicant.interview_sent 
              ? (applicant.interview_completed ? 'Interview completed' : 'Interview sent') 
              : 'No interview sent'}
          </span>
        </div>
        
        <div className="flex items-center text-gray-400">
          {applicant.consent_to_ai_interview ? (
            <div className="text-green-500 flex items-center">
              <Check className="h-3 w-3 mr-1" />
              <span>AI Consent</span>
            </div>
          ) : (
            <div className="text-red-500 flex items-center">
              <XCircle className="h-3 w-3 mr-1" />
              <span>No AI Consent</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center text-gray-400">
          <span>AI Rating: {applicant.ai_rating || 'N/A'}/10</span>
        </div>
        
        {canSendInterview(applicant) && (
          <button
            onClick={() => onSendInterview(applicant)}
            className="bg-bolt-blue text-white px-2 py-1 rounded flex items-center text-xs hover:bg-opacity-90"
          >
            <Send className="h-3 w-3 mr-1" />
            <span>Send AI Interview</span>
          </button>
        )}
        
        {applicant.interview_sent && !applicant.interview_completed && (
          <div className="text-yellow-500 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>Pending</span>
          </div>
        )}
        
        {applicant.interview_completed && (
          <div className="text-green-500 flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            <span>Completed</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ApplicantCard);