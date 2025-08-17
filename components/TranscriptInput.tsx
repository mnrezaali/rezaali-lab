import React, { useState } from 'react';
import { BackIcon, AnalyzeIcon } from './icons.tsx';

interface TranscriptInputProps {
  onSubmit: (transcript: string) => void;
  onBack: () => void;
}

export default function TranscriptInput({ onSubmit, onBack }: TranscriptInputProps) {
  const [transcript, setTranscript] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transcript.trim()) {
      onSubmit(transcript.trim());
    }
  };

  const wordCount = transcript.trim().split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div className="fade-in max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Presentation Transcript
          </h2>
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <BackIcon />
            <span>Back</span>
          </button>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Paste the full text of your presentation below. The AI will analyze your content for clarity, 
          structure, engagement, and areas for improvement.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="transcript" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Presentation Text
            </label>
            <textarea
              id="transcript"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={20}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Paste your presentation transcript here..."
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {wordCount} words
              </p>
              {wordCount < 50 && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Minimum 50 words recommended for accurate analysis
                </p>
              )}
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Back to Context
            </button>
            <button
              type="submit"
              disabled={!transcript.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex items-center justify-center space-x-2"
            >
              <AnalyzeIcon />
              <span>Analyze Presentation</span>
            </button>
          </div>
        </form>
        
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
            What will be analyzed:
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
            <li>• Filler words and speech patterns</li>
            <li>• Clarity and conciseness of message</li>
            <li>• Structural flow and organization</li>
            <li>• Engagement and emotional impact</li>
            <li>• Overall presentation effectiveness</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
