import React, { useCallback, useState } from 'react';
import { Search, FileText, User, Menu } from 'lucide-react';
import { App } from './JobListSidebar';
import { debouncedSearchJobs } from '../lib/api';
import { Job } from '../types/database.types';

interface DashboardHeaderProps {
  currentApp: App;
  onToggleSidebar: () => void;
  onSearch?: (jobs: Job[]) => void;
  userEmail?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  currentApp,
  onToggleSidebar,
  onSearch,
  userEmail = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Handle search input changes with debounce
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsSearching(!!query);
    
    if (onSearch) {
      debouncedSearchJobs(
        query, 
        (jobs) => {
          onSearch(jobs);
          setIsSearching(false);
        },
        (error) => {
          console.error('Search error:', error);
          setIsSearching(false);
        }
      );
    }
  }, [onSearch]);

  // Truncate email if it's too long
  const displayEmail = userEmail && userEmail.length > 20 
    ? userEmail.substring(0, 17) + '...'
    : userEmail;

  return (
    <header className="bg-secondary border-b border-border p-3 flex justify-between items-center">
      <div className="flex items-center flex-1 gap-3">
        <button 
          onClick={onToggleSidebar}
          className="p-1.5 rounded-md hover:bg-bolt-gray flex-shrink-0"
        >
          <Menu className="h-4 w-4 text-gray-400" />
        </button>
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-3.5 w-3.5 text-gray-400" />
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search jobs, candidates, or simply ask me anything!" 
            className="py-1.5 pl-8 pr-3 text-xs bg-bolt-dark border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-bolt-blue w-full"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="h-3 w-3 rounded-full border-2 border-gray-400 border-t-transparent animate-spin"></div>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-3 ml-3 flex-shrink-0">
        <button className="p-1.5 rounded-md hover:bg-bolt-gray">
          <FileText className="h-4 w-4 text-gray-400" />
        </button>
        <div className="flex items-center space-x-2">
          <div className="h-6 w-6 rounded-full bg-bolt-blue flex items-center justify-center text-white">
            <User className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm" title={userEmail}>{displayEmail || 'User'}</span>
        </div>
      </div>
    </header>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(DashboardHeader);