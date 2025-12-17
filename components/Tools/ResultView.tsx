import React, { useState } from 'react';
import { Download, RefreshCcw, ArrowRight, Copy, Check, Loader2, RotateCw, Settings, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { ProcessedFile } from '../../types';
import { saveToDrive, isDriveConfigured, setGoogleCredentials, getGoogleCredentials } from '../../services/googleDriveService';

interface ResultViewProps {
  result: ProcessedFile;
  onReset: () => void;
  toolName: string;
  onRotate?: (degrees: 90 | 180 | 270) => Promise<boolean | void>;
}

export const ResultView: React.FC<ResultViewProps> = ({ result, onReset, toolName, onRotate }) => {
  const [isSavingToDrive, setIsSavingToDrive] = useState(false);
  const [driveSaved, setDriveSaved] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [tempKeys, setTempKeys] = useState({ apiKey: '', clientId: '' });

  const executeSave = async () => {
    setIsSavingToDrive(true);
    try {
        const response = await fetch(result.url);
        const blob = await response.blob();
        await saveToDrive(blob, result.name);
        setDriveSaved(true);
    } catch (error: any) {
        if (error.message === "MISSING_KEYS") {
             const { apiKey, clientId } = getGoogleCredentials();
             setTempKeys({ apiKey: apiKey || '', clientId: clientId || '' });
             setShowConfigModal(true);
        } else if (error.error === 'popup_closed_by_user') {
            // User cancelled
        } else {
            console.error("Failed to save to Drive", error);
            alert("Failed to save to Google Drive. Please try again.");
        }
    } finally {
        setIsSavingToDrive(false);
    }
  };

  const handleSaveToDrive = async () => {
    if (!isDriveConfigured()) {
        const { apiKey, clientId } = getGoogleCredentials();
        setTempKeys({ apiKey: apiKey || '', clientId: clientId || '' });
        setShowConfigModal(true);
        return;
    }
    await executeSave();
  };

  const saveConfiguration = async () => {
      if (!tempKeys.apiKey || !tempKeys.clientId) {
          alert("Both fields are required.");
          return;
      }
      setGoogleCredentials(tempKeys.apiKey, tempKeys.clientId);
      setShowConfigModal(false);
      await executeSave();
  };

  const handleRotate = async () => {
      if (!onRotate) return;
      setIsRotating(true);
      await onRotate(90); // Rotate 90 degrees clockwise
      setIsRotating(false);
  };

  const isPdf = result.type === 'application/pdf';

  return (
    <>
    <div className="w-full max-w-2xl mx-auto text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
        Success! Your file is ready.
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8">
        We have successfully processed <span className="font-semibold text-slate-900 dark:text-white">{result.originalName}</span>
      </p>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
          <div className="flex items-center gap-4 text-left w-full">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl">
                  <Download className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-grow">
                  <p className="font-medium text-slate-900 dark:text-white truncate max-w-[200px]">{result.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{(result.size / 1024).toFixed(1)} KB • {result.type}</p>
              </div>
          </div>
          
          {isPdf && onRotate && (
             <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleRotate}
                disabled={isRotating}
                className="flex-shrink-0 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
             >
                {isRotating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCw className="w-4 h-4 mr-2" />}
                Rotate 90°
             </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a href={result.url} download={result.name} className="w-full">
              <Button size="lg" fullWidth className="shadow-lg shadow-brand-500/20">
                Download File
              </Button>
          </a>
          
          <Button 
            variant="outline" 
            size="lg" 
            fullWidth
            onClick={handleSaveToDrive}
            disabled={isSavingToDrive || driveSaved}
            className={driveSaved ? "border-green-200 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" : "dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"}
          >
            {isSavingToDrive ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : driveSaved ? (
              <Check className="w-5 h-5 mr-2" />
            ) : (
              <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" alt="Drive" className="w-5 h-5 mr-2" />
            )}
            {driveSaved ? "Saved to Drive" : isSavingToDrive ? "Saving..." : "Save to Drive"}
          </Button>
        </div>
      </div>

      {result.textContent && (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 text-left mb-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">Extracted Text (OCR)</h3>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigator.clipboard.writeText(result.textContent || "")}
                    className="gap-2 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                    <Copy className="w-4 h-4" /> Copy
                </Button>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700 max-h-60 overflow-y-auto font-mono text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {result.textContent}
            </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button variant="outline" onClick={onReset} className="gap-2 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
            <RefreshCcw className="w-4 h-4" />
            Process Another File
        </Button>
        <Button variant="ghost" className="gap-2 text-brand-600 hover:text-brand-700 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-900/30">
            Continue to Compress <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <p className="mt-8 text-xs text-slate-400 dark:text-slate-500">
        File will be automatically deleted from our servers in 1 hour.
      </p>
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