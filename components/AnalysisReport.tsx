import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { AnalysisReport as AnalysisReportType, PresentationContext } from '../types.ts';
import { DownloadIcon, RetryIcon } from './icons.tsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface AnalysisReportProps {
  report: AnalysisReportType;
  context: PresentationContext;
  onReset: () => void;
}

export default function AnalysisReport({ report, context, onReset }: AnalysisReportProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 dark:text-green-400';
    if (score >= 5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 8) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 5) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  const chartData = report.visualFlow.map(segment => ({
    section: segment.section,
    rating: segment.rating === 'good' ? 3 : segment.rating === 'average' ? 2 : 1,
    ratingText: segment.rating.charAt(0).toUpperCase() + segment.rating.slice(1),
    description: segment.description,
    color: segment.rating === 'good' ? '#10b981' : segment.rating === 'average' ? '#f59e0b' : '#ef4444'
  }));

  const handleDownloadPDF = async () => {
    const reportElement = document.getElementById('analysis-report');
    if (!reportElement) return;

    // Temporarily switch to light mode for PDF
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      document.documentElement.classList.remove('dark');
    }

    try {
      const canvas = await html2canvas(reportElement, {
        backgroundColor: '#ffffff',
        scale: 2
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${context.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_analysis.pdf`);
    } finally {
      // Restore dark mode if it was enabled
      if (isDark) {
        document.documentElement.classList.add('dark');
      }
    }
  };

  return (
    <div className="fade-in max-w-6xl mx-auto">
      <div id="analysis-report" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Presentation Analysis Report
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Title:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{context.title}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Audience:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{context.audience}</span>
            </div>
            <div className="md:col-span-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">Purpose:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{context.purpose}</span>
            </div>
            {context.comments && (
              <div className="md:col-span-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">Comments:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{context.comments}</span>
              </div>
            )}
          </div>
        </div>

        {/* Overall Score */}
        <div className={`rounded-lg p-6 mb-8 ${getScoreBgColor(report.overallScore)}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Overall Score
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                Your presentation's effectiveness rating
              </p>
            </div>
            <div className={`text-4xl font-bold ${getScoreColor(report.overallScore)}`}>
              {report.overallScore}/10
            </div>
          </div>
        </div>

        {/* Presentation Flow Chart */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Presentation Flow
          </h2>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData}
                layout="horizontal"
                margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
              >
                <XAxis type="number" domain={[0, 3]} hide />
                <YAxis 
                  type="category" 
                  dataKey="section" 
                  tick={{ fill: 'currentColor', fontSize: 12 }}
                  width={90}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload[0]) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
                          <p className="font-medium text-gray-900 dark:text-white">{data.section}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{data.description}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="rating" fill="#8884d8">
                  <LabelList 
                    dataKey="ratingText" 
                    position="center" 
                    fill="white" 
                    fontSize={12}
                    fontWeight="bold"
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Analysis Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Filler Word Analysis */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Filler Word Analysis
            </h3>
            <div className={`text-2xl font-bold mb-2 ${getScoreColor(report.fillerWordAnalysis.score)}`}>
              {report.fillerWordAnalysis.score}/10
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {report.fillerWordAnalysis.feedback}
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Count:</span>
                <span className="font-medium">{report.fillerWordAnalysis.count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Density:</span>
                <span className="font-medium">{report.fillerWordAnalysis.density} per 100 words</span>
              </div>
            </div>
            {report.fillerWordAnalysis.flaggedSections.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Flagged Sections:</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  {report.fillerWordAnalysis.flaggedSections.map((section, index) => (
                    <li key={index}>• {section}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Clarity & Conciseness */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Clarity & Conciseness
            </h3>
            <div className={`text-2xl font-bold mb-2 ${getScoreColor(report.clarityConciseness.score)}`}>
              {report.clarityConciseness.score}/10
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {report.clarityConciseness.feedback}
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Wordiness Level:</span>
                <span className="font-medium">{report.clarityConciseness.wordiness}/10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Jargon Level:</span>
                <span className="font-medium">{report.clarityConciseness.jargonLevel}/10</span>
              </div>
            </div>
            {report.clarityConciseness.suggestions.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Suggestions:</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  {report.clarityConciseness.suggestions.map((suggestion, index) => (
                    <li key={index}>• {suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Structural Flow */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Structural Flow
            </h3>
            <div className={`text-2xl font-bold mb-2 ${getScoreColor(report.structuralFlow.score)}`}>
              {report.structuralFlow.score}/10
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {report.structuralFlow.feedback}
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Transition Quality:</span>
                <span className="font-medium">{report.structuralFlow.transitionQuality}/10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Logical Progression:</span>
                <span className="font-medium">{report.structuralFlow.logicalProgression}/10</span>
              </div>
            </div>
            {report.structuralFlow.weakPoints.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Areas to Improve:</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  {report.structuralFlow.weakPoints.map((point, index) => (
                    <li key={index}>• {point}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Engagement & Impact */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Engagement & Impact
            </h3>
            <div className={`text-2xl font-bold mb-2 ${getScoreColor(report.engagementImpact.score)}`}>
              {report.engagementImpact.score}/10
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {report.engagementImpact.feedback}
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Emotional Resonance:</span>
                <span className="font-medium">{report.engagementImpact.emotionalResonance}/10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Call-to-Action:</span>
                <span className="font-medium">{report.engagementImpact.callToActionStrength}/10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Memorability:</span>
                <span className="font-medium">{report.engagementImpact.memorability}/10</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            <DownloadIcon />
            <span>Download PDF</span>
          </button>
          <button
            onClick={onReset}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            <RetryIcon />
            <span>Analyze Another</span>
          </button>
        </div>
      </div>
    </div>
  );
}
