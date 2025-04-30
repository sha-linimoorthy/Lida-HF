// components/DatasetSelector.tsx
import { useState, useEffect } from 'react';

interface DatasetSelectorProps {
  onDatasetSelect: (datasetKey: string) => void;
  onDatasetUpload: (datasetKey: string) => void;
}

const DatasetSelector: React.FC<DatasetSelectorProps> = ({ onDatasetSelect, onDatasetUpload }) => {
  const [sampleDatasets, setSampleDatasets] = useState<string[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  useEffect(() => {
    fetchSampleDatasets();
  }, []);

  const fetchSampleDatasets = async () => {
    try {
      const response = await fetch('http://127.0.0.1:3333/api/sample-datasets');
      const data = await response.json();
      setSampleDatasets(data.datasets);
    } catch (err) {
      console.error('Error fetching sample datasets:', err);
    }
  };

  const handleDatasetSelect = (dataset: string) => {
    setSelectedDataset(dataset);
    onDatasetSelect(dataset);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
      setUploadError('Please upload a CSV or Excel file');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://127.0.0.1:3333/api/upload-dataset', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to upload dataset');
      }

      const data = await response.json();
      setSelectedDataset(data.dataset_key);
      setUploadedFileName(file.name);
      onDatasetUpload(data.dataset_key);
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedDataset(null);
    setUploadedFileName(null);
    // Reset the file input by creating a new reference
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-3">Select Dataset</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Upload your data</h3>
          
          {!uploadedFileName ? (
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">CSV or Excel files only</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".csv,.xlsx,.xls" 
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          ) : (
            <div className="flex flex-col items-center border-2 border-green-200 rounded-lg p-4 bg-green-50">
              <div className="flex items-center mb-3">
                <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span className="font-medium text-green-600">File uploaded successfully</span>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                File: <span className="font-semibold">{uploadedFileName}</span>
              </p>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Re-upload
              </button>
            </div>
          )}
          
          {uploading && <p className="mt-2 text-sm text-blue-500">Uploading...</p>}
          {uploadError && <p className="mt-2 text-sm text-red-500">{uploadError}</p>}
        </div>

        {/*<div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Or choose a sample dataset</h3>
          <div className="grid grid-cols-2 gap-2">
            {sampleDatasets.map((dataset) => (
              <button
                key={dataset}
                className={`px-3 py-2 rounded-md text-sm ${
                  selectedDataset === dataset
                    ? 'bg-blue-100 text-blue-700 border-blue-300 border'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => handleDatasetSelect(dataset)}
              >
                {dataset.charAt(0).toUpperCase() + dataset.slice(1)}
              </button>
            ))}
          </div>
        </div>*/}
      </div>
    </div>
  );
};

export default DatasetSelector;