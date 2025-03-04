import React, { useState } from 'react';
import { X, Search, ArrowUp, ArrowDown, Star, FileText, Send, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { Applicant } from '../types/database.types';

interface ApplicantsTableModalProps {
  isOpen: boolean;
  applicants: Applicant[];
  onClose: () => void;
}

const ApplicantsTableModal: React.FC<ApplicantsTableModalProps> = ({
  isOpen,
  applicants,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof Applicant>('applied_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  
  if (!isOpen) return null;
  
  const handleSort = (field: keyof Applicant) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const filteredApplicants = applicants.filter(applicant => {
    const query = searchQuery.toLowerCase();
    return (
      applicant.name.toLowerCase().includes(query) ||
      applicant.email.toLowerCase().includes(query) ||
      applicant.status.toLowerCase().includes(query)
    );
  });
  
  const sortedApplicants = [...filteredApplicants].sort((a, b) => {
    const fieldA = a[sortField];
    const fieldB = b[sortField];
    
    if (typeof fieldA === 'string' && typeof fieldB === 'string') {
      const comparison = fieldA.localeCompare(fieldB);
      return sortDirection === 'asc' ? comparison : -comparison;
    }
    
    if (typeof fieldA === 'number' && typeof fieldB === 'number') {
      return sortDirection === 'asc' ? fieldA - fieldB : fieldB - fieldA;
    }
    
    // Default to string comparison for other types
    return sortDirection === 'asc' 
      ? String(fieldA).localeCompare(String(fieldB))
      : String(fieldB).localeCompare(String(fieldA));
  });
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
  
  const handleSendAIInterview = (applicant: Applicant) => {
    window.open('https://elevenlabs.io/app/talk-to?agent_id=evuZFrh2uys1DzeMUnhA', '_blank');
  };
  
  const SortIcon = ({ field }: { field: keyof Applicant }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  const handleRowClick = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
  };

  const canSendInterview = (applicant: Applicant) => {
    return applicant.consent_to_ai_interview && 
           !applicant.interview_sent && 
           applicant.status !== 'rejected' && 
           applicant.status !== 'interviewed';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div className="bg-secondary rounded-lg border-2 border-bolt-blue shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search applicants by name, email, or status..."
              className="pl-10 pr-4 py-2 w-full max-w-2xl bg-bolt-dark border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-bolt-blue text-bolt-light"
            />
          </div>
          <button 
            onClick={onClose}
            className="p-2 ml-4 rounded-full hover:bg-bolt-gray text-gray-400 hover:text-bolt-light"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-7 md:grid-cols-9 gap-0">
            <div className="col-span-7 overflow-auto">
              <table className="w-full table-fixed">
                <thead className="bg-bolt-dark sticky top-0 z-10">
                  <tr className="text-xs text-gray-400">
                    <th 
                      className="p-3 text-left font-medium w-10 cursor-pointer"
                      onClick={() => handleSort('id')}
                    >
                      <div className="flex items-center">
                        <span>#</span>
                        <SortIcon field="id" />
                      </div>
                    </th>
                    <th 
                      className="p-3 text-left font-medium cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        <span>Name</span>
                        <SortIcon field="name" />
                      </div>
                    </th>
                    <th 
                      className="p-3 text-left font-medium cursor-pointer"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center">
                        <span>Email</span>
                        <SortIcon field="email" />
                      </div>
                    </th>
                    <th 
                      className="p-3 text-left font-medium w-24 cursor-pointer"
                      onClick={() => handleSort('ai_rating')}
                    >
                      <div className="flex items-center">
                        <span>AI Rating</span>
                        <SortIcon field="ai_rating" />
                      </div>
                    </th>
                    <th 
                      className="p-3 text-left font-medium w-32 cursor-pointer"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center">
                        <span>Status</span>
                        <SortIcon field="status" />
                      </div>
                    </th>
                    <th 
                      className="p-3 text-left font-medium w-24 cursor-pointer"
                      onClick={() => handleSort('consent_to_ai_interview')}
                    >
                      <div className="flex items-center">
                        <span>AI Consent</span>
                        <SortIcon field="consent_to_ai_interview" />
                      </div>
                    </th>
                    <th 
                      className="p-3 text-left font-medium cursor-pointer"
                      onClick={() => handleSort('applied_at')}
                    >
                      <div className="flex items-center">
                        <span>Applied</span>
                        <SortIcon field="applied_at" />
                      </div>
                    </th>
                    <th className="p-3 text-left font-medium w-36">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {sortedApplicants.map((applicant, index) => (
                    <tr 
                      key={applicant.id} 
                      className={`border-t border-border hover:bg-bolt-gray/50 cursor-pointer ${
                        selectedApplicant?.id === applicant.id ? 'bg-bolt-gray' : ''
                      }`}
                      onClick={() => handleRowClick(applicant)}
                    >
                      <td className="p-3 text-gray-400">
                        {index + 1}
                      </td>
                      <td className="p-3">
                        {applicant.name}
                      </td>
                      <td className="p-3 text-gray-400 truncate">
                        {applicant.email}
                      </td>
                      <td className="p-3">
                        {applicant.ai_rating ? (
                          <div className="flex items-center">
                            <span className="mr-1">{applicant.ai_rating}</span>
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center">
                          <div className={`h-2 w-2 rounded-full ${getStatusColor(applicant.status)} mr-2`}></div>
                          <span className="capitalize">{applicant.status}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        {applicant.consent_to_ai_interview ? (
                          <div className="flex items-center text-green-500">
                            <Check size={14} className="mr-1" />
                            <span>Yes</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-red-500">
                            <X size={14} className="mr-1" />
                            <span>No</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-gray-400">
                        {formatDate(applicant.applied_at)}
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          {applicant.resume_url && (
                            <a 
                              href={applicant.resume_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-1.5 bg-bolt-dark rounded hover:bg-opacity-80 text-blue-400"
                              title="View Resume"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FileText size={14} />
                            </a>
                          )}
                          
                          {canSendInterview(applicant) && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSendAIInterview(applicant);
                              }}
                              className="p-1.5 bg-bolt-blue rounded hover:bg-opacity-80 text-white flex items-center"
                              title="Send AI Interview"
                            >
                              <Send size={14} className="mr-1" />
                              <span>AI Interview</span>
                              <ExternalLink size={12} className="ml-1" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredApplicants.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-4 text-center text-gray-400">
                        No applicants match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="col-span-7 md:col-span-2 bg-bolt-dark p-4 border-t md:border-t-0 md:border-l border-border">
              <h3 className="text-sm font-medium mb-3">AI Summary</h3>
              {selectedApplicant ? (
                <div>
                  <div className="text-xs mb-3">
                    <div className="flex items-center mb-2">
                      <div className={`h-2 w-2 rounded-full ${getStatusColor(selectedApplicant.status)} mr-2`}></div>
                      <span className="font-medium">{selectedApplicant.name}</span>
                    </div>
                    <div className="flex items-center mb-2 text-gray-400">
                      <Star className={`h-3 w-3 mr-1 ${selectedApplicant.ai_rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-500'}`} />
                      <span>AI Rating: {selectedApplicant.ai_rating || 'N/A'}/10</span>
                    </div>
                  </div>
                  <div className="bg-bolt-gray rounded-md p-3 text-xs">
                    {selectedApplicant.ai_summary ? (
                      <p className="text-gray-300 leading-relaxed">{selectedApplicant.ai_summary}</p>
                    ) : (
                      <div className="flex items-center text-gray-400">
                        <AlertCircle size={14} className="mr-2" />
                        <span>No AI summary available for this applicant.</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-xs text-gray-400 p-4">
                  <p>Select an applicant to view their AI summary.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ApplicantsTableModal);