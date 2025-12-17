import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, FileText } from 'lucide-react';

interface ProcessingStatusProps {
  fileName: string;
  status: 'UPLOADING' | 'PROCESSING' | 'COMPLETED';
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ fileName, status }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (status === 'UPLOADING') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 200);
      return () => clearInterval(interval);
    } else if (status === 'PROCESSING') {
        setProgress(95);
    } else if (status === 'COMPLETED') {
      setProgress(100);
    }
  }, [status]);

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 text-center transition-colors duration-300">
      <div className="relative mb-6">
        <div className="w-20 h-20 mx-auto bg-brand-50 dark:bg-slate-700 rounded-full flex items-center justify-center">
            {status === 'COMPLETED' ? (
                <CheckCircle2 className="w-10 h-10 text-green-500 animate-in zoom-in duration-300" />
            ) : (
                <Loader2 className="w-10 h-10 text-brand-600 dark:text-brand-400 animate-spin" />
            )}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
        {status === 'UPLOADING' && 'Uploading file...'}
        {status === 'PROCESSING' && 'Processing...'}
        {status === 'COMPLETED' && 'Ready to Download!'}
      </h3>
      <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
        <FileText className="w-4 h-4" />
        <span className="truncate max-w-[200px]">{fileName}</span>
      </div>

      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-brand-600 dark:bg-brand-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-mono">{progress}%</p>
    </div>
  );
};