import React from 'react';

export const AfaRegistrationPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-4">
        <h1 className="text-2xl font-bold">AFA Registration</h1>
        <div className="ml-4 text-sm text-gray-500">
          <span className="mx-1">Home</span> &gt;
          <span className="mx-1">Dashboard</span> &gt;
          <span className="mx-1">AFA Registration</span>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
        <h2 className="text-lg font-medium mb-2">Register for AFA</h2>
        <p className="text-gray-600 mb-6">Complete the form below to register a new AFA account.</p>
        
        <form>
          <div className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter full name"
              />
            </div>
            
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border rounded p-4 flex items-start">
                  <input
                    type="radio"
                    id="agent"
                    name="userType"
                    value="agent"
                    className="mt-1"
                  />
                  <div className="ml-3">
                    <label htmlFor="agent" className="font-medium">Agent</label>
                    <p className="text-sm text-gray-500">Registration Fee: GH¢3</p>
                  </div>
                </div>
                
                <div className="border rounded p-4 flex items-start">
                  <input
                    type="radio"
                    id="subscriber"
                    name="userType"
                    value="subscriber"
                    className="mt-1"
                  />
                  <div className="ml-3">
                    <label htmlFor="subscriber" className="font-medium">Subscriber</label>
                    <p className="text-sm text-gray-500">Registration Fee: GH¢5.5</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Submit Registration
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AfaRegistrationPage;
