import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 py-12 mt-auto border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-slate-900 dark:text-white font-semibold mb-4">Core Tools</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/merge" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Merge PDF</Link></li>
              <li><Link to="/split" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Split PDF</Link></li>
              <li><Link to="/compress" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Compress PDF</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-slate-900 dark:text-white font-semibold mb-4">Convert</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/image-to-pdf" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Image to PDF</Link></li>
              <li><Link to="/word-to-pdf" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Word to PDF</Link></li>
              <li><Link to="/pdf-to-excel" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">PDF to Excel</Link></li>
              <li><Link to="/ocr" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">OCR PDF</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-slate-900 dark:text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">About Us</Link></li>
              <li><Link to="/pricing" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Pricing</Link></li>
              <li><Link to="/security" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Security</Link></li>
            </ul>
          </div>
          <div>
             <h3 className="text-slate-900 dark:text-white font-semibold mb-4">Legal</h3>
             <ul className="space-y-2 text-sm">
               <li><a href="#" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Terms of Service</a></li>
               <li><a href="#" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Privacy Policy</a></li>
             </ul>
          </div>
        </div>
        <div className="border-t border-slate-200 dark:border-slate-800 mt-12 pt-8 text-center text-sm text-slate-500 dark:text-slate-500">
          © {new Date().getFullYear()} CloudPDF Pro. All rights reserved.
        </div>
      </div>
    </footer>
  );
};