const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <div className="relative w-20 h-20"></div>
      
      <p className="mt-6 text-lg font-medium text-gray-700">Processing Data</p>
      <p className="text-sm text-gray-500 mt-2">Please wait while we generate your visualization</p>
      
      {/* Progress dots */}
      <div className="flex space-x-2 mt-4">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
      </div>
    </div>
  );
};

export default LoadingIndicator;