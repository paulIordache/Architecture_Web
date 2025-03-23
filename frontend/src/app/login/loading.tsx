const Loading = () => {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="spinner-border animate-spin w-16 h-16 border-4 border-blue-500 rounded-full"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  };
  
  export default Loading;