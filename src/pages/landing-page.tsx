// Landing page / Shop (public)
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardHeader, CardBody } from '../design-system';

export const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex justify-between items-center">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">SaaS Telecom</div>
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 text-blue-600 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            
            {/* Desktop menu */}            <div className="hidden md:flex space-x-4">
              <Link to="/login" className="inline-block">
                <Button variant="outline" size="md">Login</Button>
              </Link>
              <Link to="/register" className="inline-block">
                <Button variant="primary" size="md">Sign Up</Button>
              </Link>
            </div>
          </nav>
          
          {/* Mobile menu dropdown */}
          {isMenuOpen && (
            <div className="md:hidden mt-3 pt-3 border-t border-gray-200">              <div className="flex flex-col space-y-2">
                <Link to="/login" className="inline-block" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" size="md" fullWidth>Login</Button>
                </Link>
                <Link to="/register" className="inline-block" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="primary" size="md" fullWidth>Sign Up</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-8 sm:py-16">
        <div className="text-center mb-10 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">Airtime & Data Services</h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Fast and reliable telecom services for all your communication needs
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">          {/* MTN Card */}
          <Card variant="outlined" className="hover:shadow-xl transition-all border-t-4 border-yellow-500">
            <CardHeader className="pb-0 bg-white">
              <div className="text-xl font-semibold text-yellow-500">MTN Services</div>
            </CardHeader>
            <CardBody>
              <p className="text-gray-600 mb-6">Get MTN airtime and data at the best rates</p>
              <Link to="/login" className="block">
                <Button variant="primary" colorScheme="warning" fullWidth>Get Started</Button>
              </Link>
            </CardBody>
          </Card>
            {/* Vodafone Card */}
          <Card variant="outlined" className="hover:shadow-xl transition-all border-t-4 border-red-500">
            <CardHeader className="pb-0 bg-white">
              <div className="text-xl font-semibold text-red-500">Vodafone Services</div>
            </CardHeader>
            <CardBody>
              <p className="text-gray-600 mb-6">Quick and easy Vodafone airtime and data services</p>
              <Link to="/login" className="block">
                <Button variant="primary" colorScheme="error" fullWidth>Get Started</Button>
              </Link>
            </CardBody>
          </Card>
          
          {/* AirtelTigo Card */}
          <Card variant="outlined" className="hover:shadow-xl transition-all border-t-4 border-blue-500 sm:col-span-2 md:col-span-1 sm:max-w-md sm:mx-auto md:max-w-none md:mx-0">
            <CardHeader className="pb-0 bg-white">
              <div className="text-xl font-semibold text-blue-500">AirtelTigo Services</div>
            </CardHeader>
            <CardBody>
              <p className="text-gray-600 mb-6">Reliable AirtelTigo airtime and data packages</p>
              <Link to="/login" className="block">
                <Button variant="primary" colorScheme="info" fullWidth>Get Started</Button>
              </Link>
            </CardBody>
          </Card>
        </div>
        
        {/* Features section */}
        <div className="mt-16 sm:mt-24">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-gray-800">Why Choose Us</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Instant Delivery</h3>
              <p className="text-gray-600">Get your airtime and data instantly after purchase</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Secure Payments</h3>
              <p className="text-gray-600">Your transactions are 100% secure with us</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">24/7 Support</h3>
              <p className="text-gray-600">Our customer support team is always available</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Best Rates</h3>
              <p className="text-gray-600">Competitive pricing with great discounts</p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-bold mb-4">SaaS Telecom</h4>
              <p className="text-gray-300 text-sm">Your trusted provider of telecom services in Ghana</p>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link to="/" className="hover:text-white">Home</Link></li>
                <li><Link to="/login" className="hover:text-white">Login</Link></li>
                <li><Link to="/register" className="hover:text-white">Register</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-gray-300">                <li><Link to="/login" className="hover:text-white">MTN</Link></li>
                <li><Link to="/login" className="hover:text-white">Vodafone</Link></li>
                <li><Link to="/login" className="hover:text-white">AirtelTigo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Email: info@saastelecom.com</li>
                <li>Phone: +233 55 123 4567</li>
                <li>Accra, Ghana</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-gray-700 text-center text-gray-300 text-sm">
            <p>&copy; {new Date().getFullYear()} SaaS Telecom. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
