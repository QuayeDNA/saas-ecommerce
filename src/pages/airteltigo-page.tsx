import React from 'react';

export const AirtelTigoPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-4">
        <h1 className="text-2xl font-bold">AirtelTigo Order</h1>
        <div className="ml-4 text-sm text-gray-500">
          <span className="mx-1">Home</span> &gt;
          <span className="mx-1">Dashboard</span> &gt;
          <span className="mx-1">AirtelTigo</span>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-4">Place AirtelTigo Order</h2>
        
        <form>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter phone number"
              />
            </div>
            
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount (GHS)
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
                min="1"
              />
            </div>
            
            <div>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Place Order
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AirtelTigoPage;
