// Creative loading spinner component for lazy-loaded pages
export const PageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
    <div className="text-center">
      {/* Main loading animation */}
      <div className="relative mb-6">
        {/* Outer ring */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-blue-200 rounded-full animate-pulse"></div>
        
        {/* Spinning ring */}
        <div className="absolute top-0 left-0 w-20 h-20 sm:w-24 sm:h-24 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin"></div>
        
        {/* Inner pulsing circle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
        
        {/* Floating dots */}
        <div className="absolute -top-2 -right-2 w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="absolute -top-2 -left-2 w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.6s' }}></div>
      </div>

      {/* Loading text */}
      <div className="space-y-2">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
          Loading...
        </h3>
        <p className="text-sm text-gray-600 max-w-xs">
          Preparing your experience
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center space-x-1 mt-6">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Floating shapes */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-300 rounded-full animate-ping opacity-20"></div>
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-purple-300 rounded-full animate-ping opacity-20" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-green-300 rounded-full animate-ping opacity-20" style={{ animationDelay: '2s' }}></div>
        
        {/* Geometric shapes */}
        <div className="absolute top-1/3 right-1/3 w-4 h-4 border-2 border-blue-200 rotate-45 animate-pulse opacity-30"></div>
        <div className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-purple-200 rounded-full animate-pulse opacity-30"></div>
      </div>
    </div>
  </div>
);
