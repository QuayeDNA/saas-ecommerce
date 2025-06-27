import React from 'react';

export const ProfilePage: React.FC = () => {
  // Sample user data
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+233 55 123 4567',
    userType: 'agent',
    joinDate: 'May 15, 2025'
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-4">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <div className="ml-4 text-sm text-gray-500">
          <span className="mx-1">Home</span> &gt;
          <span className="mx-1">Dashboard</span> &gt;
          <span className="mx-1">Profile</span>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center text-2xl text-gray-600">
            {user.name[0]}
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-medium">{user.name}</h2>
            <p className="text-gray-500 capitalize">{user.userType}</p>
          </div>
        </div>
        
        <div className="border-t pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Full Name</h3>
              <p>{user.name}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
              <p>{user.email}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Phone Number</h3>
              <p>{user.phone}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">User Type</h3>
              <p className="capitalize">{user.userType}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Joined</h3>
              <p>{user.joinDate}</p>
            </div>
          </div>
        </div>
        
        <div className="border-t mt-6 pt-6">
          <h3 className="font-medium mb-4">Support & Community</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Need help? Contact support</p>
              <p className="font-medium">+233 55 987 6543</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-1">Join our community</p>
              <a href="https://t.me/ecommerce-group" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                Telegram Group Link
              </a>
            </div>
          </div>
        </div>
        
        <button className="mt-8 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
