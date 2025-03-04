import React from 'react';
import { Applicant } from '../types/database.types';
import { Bot, X, Check, AlertCircle, Send } from 'lucide-react';

interface InterviewConfirmationModalProps {
  isOpen: boolean;
  applicant: Applicant | null;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

const InterviewConfirmationModal: React.FC<InterviewConfirmationModalProps> = ({
  isOpen,
  applicant,
  onConfirm,
  onCancel
}) => {
  if (!isOpen || !applicant) return null;

  const canBeInterviewed = applicant.consent_to_ai_interview && 
                          !applicant.interview_sent && 
                          applicant.status !== 'rejected' && 
                          applicant.status !== 'interviewed';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-secondary rounded-lg shadow-xl w-96 overflow-hidden max-w-full">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h2 className="font-medium">Send AI Interview</h2>
          <button 
            onClick={onCancel}
            className="p-1 rounded hover:bg-bolt-gray text-gray-400 hover:text-bolt-light"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-5">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 bg-bolt-blue bg-opacity-20 rounded-full flex items-center justify-center text-bolt-blue">
              <Bot size={24} />
            </div>
          </div>
          
          <div className="bg-bolt-gray p-3 rounded-md mb-4">
            <p className="font-medium text-bolt-light">{applicant.name}</p>
            <p className="text-sm text-gray-400">{applicant.email}</p>
            <div className="flex items-center mt-2">
              <div className={`h-2 w-2 rounded-full ${
                applicant.consent_to_ai_interview ? 'bg-green-500' : 'bg-red-500'
              } mr-2`}></div>
              <span className="text-sm">
                {applicant.consent_to_ai_interview 
                  ? 'Has consented to AI interview' 
                  : 'Has NOT consented to AI interview'}
              </span>
            </div>
          </div>
          
          {!canBeInterviewed ? (
            <div className="bg-red-900/20 text-red-400 p-3 rounded-md mb-4 flex items-start">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 mr-2" />
              <div>
                <p className="font-medium">Cannot send AI interview</p>
                <p className="text-sm mt-1">
                  {!applicant.consent_to_ai_interview 
                    ? 'This applicant has not provided consent for AI interviews.' 
                    : applicant.status === 'rejected'
                    ? 'This applicant has been rejected.'
                    : applicant.status === 'interviewed'
                    ? 'This applicant has already been interviewed.'
                    : 'An interview has already been sent to this applicant.'}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400 mb-4">
              The candidate will receive an email with instructions on how to complete the AI-powered interview. You'll be notified once they complete it.
            </p>
          )}
          
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2 px-4 bg-bolt-gray rounded hover:bg-opacity-80 transition-colors"
            >
              Cancel
            </button>
            {canBeInterviewed ? (
              <button
                onClick={onConfirm}
                className="flex-1 py-2 px-4 bg-bolt-blue text-white rounded hover:bg-opacity-90 transition-colors flex items-center justify-center"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Interview
              </button>
            ) : (
              <button
                onClick={onCancel}
                className="flex-1 py-2 px-4 bg-bolt-gray text-gray-400 rounded opacity-50 cursor-not-allowed"
                disabled
              >
                Can't Send
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(InterviewConfirmationModal);