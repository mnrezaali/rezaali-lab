import React, { useState, useEffect } from 'react';
import { PresentationContext, AnalysisReport } from './types.ts';
import { analyzePresentation } from './services/geminiService.ts';
import ContextForm from './components/ContextForm.tsx';
import TranscriptInput from './components/TranscriptInput.tsx';
import LoadingSpinner from './components/LoadingSpinner.tsx';
import AnalysisReportComponent from './components/AnalysisReport.tsx';
import { SunIcon, MoonIcon } from './components/icons.tsx';

type AppState = 'context' | 'transcript' | 'loading' | 'report';

export default function App() {
  const [state, setState] = useState<AppState>('context');
  const [context, setContext] = useState<PresentationContext | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisReport | null>(null);
  const [error, setError] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    setIsDarkMode(shouldUseDark);
    
    if (shouldUseDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleContextSubmit = (contextData: PresentationContext) => {
    setContext(contextData);
    setState('transcript');
  };

  const handleTranscriptSubmit = (transcriptData: string) => {
    setTranscript(transcriptData);
    handleAnalysis(context!, transcriptData);
  };

  const handleAnalysis = async (contextData: PresentationContext, transcriptData: string) => {
    setState('loading');
    setError('');

    try {
      const result = await analyzePresentation(contextData, transcriptData);
      setAnalysisResult(result);
      setState('report');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setState('transcript');
    }
  };

  const handleReset = () => {
    setState('context');
    setContext(null);
    setTranscript('');
    setAnalysisResult(null);
    setError('');
  };

  const handleBackToContext = () => {
    setState('context');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                AI Presentation Coach
              </h1>
              <button
                onClick={() => window.location.href = 'index.html'}
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                ← Back to Lab
              </button>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <SunIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <MoonIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Analysis Error
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {state === 'context' && (
          <ContextForm onSubmit={handleContextSubmit} />
        )}

        {state === 'transcript' && (
          <TranscriptInput 
            onSubmit={handleTranscriptSubmit}
            onBack={handleBackToContext}
          />
        )}

        {state === 'loading' && (
          <LoadingSpinner />
        )}

        {state === 'report' && analysisResult && context && (
          <AnalysisReportComponent 
            report={analysisResult}
            context={context}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            © 2024 Reza Ali's Lab - AI Presentation Coach
          </p>
        </div>
      </footer>
    </div>
  );
}
