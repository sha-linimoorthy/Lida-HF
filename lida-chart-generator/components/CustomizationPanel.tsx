// components/CustomizationPanel.tsx
import { useState } from 'react';
import { callbackify } from 'util'

interface CustomizationPanelProps {
  onApply: (instructions: string[]) => void;
}

const CustomizationPanel: React.FC<CustomizationPanelProps> = ({ onApply }) => {
  const [chartType, setChartType] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [colorScheme, setColorScheme] = useState<string>('');
  const [customInstructions, setCustomInstructions] = useState<string>('');

  const handleApply = () => {
    const instructions: string[] = [];
    
    if (chartType) {
      instructions.push(`change the chart type to ${chartType}`);
    }
    
    if (title) {
      instructions.push(`set the title to "${title}"`);
    }
    
    if (colorScheme) {
      instructions.push(`use the ${colorScheme} color palette`);
    }
    
    if (customInstructions) {
      instructions.push(customInstructions);
    }
    
    if (instructions.length > 0) {
      onApply(instructions);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-3">Customize Chart</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chart Type
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
          >
            <option value="">Select chart type</option>
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
            <option value="scatter">Scatter Plot</option>
            <option value="box">Box Plot</option>
            <option value="violin">Violin Plot</option>
            <option value="heatmap">Heatmap</option>
            <option value="pie">Pie Chart</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chart Title
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter chart title"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Color Scheme
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={colorScheme}
            onChange={(e) => setColorScheme(e.target.value)}
          >
            <option value="">Select color scheme</option>
            <option value="viridis">Viridis</option>
            <option value="magma">Magma</option>
            <option value="plasma">Plasma</option>
            <option value="inferno">Inferno</option>
            <option value="cividis">Cividis</option>
            <option value="blues">Blues</option>
            <option value="greens">Greens</option>
            <option value="reds">Reds</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Custom Instructions
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="E.g., make the lines thicker, rotate x-axis labels"
          />
        </div>
        
        <div className="flex justify-end">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={handleApply}
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomizationPanel;