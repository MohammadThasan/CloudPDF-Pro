import React from 'react';
import { Link } from 'react-router-dom';
import { TOOLS } from '../../constants';
import { ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

export const ToolGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {TOOLS.map((tool) => (
        <Link 
          key={tool.id} 
          to={tool.path}
          className="group relative flex flex-col p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-700"
        >
          <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 group-hover:bg-brand-600 group-hover:text-white dark:group-hover:bg-brand-500">
            <tool.icon className="w-6 h-6" />
          </div>
          
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{tool.name}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4 flex-grow">{tool.description}</p>
          
          <div className="flex items-center text-brand-600 dark:text-brand-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
            Use it now <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </Link>
      ))}
    </div>
  );
};