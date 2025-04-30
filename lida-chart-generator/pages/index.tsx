// pages/index.tsx
import { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import ChartDisplay from '@/components/ChartDisplay';
import PromptInput from '@/components/PromptInput';
import DatasetSelector from '@/components/DatasetSelector';
import PromptHistory from '@/components/PromptHistory';
import CustomizationPanel from '@/components/CustomizationPanel';
import LoadingIndicator from '@/components/LoadingIndicator';


const Home: NextPage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any | null>(null);
  const [promptHistory, setPromptHistory] = useState<Array<any>>([]);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [uploadedDataset, setUploadedDataset] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Array<string>>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://127.0.0.1:3333/api/history');
      const data = await response.json();
      setPromptHistory(data.history);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const handlePromptSubmit = async (prompt: string) => {
    if (!selectedDataset && !uploadedDataset) {
      setError('Please select or upload a dataset first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://127.0.0.1:3333/api/generate-chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          dataset_key: selectedDataset || uploadedDataset,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate chart');
      }

      const data = await response.json();
      setChartData(data);
      fetchHistory(); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChartEdit = async (instructions: string[]) => {
    if (!chartData) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://127.0.0.1:3333/api/edit-chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chart_id: chartData.chart_id,
          instructions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to edit chart');
      }

      const data = await response.json();
      setChartData(data);
      fetchHistory(); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'png' | 'svg' | 'json') => {
    if (!chartData) return;

    try {
      const response = await fetch(`http://127.0.0.1:3333/api/export/${chartData.chart_id}?format=${format}`);
      const data = await response.json();

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chart_${chartData.chart_id}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        const a = document.createElement('a');
        a.href = data.image_data;
        a.download = `chart_${chartData.chart_id}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Error exporting chart:', err);
      setError('Failed to export chart');
    }
  };

  const handleHistoryItemClick = (item: any) => {
    setChartData(item);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>CSV Visualizer</title>
        <meta name="description" content="Generate charts from natural language using LIDA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Visualize CSV files</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <DatasetSelector 
              onDatasetSelect={setSelectedDataset} 
              onDatasetUpload={setUploadedDataset} 
            />

            <PromptInput 
              onSubmit={handlePromptSubmit} 
              suggestions={suggestions}
              disabled={loading || (!selectedDataset && !uploadedDataset)}
            />

            <PromptHistory 
              history={promptHistory} 
              onItemClick={handleHistoryItemClick} 
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              <LoadingIndicator />
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p>{error}</p>
              </div>
            ) : chartData ? (
              <>
                <ChartDisplay 
                  imageData={chartData.image_data} 
                  code={chartData.code} 
                  onExport={handleExport} 
                />
                <CustomizationPanel onApply={handleChartEdit} />
              </>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <p className="text-gray-500">
                  Enter a prompt and select a dataset to generate a chart
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;