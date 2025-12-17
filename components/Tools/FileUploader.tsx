import React, { useRef, useState } from 'react';
import { UploadCloud, Loader2, Settings, X, KeyRound } from 'lucide-react';
import { Button } from '../ui/Button';
import { openDrivePicker, isDriveConfigured, setGoogleCredentials, getGoogleCredentials } from '../../services/googleDriveService';

interface FileUploaderProps {
  accept: string;
  onFileSelect: (file: File) => void;
  isDragging?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ accept, onFileSelect }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [tempKeys, setTempKeys] = useState({ apiKey: '', clientId: '' });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleDriveClick = async () => {
    if (!isDriveConfigured()) {
        // Prepare modal with empty or existing local values
        const { apiKey, clientId } = getGoogleCredentials();
        setTempKeys({ apiKey: apiKey || '', clientId: clientId || '' });
        setShowConfigModal(true);
        return;
    }

    try {
      setIsLoadingDrive(true);
      const file = await openDrivePicker();
      if (file) {
        onFileSelect(file);
      }
    } catch (error: any) {
      if (error.message === "MISSING_KEYS") {
         const { apiKey, clientId } = getGoogleCredentials();
         setTempKeys({ apiKey: apiKey || '', clientId: clientId || '' });
         setShowConfigModal(true);
      } else if (error.message === "INIT_FAILED") {
          alert("Could not initialize Google Services. Please ensure you are online and not blocking Google scripts.");
      } else if (error.error === 'popup_closed_by_user') {
          console.log("User cancelled Google Sign-in");
      } else if (error.error === 'access_denied') {
          alert("Access denied. You must grant permission to use Google Drive files.");
      } else {
          console.error("Drive Error:", error);
          alert("Failed to connect to Google Drive. Please try again.");
      }
    } finally {
      setIsLoadingDrive(false);
    }
  };

  const saveConfiguration = () => {
      if (!tempKeys.apiKey || !tempKeys.clientId) {
          alert("Both fields are required.");
          return;
      }
      setGoogleCredentials(tempKeys.apiKey, tempKeys.clientId);
      setShowConfigModal(false);
      // Auto-retry
      handleDriveClick();
  };

  return (
    <>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative w-full max-w-2xl mx-auto h-80 rounded-3xl border-4 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-8
          ${isDragOver 
            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 scale-102' 
            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-brand-300 dark:hover:border-brand-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }
        `}
      >
        <div className={`p-6 rounded-full bg-brand-100 dark:bg-slate-700 mb-6 ${isDragOver ? 'animate-bounce' : ''}`}>
          <UploadCloud className="w-12 h-12 text-brand-600 dark:text-brand-400" />
        </div>
        
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center">
          Drop your files here
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-8 text-center max-w-sm">
          or select a file from your device. Supported formats: <span className="font-mono text-slate-700 dark:text-slate-300">{accept}</span>
        </p>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          onChange={handleChange}
        />
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Button onClick={() => fileInputRef.current?.click()} size="lg" className="shadow-lg shadow-brand-500/30">
            Select File
          </Button>
          <div className="relative group">
              <Button 
              variant="outline" 
              size="lg" 
              className="gap-2 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              onClick={handleDriveClick}
              disabled={isLoadingDrive}
              >
              {isLoadingDrive ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" alt="Drive" className="w-5 h-5" />
              )}
              Google Drive
              </Button>
          </div>
        </div>
      </div>

      {/* Developer Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded-lg">
                        <Settings className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Developer Configuration</h3>
                </div>
                <button onClick={() => setShowConfigModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <X className="w-5 h-5" />
                </button>
            </div>
            
            <div className="p-6 space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    The application environment is missing Google API keys. Please enter your project's credentials below to enable Google Drive integration.
                </p>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Google API Key</label>
                    <input 
                        type="text" 
                        value={tempKeys.apiKey}
                        onChange={(e) => setTempKeys({...tempKeys, apiKey: e.target.value})}
                        placeholder="AIza..."
                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-brand-500 focus:border-brand-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Google Client ID</label>
                    <input 
                        type="text" 
                        value={tempKeys.clientId}
                        onChange={(e) => setTempKeys({...tempKeys, clientId: e.target.value})}
                        placeholder="1234...apps.googleusercontent.com"
                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-brand-500 focus:border-brand-500"
                    />
                </div>
            </div>

            <div className="p-6 pt-0 flex gap-3">
                <Button variant="outline" fullWidth onClick={() => setShowConfigModal(false)}>Cancel</Button>
                <Button variant="primary" fullWidth onClick={saveConfiguration}>Save Configuration</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};