export const MTNPage = () => {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">MTN Services</h2>
      
      {/* Single Order Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-medium mb-4">Single Order</h3>
        
        <form className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter phone number"
            />
          </div>
          
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount (GH¢)
            </label>
            <input
              type="number"
              id="amount"
              min="1"
              step="0.1"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter amount"
            />
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
            >
              Process Order
            </button>
          </div>
        </form>
      </div>
      
      {/* Bulk Order Options */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium">Bulk Order</h3>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button className="py-4 px-6 border-b-2 border-yellow-500 font-medium text-yellow-600">
              Text Input
            </button>
            <button className="py-4 px-6 text-gray-500 hover:text-gray-700">
              Excel Upload
            </button>
          </nav>
        </div>
        
        {/* Text Input Form */}
        <div className="p-6">
          <div className="mb-4">
            <label htmlFor="bulk-text" className="block text-sm font-medium text-gray-700 mb-1">
              Enter Numbers and Amounts (one per line)
            </label>
            <div className="text-xs text-gray-500 mb-2">Format: PhoneNumber,Amount (e.g. 0551234567,10)</div>
            <textarea
              id="bulk-text"
              rows={6}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="0551234567,10&#10;0551234568,20&#10;0551234569,5"
            />
          </div>
          
          <button
            type="button"
            className="w-full bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
          >
            Process Bulk Order
          </button>
        </div>
      </div>
    </div>
  );
};
