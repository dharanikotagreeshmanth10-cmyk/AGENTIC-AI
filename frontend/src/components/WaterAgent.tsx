'use client';

import React, { useEffect, useState } from 'react';

interface WaterData {
  date: string;
  water_usage: number;
  quality_index: number;
}

export default function WaterAgent() {
  const [data, setData] = useState<WaterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/water');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        } else {
          throw new Error(result.error || 'Failed to fetch data');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg">
        <h3 className="font-bold">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <span className="text-blue-500 text-3xl">💧</span> Water Analytics
      </h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-3 font-semibold text-gray-600">Date</th>
              <th className="p-3 font-semibold text-gray-600">Usage (Gal)</th>
              <th className="p-3 font-semibold text-gray-600">Quality Index</th>
              <th className="p-3 font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="p-3 text-gray-700">{item.date}</td>
                <td className="p-3 font-medium text-gray-800">{item.water_usage}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-[100px]">
                      <div 
                        className={`h-2.5 rounded-full ${item.quality_index > 90 ? 'bg-green-500' : item.quality_index > 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${item.quality_index}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{item.quality_index}</span>
                  </div>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.quality_index > 90 ? 'bg-green-100 text-green-800' : 
                    item.quality_index > 80 ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {item.quality_index > 90 ? 'Excellent' : item.quality_index > 80 ? 'Good' : 'Needs Attention'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
