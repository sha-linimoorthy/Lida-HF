// components/ChartDisplay.tsx
import { useState } from 'react';
import { Tab } from '@headlessui/react';

interface ChartDisplayProps {
  imageData: string;
  code: string;
  onExport: (format: 'png' | 'svg' | 'json') => void;
}

const ChartDisplay: React.FC<ChartDisplayProps> = ({ imageData, code, onExport }) => {
  const [activeTab, setActiveTab] = useState<'chart' | 'code'>('chart');

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <div className="space-x-4">
          <button
            className={`px-3 py-1 rounded-md ${
              activeTab === 'chart' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('chart')}
          >
            Chart
          </button>
          <button
            className={`px-3 py-1 rounded-md ${
              activeTab === 'code' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('code')}
          >
            Code
          </button>
        </div>
        <div className="space-x-2">
          <button
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            onClick={() => onExport('png')}
          >
            PNG
          </button>
          {/*<button
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            onClick={() => onExport('svg')}
          >
            SVG
          </button>
          <button
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            onClick={() => onExport('json')}
          >
            JSON
          </button>*/}
        </div>
      </div>
      <div className="p-4">
        {activeTab === 'chart' ? (
          <div className="flex justify-center">
            <img src={imageData} alt="Generated Chart" className="max-w-full h-auto" />
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-md overflow-auto">
            <pre className="text-sm text-gray-800">{code}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartDisplay;