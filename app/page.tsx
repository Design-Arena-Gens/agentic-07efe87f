'use client';

import { useState } from 'react';

interface AnalysisResult {
  brandAnalysis: string;
  targetAudience: string;
  competitivePosition: string;
  contentStrategy: string;
  seoAnalysis: string;
  conversionOptimization: string;
  socialMediaStrategy: string;
  paidAdvertising: string;
  emailMarketing: string;
  analyticsInsights: string;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setAnalysis(data.analysis);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze website');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Marketing Expert Team
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Complete marketing analysis in seconds. Just paste a URL.
            </p>
          </div>

          {/* Input Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 px-6 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-purple-500 dark:bg-gray-700 dark:text-white text-lg"
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
              />
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
              >
                {loading ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
            {error && (
              <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
                {error}
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg">
                Our AI marketing team is analyzing the website...
              </p>
            </div>
          )}

          {/* Results */}
          {analysis && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <AnalysisCard
                  title="🎯 Brand Analysis"
                  content={analysis.brandAnalysis}
                  gradient="from-purple-500 to-pink-500"
                />
                <AnalysisCard
                  title="👥 Target Audience"
                  content={analysis.targetAudience}
                  gradient="from-blue-500 to-cyan-500"
                />
                <AnalysisCard
                  title="⚔️ Competitive Position"
                  content={analysis.competitivePosition}
                  gradient="from-green-500 to-emerald-500"
                />
                <AnalysisCard
                  title="📝 Content Strategy"
                  content={analysis.contentStrategy}
                  gradient="from-orange-500 to-red-500"
                />
                <AnalysisCard
                  title="🔍 SEO Analysis"
                  content={analysis.seoAnalysis}
                  gradient="from-indigo-500 to-purple-500"
                />
                <AnalysisCard
                  title="💰 Conversion Optimization"
                  content={analysis.conversionOptimization}
                  gradient="from-yellow-500 to-orange-500"
                />
                <AnalysisCard
                  title="📱 Social Media Strategy"
                  content={analysis.socialMediaStrategy}
                  gradient="from-pink-500 to-rose-500"
                />
                <AnalysisCard
                  title="💳 Paid Advertising"
                  content={analysis.paidAdvertising}
                  gradient="from-teal-500 to-green-500"
                />
                <AnalysisCard
                  title="📧 Email Marketing"
                  content={analysis.emailMarketing}
                  gradient="from-violet-500 to-purple-500"
                />
                <AnalysisCard
                  title="📊 Analytics Insights"
                  content={analysis.analyticsInsights}
                  gradient="from-cyan-500 to-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AnalysisCard({ title, content, gradient }: { title: string; content: string; gradient: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all hover:scale-105">
      <div className={`bg-gradient-to-r ${gradient} p-4`}>
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      <div className="p-6">
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
          {content}
        </p>
      </div>
    </div>
  );
}
