import React from 'react';
import { RotateCw, Layout, Square, Image as ImageIcon } from 'lucide-react';
import { OutputSettings } from '../../types';

interface OutputSettingsPanelProps {
  settings: OutputSettings;
  onSettingsChange: (newSettings: OutputSettings) => void;
  showOrientation: boolean;
  showBorder: boolean;
  showQuality?: boolean;
}

export const OutputSettingsPanel: React.FC<OutputSettingsPanelProps> = ({
  settings,
  onSettingsChange,
  showOrientation,
  showBorder,
  showQuality = false,
}) => {
  const handleRotationChange = () => {
    const nextRotation = (settings.rotation + 90) % 360 as 0 | 90 | 180 | 270;
    onSettingsChange({ ...settings, rotation: nextRotation });
  };

  const toggleOrientation = () => {
    onSettingsChange({
      ...settings,
      orientation: settings.orientation === 'portrait' ? 'landscape' : 'portrait',
    });
  };

  const toggleBorder = () => {
    onSettingsChange({ ...settings, addBorder: !settings.addBorder });
  };

  const setQuality = (quality: 'low' | 'medium' | 'high') => {
    onSettingsChange({ ...settings, imageQuality: quality });
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6 animate-in fade-in slide-in-from-bottom-2 transition-colors duration-300">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
        Output Settings
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Rotation Control */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <RotateCw className="w-4 h-4 text-brand-500" />
            Rotation
          </label>
          <button
            onClick={handleRotationChange}
            className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors text-sm text-slate-900 dark:text-white"
          >
            <span>{settings.rotation}° Clockwise</span>
            <RotateCw className={`w-4 h-4 transition-transform duration-300 transform rotate-${settings.rotation}`} />
          </button>
        </div>

        {/* Orientation Control */}
        {showOrientation && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Layout className="w-4 h-4 text-brand-500" />
              Orientation
            </label>
            <button
              onClick={toggleOrientation}
              className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors text-sm text-slate-900 dark:text-white"
            >
              <span className="capitalize">{settings.orientation}</span>
              <div className={`w-4 h-5 border-2 border-slate-400 dark:border-slate-500 rounded-sm transition-transform duration-300 ${settings.orientation === 'landscape' ? 'rotate-90' : ''}`} />
            </button>
          </div>
        )}

        {/* Border Control */}
        {showBorder && (
          <div className="flex flex-col gap-2">
             <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Square className="w-4 h-4 text-brand-500" />
              Page Border
            </label>
            <button
              onClick={toggleBorder}
              className={`flex items-center justify-between px-4 py-2 border rounded-lg transition-colors text-sm ${settings.addBorder ? 'bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-900/30 dark:border-brand-700 dark:text-brand-300' : 'bg-slate-50 border-slate-200 text-slate-900 hover:bg-slate-100 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600'}`}
            >
              <span>{settings.addBorder ? 'Border Added' : 'No Border'}</span>
              <div className={`w-4 h-4 border border-current rounded-sm ${settings.addBorder ? 'bg-brand-200 dark:bg-brand-700' : 'bg-transparent'}`} />
            </button>
          </div>
        )}

        {/* Quality Control */}
        {showQuality && (
          <div className="flex flex-col gap-2">
             <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-brand-500" />
              Image Quality
            </label>
            <div className="flex rounded-lg shadow-sm">
                {(['low', 'medium', 'high'] as const).map((q, idx, arr) => (
                    <button
                        key={q}
                        onClick={() => setQuality(q)}
                        className={`
                            flex-1 px-3 py-2 text-sm font-medium capitalize border-y border-slate-200 dark:border-slate-600 transition-colors
                            ${idx === 0 ? 'rounded-l-lg border-l' : ''}
                            ${idx === arr.length - 1 ? 'rounded-r-lg border-r' : 'border-r'}
                            ${settings.imageQuality === q 
                                ? 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-900/40 dark:text-brand-300 dark:border-brand-700 z-10' 
                                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                            }
                        `}
                    >
                        {q}
                    </button>
                ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-right min-h-[1rem]">
                {settings.imageQuality === 'low' && 'Smallest file size'}
                {settings.imageQuality === 'medium' && 'Balanced size & quality'}
                {settings.imageQuality === 'high' && 'Best visual fidelity'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};