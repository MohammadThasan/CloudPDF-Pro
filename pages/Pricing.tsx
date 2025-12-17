import React from 'react';
import { PLANS } from '../constants';
import { Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';

export const Pricing: React.FC = () => {
  return (
    <div className="py-20 bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Completely Free. Forever.</h1>
          <p className="text-xl text-slate-500 dark:text-slate-400">
            We believe in accessible tools for everyone. No credit card required.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          {PLANS.map((plan) => (
            <div 
              key={plan.name}
              className="relative p-8 rounded-2xl bg-white dark:bg-slate-800 border-2 border-brand-500 shadow-xl transition-all duration-300"
            >
              <div className="absolute top-0 right-0 -mt-4 mr-4 bg-gradient-to-r from-brand-600 to-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-lg">
                Full Access
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{plan.name}</h3>
              <div className="flex items-baseline mb-8">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">{plan.price}</span>
                <span className="text-slate-500 dark:text-slate-400 ml-2">{plan.period}</span>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600 dark:text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to="/signup">
                <Button 
                    variant="primary" 
                    fullWidth
                    size="lg"
                    className="bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/30"
                >
                    Create Free Account
                </Button>
              </Link>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center max-w-2xl mx-auto">
            <p className="text-slate-500 dark:text-slate-400">Open source and community driven.</p>
        </div>
      </div>
    </div>
  );
};