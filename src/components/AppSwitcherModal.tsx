import React from 'react';
import { App } from './JobListSidebar';

interface AppSwitcherModalProps {
  isOpen: boolean;
  currentApp: App;
  apps: App[];
  onClose: () => void;
  onSwitchApp: (app: App) => void;
}

const AppSwitcherModal: React.FC<AppSwitcherModalProps> = ({
  isOpen,
  currentApp,
  apps,
  onClose,
  onSwitchApp
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-secondary rounded-lg shadow-xl w-80 overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-medium">Switch Application</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {apps.map(app => (
              <button
                key={app.id}
                className={`flex flex-col items-center justify-center p-4 rounded-lg transition-colors ${
                  currentApp.id === app.id 
                    ? 'bg-bolt-blue bg-opacity-20 text-bolt-blue' 
                    : 'hover:bg-bolt-gray'
                }`}
                onClick={() => onSwitchApp(app)}
              >
                <div className={`mb-2 ${currentApp.id === app.id ? 'text-bolt-blue' : 'text-gray-400'}`}>
                  {app.icon}
                </div>
                <span className="text-sm">{app.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="p-3 border-t border-border flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm bg-bolt-gray rounded-md hover:bg-opacity-80"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(AppSwitcherModal);