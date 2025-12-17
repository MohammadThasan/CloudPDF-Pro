import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TOOLS } from '../constants';
import { FileUploader } from '../components/Tools/FileUploader';
import { ProcessingStatus } from '../components/Tools/ProcessingStatus';
import { ResultView } from '../components/Tools/ResultView';
import { OutputSettingsPanel } from '../components/Tools/OutputSettingsPanel';
import { ToolDef, ProcessStatus, ProcessedFile, OutputSettings } from '../types';
import { processFile, rotatePdfBlob } from '../services/mockCloudService';
import { AlertCircle, FileText, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const ToolPage: React.FC = () => {
  const { toolId } = useParams<{ toolId: string }>();
  const navigate = useNavigate();
  const [tool, setTool] = useState<ToolDef | undefined>(undefined);
  
  const [status, setStatus] = useState<ProcessStatus>(ProcessStatus.IDLE);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ProcessedFile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // New Settings State
  const [settings, setSettings] = useState<OutputSettings>({
    orientation: 'portrait',
    rotation: 0,
    addBorder: false,
    imageQuality: 'high',
  });

  useEffect(() => {
    const foundTool = TOOLS.find(t => t.path === `/${toolId}`);
    if (foundTool) {
      setTool(foundTool);
    } else {
        navigate('/');
    }
  }, [toolId, navigate]);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setStatus(ProcessStatus.READY);
    setErrorMessage(null);
    // Reset settings to default on new file
    setSettings({ orientation: 'portrait', rotation: 0, addBorder: false, imageQuality: 'high' });
  };

  const startProcessing = async () => {
    if (!tool || !file) return;
    
    setStatus(ProcessStatus.UPLOADING);
    setErrorMessage(null);

    try {
      // Simulate Upload
      await new Promise(r => setTimeout(r, 800));
      setStatus(ProcessStatus.PROCESSING);
      
      const { blob, text } = await processFile(file, tool, settings);
      
      // Determine correct extension for output based on Actual Blob Type first, then Tool definition
      const lastDotIndex = file.name.lastIndexOf('.');
      const baseName = lastDotIndex !== -1 ? file.name.substring(0, lastDotIndex) : file.name;
      let extension = '';

      // Check Blob Type first for accuracy (e.g., zip vs jpg)
      if (blob.type === 'application/zip') {
          extension = '.zip';
      } else if (blob.type === 'image/jpeg') {
          extension = '.jpg';
      } else if (blob.type === 'application/pdf') {
          extension = '.pdf';
      } else {
          // Fallback to Tool Definition
          switch (tool.outputType) {
              case 'application/pdf': extension = '.pdf'; break;
              case 'image/jpeg': extension = '.jpg'; break;
              case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': extension = '.xlsx'; break;
              case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': extension = '.docx'; break;
              case 'text/plain': extension = '.txt'; break;
              case 'application/zip': extension = '.zip'; break;
              default: extension = '.bin';
          }
      }

      const resultName = `processed_${baseName}${extension}`;
      
      const resultUrl = URL.createObjectURL(blob);
      const resultFile: ProcessedFile = {
        name: resultName,
        originalName: file.name,
        size: blob.size,
        type: blob.type || tool.outputType,
        url: resultUrl,
        textContent: text
      };
      
      setResult(resultFile);
      setStatus(ProcessStatus.COMPLETED);

    } catch (error: any) {
      console.error("Processing failed:", error);
      setErrorMessage(error.message || "An unexpected error occurred. Please try again.");
      setStatus(ProcessStatus.ERROR);
    }
  };

  const handleRotateResult = async (degrees: 90 | 180 | 270) => {
    if (!result || result.type !== 'application/pdf') return;
    
    try {
        const response = await fetch(result.url);
        const blob = await response.blob();
        const newBlob = await rotatePdfBlob(blob, degrees);
        const newUrl = URL.createObjectURL(newBlob);
        
        setResult(prev => prev ? ({
            ...prev,
            url: newUrl,
            size: newBlob.size
        }) : null);
        
        return true;
    } catch (e) {
        console.error("Rotation failed", e);
        return false;
    }
  };

  const handleReset = () => {
    setStatus(ProcessStatus.IDLE);
    setFile(null);
    setResult(null);
    setErrorMessage(null);
  };

  if (!tool) return null;

  // Logic to determine which settings to show based on tool
  const showOrientation = ['image-to-pdf', 'word-to-pdf', 'merge-pdf'].includes(tool.id);
  const showBorder = ['image-to-pdf', 'merge-pdf'].includes(tool.id);
  // Rotation is available for all tools that output PDF
  const isPdfOutput = tool.outputType === 'application/pdf';
  const isImageOutput = tool.outputType === 'image/jpeg';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-10 pb-20 transition-colors duration-300">
      <div className="container mx-auto px-4">
        {/* Tool Header */}
        <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm mb-4">
                <tool.icon className="w-8 h-8 text-brand-600 dark:text-brand-400" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{tool.name}</h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">{tool.description}</p>
        </div>

        {/* Workspace */}
        <div className="max-w-4xl mx-auto">
            {status === ProcessStatus.IDLE && (
                <FileUploader accept={tool.accepts} onFileSelect={handleFileSelect} />
            )}

            {status === ProcessStatus.READY && file && (
                <div className="animate-in fade-in zoom-in duration-300">
                    {/* File Preview Card */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-brand-50 dark:bg-slate-700 p-3 rounded-lg">
                                <FileText className="w-8 h-8 text-brand-600 dark:text-brand-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">{file.name}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleReset} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                            Remove
                        </Button>
                    </div>

                    {/* Output Settings */}
                    {(isPdfOutput || isImageOutput) && (
                        <OutputSettingsPanel 
                            settings={settings} 
                            onSettingsChange={setSettings}
                            showOrientation={showOrientation}
                            showBorder={showBorder}
                            showQuality={isImageOutput}
                        />
                    )}

                    <div className="text-center">
                        <Button onClick={startProcessing} size="lg" className="w-full md:w-1/3 shadow-xl shadow-brand-500/20 text-lg h-14">
                            Convert Now <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                </div>
            )}

            {(status === ProcessStatus.UPLOADING || status === ProcessStatus.PROCESSING) && file && (
                <ProcessingStatus fileName={file.name} status={status} />
            )}

            {status === ProcessStatus.COMPLETED && result && (
                <ResultView 
                    result={result} 
                    onReset={handleReset} 
                    toolName={tool.name} 
                    onRotate={isPdfOutput ? handleRotateResult : undefined}
                />
            )}

            {status === ProcessStatus.ERROR && (
                <div className="text-center bg-red-50 dark:bg-red-900/20 p-8 rounded-2xl border border-red-100 dark:border-red-900/50 max-w-md mx-auto animate-in fade-in zoom-in duration-300">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-red-900 dark:text-red-200 mb-2">Conversion Failed</h3>
                    <p className="text-red-700 dark:text-red-300 mb-6">
                        {errorMessage ? errorMessage : (
                            <>
                                We encountered an issue processing <strong>{file?.name}</strong>. 
                                This may be due to a corrupt file or an unsupported format variant.
                            </>
                        )}
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Button variant="outline" onClick={handleReset} className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30">
                            Try Another File
                        </Button>
                    </div>
                </div>
            )}
        </div>

        {/* Promo/Tip Section (Only visible when IDLE) */}
        {status === ProcessStatus.IDLE && (
            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Cloud Powered</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">All processing happens on secure cloud servers for maximum speed and quality.</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Cross Platform</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Works on Mac, Windows, and Linux right from your browser.</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Secure Deletion</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Files are permanently deleted after 1 hour. No data logging.</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};