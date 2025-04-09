"use client";
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const [feedbackData, setFeedbackData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Backend API URL - store in environment variable in production
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cumeal.vercel.app/api';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all feedback entries
        const responseFeedback = await fetch(`${API_URL}/feedback`);
        if (!responseFeedback.ok) {
          throw new Error('Failed to fetch feedback data');
        }
        const feedbackData = await responseFeedback.json();
        setFeedbackData(feedbackData);
        
        // Fetch statistics
        const responseStats = await fetch(`${API_URL}/feedback/stats`);
        if (!responseStats.ok) {
          throw new Error('Failed to fetch statistics');
        }
        const statsData = await responseStats.json();
        setStats(statsData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <span className="ml-2 text-lg text-slate-700 dark:text-slate-300">Loading data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-center">
        <p className="text-red-700 dark:text-red-400">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Prepare chart data
  const chartData = [
    { name: 'Want App', value: stats?.wantApp || 0, color: '#22c55e' },
    { name: 'Don\'t Want App', value: stats?.dontWantApp || 0, color: '#f59e0b' }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-lg max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-amber-800 dark:text-amber-400 mb-8 text-center">
        Feedback Dashboard
      </h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-700 p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold text-amber-800 dark:text-amber-400 mb-2">Total Responses</h3>
          <p className="text-4xl font-bold text-amber-600 dark:text-amber-500">{stats?.total || 0}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-700 p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold text-green-800 dark:text-green-400 mb-2">Want Mobile App</h3>
          <p className="text-4xl font-bold text-green-600 dark:text-green-500">{stats?.wantApp || 0}</p>
          <p className="text-sm text-green-700 dark:text-green-400 mt-2">
            {stats?.wantAppPercentage ? `${Math.round(stats.wantAppPercentage)}%` : '0%'} of responses
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-800 dark:to-slate-700 p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold text-orange-800 dark:text-orange-400 mb-2">Don't Want App</h3>
          <p className="text-4xl font-bold text-orange-600 dark:text-orange-500">{stats?.dontWantApp || 0}</p>
          <p className="text-sm text-orange-700 dark:text-orange-400 mt-2">
            {stats?.wantAppPercentage ? `${Math.round(100 - stats.wantAppPercentage)}%` : '0%'} of responses
          </p>
        </div>
      </div>
      
      {/* Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow mb-8">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Response Distribution</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Feedback Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow overflow-hidden">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 p-6 border-b border-slate-200 dark:border-slate-700">
          All Feedback
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700">
              <tr>
                <th className="py-3 px-6 text-left text-sm font-medium text-slate-700 dark:text-slate-300">Name</th>
                <th className="py-3 px-6 text-left text-sm font-medium text-slate-700 dark:text-slate-300">Wants App</th>
                <th className="py-3 px-6 text-left text-sm font-medium text-slate-700 dark:text-slate-300">Comment</th>
                <th className="py-3 px-6 text-left text-sm font-medium text-slate-700 dark:text-slate-300">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {feedbackData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-4 px-6 text-center text-slate-500 dark:text-slate-400">
                    No feedback data available
                  </td>
                </tr>
              ) : (
                feedbackData.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-750">
                    <td className="py-4 px-6 text-sm text-slate-900 dark:text-slate-300">{item.name}</td>
                    <td className="py-4 px-6 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.wantsMobileApp 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
                      }`}>
                        {item.wantsMobileApp ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-900 dark:text-slate-300">
                      {item.message || '-'}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}