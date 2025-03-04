import React, { useState, useEffect, useCallback } from 'react';
import { Users } from 'lucide-react';
import { Applicant } from '../../types/database.types';
import { fetchApplicants } from '../../lib/api';
import InterviewConfirmationModal from '../InterviewConfirmationModal';
import ApplicantsTableModal from '../ApplicantsTableModal';
import ApplicantCard from './ApplicantCard';

interface ApplicantsListViewProps {
  jobId: string | null;
  onSendInterview: (applicant: Applicant) => Promise<void>;
}

const ApplicantsListView: React.FC<ApplicantsListViewProps> = ({ 
  jobId, 
  onSendInterview 
}) => {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (jobId) {
      loadApplicants();
    } else {
      setApplicants([]);
    }
  }, [jobId]);

  const loadApplicants = async () => {
    if (!jobId) return;
    
    setLoading(true);
    try {
      const data = await fetchApplicants(jobId);
      setApplicants(data);
    } catch (error) {
      console.error('Error loading applicants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInterviewClick = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setIsModalOpen(true);
  };

  const handleConfirmInterview = async () => {
    if (selectedApplicant) {
      await onSendInterview(selectedApplicant);
      setIsModalOpen(false);
      loadApplicants(); // Reload applicants after sending interview
    }
  };

  const handleCancelModal = () => {
    setIsModalOpen(false);
    setSelectedApplicant(null);
  };

  const handleOpenTableModal = () => {
    setIsTableModalOpen(true);
  };

  const handleCloseTableModal = () => {
    setIsTableModalOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-500';
      case 'reviewed':
        return 'bg-yellow-500';
      case 'interviewed':
        return 'bg-purple-500';
      case 'shortlisted':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Sample applicants for demonstration - would be removed in production
  const sampleApplicants: Applicant[] = [
    {
      id: '1',
      job_id: jobId || '',
      name: 'Alex Johnson',
      email: 'alex.johnson@example.com',
      status: 'new',
      resume_url: 'https://example.com/resume1.pdf',
      interview_sent: false,
      interview_completed: false,
      applied_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      ai_rating: 8,
      ai_summary: 'Strong candidate with relevant experience in frontend development. Good communication skills demonstrated in the application. Worth proceeding to interview stage.',
      consent_to_ai_interview: true
    },
    {
      id: '2',
      job_id: jobId || '',
      name: 'Sam Williams',
      email: 'sam.williams@example.com',
      status: 'reviewed',
      resume_url: 'https://example.com/resume2.pdf',
      interview_sent: false,
      interview_completed: false,
      applied_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      ai_rating: 6,
      ai_summary: 'Candidate has adequate technical skills but lacks specific experience in required technologies. May need additional training if hired.',
      consent_to_ai_interview: false
    },
    {
      id: '3',
      job_id: jobId || '',
      name: 'Taylor Rodriguez',
      email: 'taylor.rodriguez@example.com',
      status: 'interviewed',
      resume_url: 'https://example.com/resume3.pdf',
      interview_sent: true,
      interview_completed: true,
      applied_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      ai_rating: 9,
      ai_summary: 'Exceptional candidate with strong technical background and leadership experience. Performed very well in the AI interview with thoughtful responses to complex questions.',
      consent_to_ai_interview: true
    },
    {
      id: '4',
      job_id: jobId || '',
      name: 'Jordan Smith',
      email: 'jordan.smith@example.com',
      status: 'new',
      resume_url: 'https://example.com/resume4.pdf',
      interview_sent: false,
      interview_completed: false,
      applied_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      ai_rating: 7,
      ai_summary: 'Solid candidate with good technical foundation. Previous projects align well with job requirements. Recommended for interview.',
      consent_to_ai_interview: true
    },
    {
      id: '5',
      job_id: jobId || '',
      name: 'Morgan Lee',
      email: 'morgan.lee@example.com',
      status: 'rejected',
      resume_url: 'https://example.com/resume5.pdf',
      interview_sent: false,
      interview_completed: false,
      applied_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      ai_rating: 4,
      ai_summary: 'Limited relevant experience for this role. Skills do not match the core requirements of the position.',
      consent_to_ai_interview: true
    }
  ];

  // Use sample data for demonstration purposes
  const displayApplicants = applicants.length > 0 ? applicants : (jobId ? sampleApplicants : []);

  return (
    <div className="mt-4">
      <InterviewConfirmationModal
        isOpen={isModalOpen}
        applicant={selectedApplicant}
        onConfirm={handleConfirmInterview}
        onCancel={handleCancelModal}
      />
      
      <ApplicantsTableModal
        isOpen={isTableModalOpen}
        applicants={displayApplicants}
        onClose={handleCloseTableModal}
      />
      
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium">Applicants ({displayApplicants.length})</h3>
        {displayApplicants.length > 0 && (
          <button 
            onClick={handleOpenTableModal}
            className="text-xs text-bolt-blue hover:text-bolt-blue/80 flex items-center"
          >
            <Users className="h-3 w-3 mr-1" />
            <span>View All</span>
          </button>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 border-2 border-bolt-blue border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : displayApplicants.length > 0 ? (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {displayApplicants.slice(0, 3).map(applicant => (
            <ApplicantCard
              key={applicant.id}
              applicant={applicant}
              getStatusColor={getStatusColor}
              onSendInterview={handleSendInterviewClick}
              formatDate={formatDate}
            />
          ))}
          
          {displayApplicants.length > 3 && (
            <button
              onClick={handleOpenTableModal}
              className="w-full py-2 text-sm text-center text-bolt-blue hover:text-bolt-blue/80 bg-bolt-gray rounded-md"
            >
              View {displayApplicants.length - 3} more applicants
            </button>
          )}
        </div>
      ) : (
        <div className="text-center p-4 text-xs text-gray-400">
          {jobId 
            ? "No applicants found for this job posting." 
            : "Select a job to view its applicants."}
        </div>
      )}
    </div>
  );
};

export default React.memo(ApplicantsListView);