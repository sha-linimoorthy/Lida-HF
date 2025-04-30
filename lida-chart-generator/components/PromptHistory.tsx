// components/PromptHistory.tsx
import { useState } from 'react';

interface HistoryItem {
  id: string;
  prompt: string;
  image_data: string;
  dataset: string;
}

interface PromptHistoryProps {
  history: HistoryItem[];
  onItemClick: (item: HistoryItem) => void;
}

const PromptHistory: React.FC<PromptHistoryProps> = ({ history, onItemClick }) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Prompt History</h2>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {!history || history.length === 0 ? (
        <p className="text-sm text-gray-500">No history yet. Generate your first chart!</p>
      ) : (
        <div className={`space-y-3 ${expanded ? '' : 'max-h-60 overflow-y-auto'}`}>
          {history.map((item) => (
            <div 
              key={item.id}
              className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onItemClick(item)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                  <img 
                    src={item.image_data} 
                    alt="Chart thumbnail" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.prompt}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Dataset: {item.dataset || 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PromptHistory;