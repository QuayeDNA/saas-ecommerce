// src/pages/landing-page.tsx

/**
 * Modern Landing Page for SaaS Telecom Platform
 * 
 * Features:
 * - Mobile-first responsive design with modern aesthetics
 * - Hero section with engaging visuals and clear CTAs
 * - Feature highlights with icons and animations
 * - Network service cards with hover effects
 * - Social proof with customer testimonials
 * - Comprehensive footer with contact information
 * - Modern image components and animations
 * - Consistent design system usage
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaPhoneAlt, 
  FaWifi, 
  FaShieldAlt, 
  FaClock, 
  FaUsers, 
  FaChartLine, 
  FaBars,
  FaTimes,
  FaArrowRight,
  FaCheck,
  FaPlay,
  FaMobile,
  FaHeadset
} from 'react-icons/fa';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardBody,
  Hero,
  HeroTitle,
  HeroSubtitle,
  Feature,
  FeatureGrid,
  Container,
  SectionHeader,
  Testimonial,
  Avatar
} from '../design-system';

export const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200">
        <Container padding="md">
          <nav className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <FaPhoneAlt className="text-white text-xl" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-gray-900">TelecomSaaS</span>
            </div>
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 focus:outline-none transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
            
            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="#features" className="text-gray-600 hover:text-blue-600 transition-colors">
                Features
              </Link>
              <Link to="#services" className="text-gray-600 hover:text-blue-600 transition-colors">
                Services
              </Link>
              <Link to="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">
                Pricing
              </Link>
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="ghost" size="md">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="md">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </nav>
          
          {/* Mobile menu dropdown */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100 bg-white">
              <div className="flex flex-col space-y-4">
                <Link 
                  to="#features" 
                  className="text-gray-600 hover:text-blue-600 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Features
                </Link>
                <Link 
                  to="#services" 
                  className="text-gray-600 hover:text-blue-600 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Services
                </Link>
                <Link 
                  to="#pricing" 
                  className="text-gray-600 hover:text-blue-600 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Pricing
                </Link>
                <div className="flex flex-col space-y-3 pt-4 border-t border-gray-100">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="md" fullWidth>
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="primary" size="md" fullWidth>
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </Container>
      </header>     
       <main className="flex-grow">
        {/* Enhanced Hero Section */}
        <Hero background="gradient" size="xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left">
              <HeroTitle size="xl" className="mb-6">
                Transform Your
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block sm:inline sm:ml-3">
                  Telecom Business
                </span>
              </HeroTitle>
              
              <HeroSubtitle size="lg" className="mb-8 max-w-2xl">
                Streamline airtime and data distribution across all major networks. 
                Manage sales, track performance, and scale your business with our 
                comprehensive SaaS platform.
              </HeroSubtitle>

              {/* Hero CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8">
                <Link to="/register">
                  <Button variant="primary" size="lg" rightIcon={<FaArrowRight />}>
                    Start Free Trial
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg" 
                  leftIcon={<FaPlay />}
                  className="group"
                >
                  <span className="mr-2">Watch Demo</span>
                  <div className="w-0 group-hover:w-4 transition-all duration-200 overflow-hidden">
                    <FaPlay className="text-sm" />
                  </div>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-white/20">
                <div className="text-center lg:text-left">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">1000+</div>
                  <div className="text-gray-600 text-sm">Active Agents</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">₵2M+</div>
                  <div className="text-gray-600 text-sm">Monthly Volume</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">99.9%</div>
                  <div className="text-gray-600 text-sm">Uptime</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">24/7</div>
                  <div className="text-gray-600 text-sm">Support</div>
                </div>
              </div>
            </div>

            {/* Right Column - Hero Image/Dashboard Preview */}
            <div className="relative">
              {/* Floating dashboard mockup */}
              <div className="relative bg-white rounded-2xl shadow-2xl p-6 transform hover:scale-105 transition-transform duration-500">
                {/* Mock dashboard header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                      <FaPhoneAlt className="text-white text-sm" />
                    </div>
                    <span className="font-bold text-gray-900">Dashboard</span>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>

                {/* Mock dashboard content */}
                <div className="space-y-4">
                  {/* Stats cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl">
                      <div className="text-2xl font-bold">₵45,250</div>
                      <div className="text-blue-100 text-sm">Total Sales</div>
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl">
                      <div className="text-2xl font-bold">1,247</div>
                      <div className="text-green-100 text-sm">Transactions</div>
                    </div>
                  </div>

                  {/* Mock chart */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-end space-x-2 h-20">
                      {[40, 65, 45, 80, 55, 70, 90].map((height, i) => (
                        <div
                          key={i}
                          className="bg-gradient-to-t from-blue-400 to-blue-500 rounded-t flex-1"
                          style={{ height: `${height}%` }}
                        ></div>
                      ))}
                    </div>
                    <div className="text-xs text-gray-600 text-center mt-2">Sales Overview</div>
                  </div>

                  {/* Recent transactions */}
                  <div className="space-y-2">
                    {['MTN Airtime - ₵50', 'Vodafone Data - ₵25', 'AirtelTigo - ₵30'].map((transaction, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">{transaction}</span>
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white animate-bounce">
                <FaMobile className="text-xl" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center text-white animate-pulse">
                <FaWifi className="text-lg" />
              </div>
            </div>
          </div>
        </Hero>

        {/* Enhanced Features Section */}
        <section id="features" className="py-20 bg-gray-50">
          <Container>
            <SectionHeader 
              title="Why Choose Our Platform?"
              subtitle="Everything you need to run a successful telecom business, all in one powerful platform"
            />

            <FeatureGrid columns={3} gap="lg">
              <Feature
                icon={
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <FaShieldAlt size={24} />
                  </div>
                }
                title="Bank-Grade Security"
                description="Advanced encryption and security protocols protect your business data and customer transactions with 99.9% uptime guarantee."
                variant="centered"
              />
              <Feature
                icon={
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <FaClock size={24} />
                  </div>
                }
                title="Instant Processing"
                description="Lightning-fast transaction processing with real-time updates. Your customers receive airtime and data bundles within seconds."
                variant="centered"
              />
              <Feature
                icon={
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <FaChartLine size={24} />
                  </div>
                }
                title="Advanced Analytics"
                description="Comprehensive reporting and business intelligence tools to track performance, optimize operations, and drive growth."
                variant="centered"
              />
              <Feature
                icon={
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <FaUsers size={24} />
                  </div>
                }
                title="Multi-Agent Support"
                description="Scale your business with role-based access control. Manage multiple agents and track individual performance seamlessly."
                variant="centered"
              />
              <Feature
                icon={
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <FaWifi size={24} />
                  </div>
                }
                title="All Networks Supported"
                description="Complete integration with MTN, Vodafone, and AirtelTigo networks. One platform for all your telecom needs."
                variant="centered"
              />
              <Feature
                icon={
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <FaHeadset size={24} />
                  </div>
                }
                title="24/7 Expert Support"
                description="Round-the-clock customer support via phone, chat, and email. Our team is here to help your business succeed."
                variant="centered"
              />
            </FeatureGrid>

            {/* Additional feature highlights */}
            <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Built for Scale, Designed for Growth
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Whether you're a small business owner or managing a large network of agents, 
                    our platform scales with your needs. Start small and grow big with confidence.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center text-gray-700">
                      <FaCheck className="text-green-500 mr-3 flex-shrink-0" />
                      Unlimited transactions and users
                    </li>
                    <li className="flex items-center text-gray-700">
                      <FaCheck className="text-green-500 mr-3 flex-shrink-0" />
                      Real-time notifications and alerts
                    </li>
                    <li className="flex items-center text-gray-700">
                      <FaCheck className="text-green-500 mr-3 flex-shrink-0" />
                      Advanced reporting and analytics
                    </li>
                    <li className="flex items-center text-gray-700">
                      <FaCheck className="text-green-500 mr-3 flex-shrink-0" />
                      Mobile-first design for on-the-go management
                    </li>
                  </ul>
                </div>
                <div className="relative">
                  {/* Feature showcase mockup */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-2xl">
                    <div className="space-y-4">
                      {/* Mobile devices illustration */}
                      <div className="flex justify-center space-x-4">
                        <div className="w-20 h-32 bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center transform rotate-12">
                          <div className="w-16 h-28 bg-white rounded-xl p-2">
                            <div className="w-full h-2 bg-gray-200 rounded mb-2"></div>
                            <div className="space-y-1">
                              {[...Array(8)].map((_, i) => (
                                <div key={i} className="w-full h-1 bg-gray-200 rounded"></div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="w-20 h-32 bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center transform -rotate-12">
                          <div className="w-16 h-28 bg-white rounded-xl p-2">
                            <div className="w-full h-2 bg-blue-400 rounded mb-2"></div>
                            <div className="space-y-1">
                              {[...Array(8)].map((_, i) => (
                                <div key={i} className="w-full h-1 bg-gray-200 rounded"></div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-gray-700">Cross-Platform Access</div>
                        <div className="text-xs text-gray-600">Web, Mobile & Desktop</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Services Section */}
        <section id="services" className="py-20 bg-white">
          <Container>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Our Services
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Comprehensive telecom solutions for all your business needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* MTN Card */}
              <Card variant="outlined" className="hover:shadow-xl transition-all duration-300 border-t-4 border-yellow-500 group">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-2xl font-bold text-yellow-600">MTN</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">MTN Services</h3>
                </CardHeader>
                <CardBody className="text-center">
                  <p className="text-gray-600 mb-6">
                    Complete MTN airtime and data services with competitive rates and instant delivery.
                  </p>
                  <ul className="text-left space-y-2 mb-6">
                    <li className="flex items-center text-gray-700">
                      <FaCheck className="text-green-500 mr-2 flex-shrink-0" size={14} />
                      Airtime top-up
                    </li>
                    <li className="flex items-center text-gray-700">
                      <FaCheck className="text-green-500 mr-2 flex-shrink-0" size={14} />
                      Data bundles
                    </li>
                    <li className="flex items-center text-gray-700">
                      <FaCheck className="text-green-500 mr-2 flex-shrink-0" size={14} />
                      Bulk operations
                    </li>
                  </ul>
                  <Link to="/register">
                    <Button variant="primary" size="md" fullWidth colorScheme="warning">
                      Get Started
                    </Button>
                  </Link>
                </CardBody>
              </Card>

              {/* Vodafone Card */}
              <Card variant="outlined" className="hover:shadow-xl transition-all duration-300 border-t-4 border-red-500 group">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-2xl font-bold text-red-600">VF</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Vodafone Services</h3>
                </CardHeader>
                <CardBody className="text-center">
                  <p className="text-gray-600 mb-6">
                    Reliable Vodafone services with excellent coverage and fast processing.
                  </p>
                  <ul className="text-left space-y-2 mb-6">
                    <li className="flex items-center text-gray-700">
                      <FaCheck className="text-green-500 mr-2 flex-shrink-0" size={14} />
                      Airtime top-up
                    </li>
                    <li className="flex items-center text-gray-700">
                      <FaCheck className="text-green-500 mr-2 flex-shrink-0" size={14} />
                      Data bundles
                    </li>
                    <li className="flex items-center text-gray-700">
                      <FaCheck className="text-green-500 mr-2 flex-shrink-0" size={14} />
                      Bulk operations
                    </li>
                  </ul>
                  <Link to="/register">
                    <Button variant="primary" size="md" fullWidth colorScheme="error">
                      Get Started
                    </Button>
                  </Link>
                </CardBody>
              </Card>

              {/* AirtelTigo Card */}
              <Card variant="outlined" className="hover:shadow-xl transition-all duration-300 border-t-4 border-blue-500 group">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-lg font-bold text-blue-600">AT</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">AirtelTigo Services</h3>
                </CardHeader>
                <CardBody className="text-center">
                  <p className="text-gray-600 mb-6">
                    Comprehensive AirtelTigo solutions with competitive pricing and reliability.
                  </p>
                  <ul className="text-left space-y-2 mb-6">
                    <li className="flex items-center text-gray-700">
                      <FaCheck className="text-green-500 mr-2 flex-shrink-0" size={14} />
                      Airtime top-up
                    </li>
                    <li className="flex items-center text-gray-700">
                      <FaCheck className="text-green-500 mr-2 flex-shrink-0" size={14} />
                      Data bundles
                    </li>
                    <li className="flex items-center text-gray-700">
                      <FaCheck className="text-green-500 mr-2 flex-shrink-0" size={14} />
                      Bulk operations
                    </li>
                  </ul>
                  <Link to="/register">
                    <Button variant="primary" size="md" fullWidth>
                      Get Started
                    </Button>
                  </Link>
                </CardBody>
              </Card>
            </div>
          </Container>
        </section>

        {/* Enhanced Testimonials Section */}
        <section className="py-20 bg-white">
          <Container>
            <SectionHeader 
              title="Trusted by Businesses Across Ghana"
              subtitle="Join thousands of satisfied businesses using our platform to grow their telecom operations"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Testimonial
                content="TelecomSaaS has completely transformed our business operations. We've increased our revenue by 300% since switching to their platform. The ease of use and reliability is outstanding."
                author="Sarah Mensah"
                role="CEO"
                company="Mensah Telecom Solutions"
                avatar={<Avatar name="Sarah Mensah" />}
                rating={5}
                variant="card"
              />

              <Testimonial
                content="The platform is incredibly user-friendly and the customer support is outstanding. We can now manage all our network operations from one dashboard. Highly recommended!"
                author="Kwame Asante"
                role="Owner"
                company="Asante Mobile Services"
                avatar={<Avatar name="Kwame Asante" />}
                rating={5}
                variant="card"
              />

              <Testimonial
                content="Fast, reliable, and secure. Everything we need to run our telecom business efficiently in one place. The analytics help us make better business decisions every day."
                author="Ama Osei"
                role="Manager"
                company="Osei Communications"
                avatar={<Avatar name="Ama Osei" />}
                rating={5}
                variant="card"
              />
            </div>

            {/* Customer logos section */}
            <div className="mt-16 pt-12 border-t border-gray-200">
              <div className="text-center mb-8">
                <p className="text-lg font-semibold text-gray-600">Trusted by leading businesses</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
                {/* Logo placeholders - in a real app, these would be actual customer logos */}
                {['TechCorp', 'ConnectPlus', 'MobilePro', 'DataLink'].map((company, i) => (
                  <div key={i} className="text-center">
                    <div className="w-24 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <span className="text-gray-500 font-bold text-sm">{company}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* Enhanced CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>
          
          <Container centerContent>
            <div className="text-center text-white max-w-4xl relative z-10">
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                Ready to Transform Your Business?
              </h2>
              <p className="text-xl mb-8 text-blue-100 leading-relaxed">
                Join thousands of businesses already using our platform to scale their telecom operations. 
                Start your free trial today and see the difference in just minutes.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
                <Link to="/register">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="bg-white text-blue-600 hover:bg-gray-100 shadow-xl transform hover:scale-105 transition-all duration-200"
                    rightIcon={<FaArrowRight />}
                  >
                    Start Free Trial - No Credit Card Required
                  </Button>
                </Link>
                <Link to="#contact">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-200"
                  >
                    Schedule a Demo
                  </Button>
                </Link>
              </div>

              {/* Trust indicators for CTA */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-white/20">
                <div className="flex items-center justify-center text-blue-100">
                  <FaCheck className="mr-2 text-green-300" />
                  <span>Free 14-day trial</span>
                </div>
                <div className="flex items-center justify-center text-blue-100">
                  <FaCheck className="mr-2 text-green-300" />
                  <span>No setup fees</span>
                </div>
                <div className="flex items-center justify-center text-blue-100">
                  <FaCheck className="mr-2 text-green-300" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                  <FaPhoneAlt className="text-white text-xl" />
                </div>
                <span className="text-xl font-bold">TelecomSaaS</span>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Empowering telecom businesses across Ghana with innovative SaaS solutions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link to="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="#services" className="hover:text-white transition-colors">Services</Link></li>
                <li><Link to="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="#api" className="hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link to="#help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="#contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="#status" className="hover:text-white transition-colors">System Status</Link></li>
                <li><Link to="#community" className="hover:text-white transition-colors">Community</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link to="#about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="#careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link to="#privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="#terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 TelecomSaaS. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 sm:mt-0">
              <Link to="#facebook" className="text-gray-400 hover:text-white transition-colors">
                Facebook
              </Link>
              <Link to="#twitter" className="text-gray-400 hover:text-white transition-colors">
                Twitter
              </Link>
              <Link to="#linkedin" className="text-gray-400 hover:text-white transition-colors">
                LinkedIn
              </Link>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
};
