// Pure JavaScript React App - No JSX/TypeScript
function App() {
  const [state, setState] = React.useState('context');
  const [context, setContext] = React.useState(null);
  const [transcript, setTranscript] = React.useState('');
  const [analysisResult, setAnalysisResult] = React.useState(null);
  const [error, setError] = React.useState('');
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  // Initialize theme
  React.useEffect(() => {
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

  const handleContextSubmit = (contextData) => {
    setContext(contextData);
    setState('transcript');
  };

  const handleTranscriptSubmit = (transcriptData) => {
    setTranscript(transcriptData);
    handleAnalysis(context, transcriptData);
  };

  const handleAnalysis = async (contextData, transcriptData) => {
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

  // Simple icon components
  const SunIcon = ({ className }) => React.createElement('svg', {
    className,
    fill: 'none',
    viewBox: '0 0 24 24',
    stroke: 'currentColor'
  }, React.createElement('path', {
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: 2,
    d: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
  }));

  const MoonIcon = ({ className }) => React.createElement('svg', {
    className,
    fill: 'none',
    viewBox: '0 0 24 24',
    stroke: 'currentColor'
  }, React.createElement('path', {
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: 2,
    d: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
  }));

  return React.createElement('div', {
    className: "min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300"
  }, [
    // Header
    React.createElement('header', {
      key: 'header',
      className: "bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700"
    }, React.createElement('div', {
      className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    }, React.createElement('div', {
      className: "flex justify-between items-center h-16"
    }, [
      React.createElement('div', {
        key: 'left',
        className: "flex items-center space-x-4"
      }, [
        React.createElement('h1', {
          key: 'title',
          className: "text-xl font-bold text-gray-900 dark:text-white"
        }, 'AI Presentation Coach'),
        React.createElement('button', {
          key: 'back',
          onClick: () => window.location.href = 'index.html',
          className: "text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        }, '← Back to Lab')
      ]),
      React.createElement('button', {
        key: 'theme',
        onClick: toggleTheme,
        className: "p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors",
        'aria-label': "Toggle theme"
      }, isDarkMode ? 
        React.createElement(SunIcon, { className: "w-5 h-5 text-gray-700 dark:text-gray-300" }) :
        React.createElement(MoonIcon, { className: "w-5 h-5 text-gray-700 dark:text-gray-300" })
      )
    ]))),
    
    // Main Content
    React.createElement('main', {
      key: 'main',
      className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    }, [
      error && React.createElement('div', {
        key: 'error',
        className: "mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
      }, React.createElement('div', {
        className: "flex"
      }, [
        React.createElement('div', {
          key: 'icon',
          className: "flex-shrink-0"
        }, React.createElement('svg', {
          className: "h-5 w-5 text-red-400",
          viewBox: "0 0 20 20",
          fill: "currentColor"
        }, React.createElement('path', {
          fillRule: "evenodd",
          d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z",
          clipRule: "evenodd"
        }))),
        React.createElement('div', {
          key: 'content',
          className: "ml-3"
        }, [
          React.createElement('h3', {
            key: 'title',
            className: "text-sm font-medium text-red-800 dark:text-red-200"
          }, 'Analysis Error'),
          React.createElement('div', {
            key: 'message',
            className: "mt-2 text-sm text-red-700 dark:text-red-300"
          }, error)
        ])
      ])),
      
      state === 'context' && React.createElement('div', {
        key: 'context',
        className: "max-w-2xl mx-auto"
      }, React.createElement('div', {
        className: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      }, [
        React.createElement('h2', {
          key: 'title',
          className: "text-2xl font-bold text-gray-900 dark:text-white mb-6"
        }, 'Presentation Context'),
        React.createElement('p', {
          key: 'desc',
          className: "text-gray-600 dark:text-gray-300 mb-8"
        }, 'Please provide some context about your presentation to help our AI provide more targeted feedback.'),
        React.createElement('div', {
          key: 'form',
          className: "space-y-6"
        }, [
          React.createElement('div', {
            key: 'title-field'
          }, [
            React.createElement('label', {
              key: 'label',
              className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            }, 'Presentation Title'),
            React.createElement('input', {
              key: 'input',
              type: 'text',
              id: 'title',
              className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white",
              placeholder: "e.g., Q3 Sales Review"
            })
          ]),
          React.createElement('div', {
            key: 'purpose-field'
          }, [
            React.createElement('label', {
              key: 'label',
              className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            }, 'Purpose'),
            React.createElement('select', {
              key: 'select',
              id: 'purpose',
              className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            }, [
              React.createElement('option', { key: 'default', value: '' }, 'Select purpose...'),
              React.createElement('option', { key: 'inform', value: 'inform' }, 'Inform'),
              React.createElement('option', { key: 'persuade', value: 'persuade' }, 'Persuade'),
              React.createElement('option', { key: 'train', value: 'train' }, 'Train/Educate'),
              React.createElement('option', { key: 'pitch', value: 'pitch' }, 'Pitch/Sell'),
              React.createElement('option', { key: 'update', value: 'update' }, 'Status Update'),
              React.createElement('option', { key: 'other', value: 'other' }, 'Other')
            ])
          ]),
          React.createElement('div', {
            key: 'audience-field'
          }, [
            React.createElement('label', {
              key: 'label',
              className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            }, 'Target Audience'),
            React.createElement('input', {
              key: 'input',
              type: 'text',
              id: 'audience',
              className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white",
              placeholder: "e.g., Senior executives, Technical team, General public"
            })
          ]),
          React.createElement('button', {
            key: 'submit',
            onClick: () => {
              const title = document.getElementById('title').value;
              const purpose = document.getElementById('purpose').value;
              const audience = document.getElementById('audience').value;
              
              if (!title || !purpose || !audience) {
                alert('Please fill in all required fields');
                return;
              }
              
              handleContextSubmit({ title, purpose, audience });
            },
            className: "w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          }, 'Continue to Transcript')
        ])
      ])),
      
      state === 'transcript' && React.createElement('div', {
        key: 'transcript',
        className: "max-w-4xl mx-auto"
      }, 'Transcript Input Component'),
      
      state === 'loading' && React.createElement('div', {
        key: 'loading',
        className: "flex flex-col items-center justify-center py-12"
      }, [
        React.createElement('div', {
          key: 'spinner',
          className: "animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"
        }),
        React.createElement('p', {
          key: 'text',
          className: "mt-4 text-lg text-gray-600 dark:text-gray-300"
        }, 'Analyzing your presentation...')
      ]),
      
      state === 'report' && React.createElement('div', {
        key: 'report',
        className: "max-w-4xl mx-auto"
      }, 'Analysis Report Component')
    ].filter(Boolean)),
    
    // Footer
    React.createElement('footer', {
      key: 'footer',
      className: "bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
    }, React.createElement('div', {
      className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"
    }, React.createElement('p', {
      className: "text-center text-sm text-gray-600 dark:text-gray-400"
    }, '© 2024 Reza Ali\'s Lab - AI Presentation Coach')))
  ]);
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = App;
}

// Global assignment for script tag usage
window.App = App;
