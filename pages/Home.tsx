import React from 'react';
import { ToolGrid } from '../components/Tools/ToolGrid';
import { ShieldCheck, Zap, History } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
        {/* Hero Section */}
        <div className="bg-white dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none"></div>
            <div className="container mx-auto px-4 pt-20 pb-16 relative z-10 text-center">
                <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
                    Every PDF Tool You Need<br />
                    <span className="text-brand-600 dark:text-brand-500">In One Place.</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Merge, split, compress, and convert PDFs with our high-speed cloud platform. 
                    Simple, secure, and 100% free.
                </p>
                
                <div className="flex justify-center items-center gap-8 text-sm text-slate-500 dark:text-slate-400 mb-12">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-green-500" />
                        <span>TLS 1.3 Secure</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-brand-500" />
                        <span>Instant Process</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-brand-500" />
                        <span>Auto-Delete</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Tools Section */}
        <div className="container mx-auto px-4 pb-24 -mt-8 relative z-20">
            <ToolGrid />
        </div>

        {/* Sign Up Callout - Changed from brand-900 (black/blue) to brand-600 (blue) for lighter feel */}
        <div className="bg-brand-600 dark:bg-slate-800 py-20 text-white transition-colors duration-300">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="max-w-xl">
                    <h2 className="text-3xl font-bold mb-4 text-white">Join the CloudPDF Community</h2>
                    <p className="text-brand-100 dark:text-slate-300 text-lg mb-8">
                        Create a free account to access your history, save favorites, and manage your documents more efficiently.
                    </p>
                    <div className="flex gap-4">
                        <div className="bg-brand-500/50 dark:bg-slate-700 p-4 rounded-lg border border-brand-400/30 dark:border-slate-600">
                            <h4 className="font-bold text-white">Unlimited</h4>
                            <p className="text-sm text-brand-100 dark:text-slate-400">No daily limits</p>
                        </div>
                        <div className="bg-brand-500/50 dark:bg-slate-700 p-4 rounded-lg border border-brand-400/30 dark:border-slate-600">
                            <h4 className="font-bold text-white">Secure</h4>
                            <p className="text-sm text-brand-100 dark:text-slate-400">Encrypted Storage</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white/10 p-8 rounded-2xl backdrop-blur-sm border border-white/20 max-w-sm w-full">
                    <div className="text-center">
                        <span className="text-sm font-medium text-brand-100 dark:text-slate-300 uppercase tracking-wider">Free Forever</span>
                        <h3 className="text-2xl font-bold mt-2 mb-6 text-white">Start Today</h3>
                        
                        <Link to="/signup">
                            <Button variant="primary" fullWidth size="lg" className="bg-white text-brand-600 hover:bg-brand-50 border-0">
                                Create Account
                            </Button>
                        </Link>
                        <p className="mt-4 text-xs text-brand-200 dark:text-slate-400">No credit card required</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};