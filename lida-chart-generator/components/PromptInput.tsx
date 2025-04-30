// components/PromptInput.tsx
import { useState, useEffect } from 'react';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  suggestions: string[];
  disabled?: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ onSubmit, suggestions, disabled }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  
  const examplePrompts = [
    "Show me a bar chart of passenger survival rates by class",
    "Create a scatter plot of age vs fare with gender as color",
    "Create a pie chart showing the percentage of survivors vs non-survivors by gender.",
    "Use a box plot to visualize the distribution of ages among passengers",
    "Create a bar chart to compare survival rates between males and females"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt.trim());
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-3">Describe your chart</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the chart you want to generate..."
            onFocus={() => setShowSuggestions(true)}
            disabled={disabled}
          />
          
          {/*showSuggestions && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
              <div className="p-2 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-700">Examples:</h3>
              </div>
              <ul>
                {examplePrompts.map((suggestion, index) => (
                  <li 
                    key={index} 
                    className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )*/}
        </div>
        
        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={disabled || !prompt.trim()}
          >
            Generate Chart
          </button>
        </div>
      </form>
    </div>
  );
};

export default PromptInput;