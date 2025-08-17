import React, { useState } from 'react';
import { PresentationContext } from '../types.ts';

interface ContextFormProps {
  onSubmit: (context: PresentationContext) => void;
}

export default function ContextForm({ onSubmit }: ContextFormProps) {
  const [context, setContext] = useState<PresentationContext>({
    title: '',
    purpose: '',
    audience: '',
    comments: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!context.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!context.purpose.trim()) {
      newErrors.purpose = 'Purpose is required';
    }
    if (!context.audience.trim()) {
      newErrors.audience = 'Audience is required';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onSubmit(context);
    }
  };

  const handleChange = (field: keyof PresentationContext, value: string) => {
    setContext(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fade-in max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Presentation Context
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Provide some context about your presentation to get more tailored feedback.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Presentation Title *
            </label>
            <input
              type="text"
              id="title"
              value={context.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.title 
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
              } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
              placeholder="e.g., Quarterly Sales Review"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Purpose *
            </label>
            <textarea
              id="purpose"
              value={context.purpose}
              onChange={(e) => handleChange('purpose', e.target.value)}
              rows={3}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                errors.purpose 
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
              } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
              placeholder="What do you want to achieve with this presentation?"
            />
            {errors.purpose && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.purpose}</p>
            )}
          </div>

          <div>
            <label htmlFor="audience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target Audience *
            </label>
            <input
              type="text"
              id="audience"
              value={context.audience}
              onChange={(e) => handleChange('audience', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.audience 
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
              } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
              placeholder="e.g., Executive team, Colleagues, Students"
            />
            {errors.audience && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.audience}</p>
            )}
          </div>

          <div>
            <label htmlFor="comments" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              General Comments <span className="text-gray-500">(Optional)</span>
            </label>
            <textarea
              id="comments"
              value={context.comments}
              onChange={(e) => handleChange('comments', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Any specific areas you'd like feedback on or concerns you have?"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Continue to Transcript
          </button>
        </form>
      </div>
    </div>
  );
}
