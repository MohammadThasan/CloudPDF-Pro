import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Box } from 'lucide-react';

export const Signup: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
            <div className="bg-brand-600 p-2 rounded-xl">
                <Box className="w-8 h-8 text-white" />
            </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Create your free account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow-xl shadow-slate-200/50 dark:shadow-none sm:rounded-xl sm:px-10 border border-slate-100 dark:border-slate-700">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-2 gap-4">
                <div>
                <label htmlFor="first-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    First Name
                </label>
                <div className="mt-1">
                    <input
                    id="first-name"
                    name="first-name"
                    type="text"
                    required
                    className="block w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-2.5 border"
                    />
                </div>
                </div>
                <div>
                <label htmlFor="last-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Last Name
                </label>
                <div className="mt-1">
                    <input
                    id="last-name"
                    name="last-name"
                    type="text"
                    required
                    className="block w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-2.5 border"
                    />
                </div>
                </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-2.5 border"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="block w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-2.5 border"
                />
              </div>
            </div>

            <div>
              <Button fullWidth size="lg">Create Account</Button>
            </div>
            
            <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                By clicking "Create Account", you agree to our <a href="#" className="text-brand-600 hover:underline dark:text-brand-400">Terms of Service</a> and <a href="#" className="text-brand-600 hover:underline dark:text-brand-400">Privacy Policy</a>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};