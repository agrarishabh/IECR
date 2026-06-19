import React from 'react';

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() { 
    return { hasError: true }; 
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-[#0a0a0a]">
          <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
          <p className="text-gray-400">An unexpected error occurred in the application.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-[#37C6CB] text-white px-6 py-2 rounded-full hover:bg-cyan-500 transition-colors"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
