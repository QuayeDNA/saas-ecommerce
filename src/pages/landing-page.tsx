import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button, Card, CardBody, Container, Section, SectionHeader } from "../design-system";
import {
  Phone,
  Wifi,
  Shield,
  Users,
  TrendingUp,
  Menu,
  X,
  ArrowRight,
  Check,
  Play,
  Smartphone,
  Star,
  Globe,
  Zap,
  BarChart3,
  Wallet,
  ShoppingCart,
  Bell,
  Upload,
  RefreshCw,
  MessageSquare,
} from "lucide-react";

export const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Real providers from the app
  const providers = [
    {
      name: "MTN",
      code: "MTN",
      color: "from-yellow-400 to-yellow-600",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
      description: "Complete MTN airtime and data solutions with competitive rates.",
    },
    {
      name: "TELECEL",
      code: "TELECEL",
      color: "from-red-400 to-red-600",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
      description: "Reliable TELECEL services with instant delivery.",
    },
    {
      name: "AT BIG TIME",
      code: "AT-BIG-TIME",
      color: "from-blue-400 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      description: "AT BIG TIME packages for all your data needs.",
    },
    {
      name: "AT iShare Premium",
      code: "AT-ISHARE-PREMIUM",
      color: "from-purple-400 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      description: "Premium AT iShare packages with exclusive benefits.",
    },
  ];

  // Real features from the app
  const features = [
    {
      icon: <Wallet className="w-8 h-8" />,
      title: "Real-Time Wallet Management",
      description: "Live wallet balance updates with WebSocket connection and polling fallback for reliable balance tracking.",
    },
    {
      icon: <ShoppingCart className="w-8 h-8" />,
      title: "Bulk Order Processing",
      description: "Process multiple orders simultaneously with our advanced bulk order management system.",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Advanced Analytics",
      description: "Comprehensive dashboard with transaction trends, order analytics, and performance metrics.",
    },
    {
      icon: <Bell className="w-8 h-8" />,
      title: "Smart Notifications",
      description: "Real-time notifications for order updates, wallet changes, and system alerts.",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Multi-Agent Support",
      description: "Role-based access control with individual performance tracking for agents and super admins.",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Transactions",
      description: "Bank-grade security with encrypted transactions and secure payment processing.",
    },
  ];

  // Real testimonials based on app features
  const testimonials = [
    {
      name: "Kwame Asante",
      role: "Telecom Agent, Accra",
      content: "The real-time wallet updates are incredible. I can see my balance change instantly when orders are processed.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
    {
      name: "Sarah Mensah",
      role: "Business Owner, Kumasi",
      content: "The bulk order feature saves me hours every day. Processing multiple orders at once is a game-changer.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b1c2?w=150&h=150&fit=crop&crop=face",
    },
    {
      name: "Ama Osei",
      role: "Super Admin, Tema",
      content: "The analytics dashboard helps me make data-driven decisions. The charts and reports are comprehensive.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
  ];

  // Real stats from the app
  const stats = [
    { value: "4", label: "Network Providers", icon: <Globe className="w-6 h-6" /> },
    { value: "Real-time", label: "Wallet Updates", icon: <RefreshCw className="w-6 h-6" /> },
    { value: "Bulk", label: "Order Processing", icon: <Upload className="w-6 h-6" /> },
    { value: "24/7", label: "Support Available", icon: <MessageSquare className="w-6 h-6" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg"
            : "bg-transparent"
        }`}
      >
        <Container>
          <nav className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <Phone className="text-white w-5 h-5" />
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                TelecomSaaS
              </span>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <a
                href="#features"
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium text-sm lg:text-base"
              >
                Features
              </a>
              <a
                href="#providers"
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium text-sm lg:text-base"
              >
                Providers
              </a>
              <a
                href="#testimonials"
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium text-sm lg:text-base"
              >
                Reviews
              </a>
              <div className="flex items-center space-x-3 lg:space-x-4">
                <Link to="/login" className="text-gray-600 hover:text-blue-600 transition-colors font-medium text-sm lg:text-base">
                  Sign In
                </Link>
                <Link to="/register">
                  <Button size="sm" className="text-sm lg:text-base">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </nav>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100 bg-white/95 backdrop-blur-md rounded-b-xl">
              <div className="flex flex-col space-y-4">
                <a
                  href="#features"
                  className="text-gray-600 hover:text-blue-600 transition-colors py-2 font-medium"
                >
                  Features
                </a>
                <a
                  href="#providers"
                  className="text-gray-600 hover:text-blue-600 transition-colors py-2 font-medium"
                >
                  Providers
                </a>
                <a
                  href="#testimonials"
                  className="text-gray-600 hover:text-blue-600 transition-colors py-2 font-medium"
                >
                  Reviews
                </a>
                <div className="pt-2 border-t border-gray-100">
                  <Link to="/login" className="block text-gray-600 hover:text-blue-600 transition-colors font-medium py-2">
                    Sign In
                  </Link>
                  <Link to="/register" className="block">
                    <Button size="sm" fullWidth>
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </Container>
      </header>

      {/* Hero Section */}
      <Section className="pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pt-32 lg:pb-24">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-6 sm:mb-8">
                <Zap className="w-4 h-4 mr-2" />
                Real-time wallet updates
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
                Transform Your
                <span className="block bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 bg-clip-text text-transparent">
                  Telecom Business
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-8 sm:mb-12 max-w-2xl mx-auto lg:mx-0">
                Streamline airtime and data distribution across MTN, TELECEL, AT BIG TIME, and AT iShare Premium. 
                Manage sales, track performance, and scale your business with real-time updates.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6 mb-12 sm:mb-16">
                <Link to="/register">
                  <Button size="lg" className="text-base sm:text-lg">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <a href="#" className="group flex items-center text-gray-600 hover:text-blue-600 transition-colors font-semibold">
                  <div className="bg-white shadow-lg rounded-full p-3 mr-4 group-hover:shadow-xl transition-all">
                    <Play className="w-5 h-5 ml-1" />
                  </div>
                  Watch Demo
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start mb-2">
                      <div className="text-blue-600 mr-2">{stat.icon}</div>
                      <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {stat.value}
                      </div>
                    </div>
                    <div className="text-gray-600 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Hero Image */}
            <div className="relative">
              <Card className="relative overflow-hidden transform hover:scale-105 transition-transform duration-500">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop"
                    alt="Modern Dashboard Interface"
                    className="w-full h-64 sm:h-80 object-cover"
                  />

                  {/* Dashboard Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>

                  {/* Dashboard Content */}
                  <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <span className="font-bold text-sm sm:text-base">Dashboard</span>
                      </div>
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-400 rounded-full"></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                        <div className="text-lg sm:text-2xl font-bold">₵45,250</div>
                        <div className="text-white/80 text-xs sm:text-sm">Wallet Balance</div>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                        <div className="text-lg sm:text-2xl font-bold">1,247</div>
                        <div className="text-white/80 text-xs sm:text-sm">Transactions</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center text-white animate-bounce shadow-xl">
                <Smartphone className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center text-white animate-pulse shadow-xl">
                <Wifi className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Features Section */}
      <Section id="features" className="py-16 sm:py-20 lg:py-24 bg-white">
        <Container>
          <SectionHeader 
            title="Why Choose Our Platform?"
            subtitle="Everything you need to run a successful telecom business, designed with simplicity and power in mind."
            className="mb-12 sm:mb-16 lg:mb-20"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                variant="interactive"
                className="group hover:shadow-xl transition-all duration-300"
              >
                <CardBody className="p-6 sm:p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Additional Feature Highlight */}
          <div className="mt-20 lg:mt-24 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Built for Scale, Designed for Growth
              </h3>
              <p className="text-lg sm:text-xl text-gray-600 mb-8">
                Whether you're a small business or managing a large network, our platform scales with your ambitions.
              </p>
              <div className="space-y-4">
                {[
                  "Real-time wallet balance updates",
                  "Bulk order processing capabilities",
                  "Advanced analytics and reporting",
                  "Mobile-first responsive design",
                  "Multi-agent role management",
                  "Secure payment processing",
                ].map((item, index) => (
                  <div key={index} className="flex items-center">
                    <Check className="text-green-500 w-5 h-5 sm:w-6 sm:h-6 mr-4 flex-shrink-0" />
                    <span className="text-gray-700 text-base sm:text-lg">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop"
                alt="Business Growth Analytics"
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl p-4 sm:p-6 shadow-xl">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 mb-2" />
                <div className="text-xl sm:text-2xl font-bold text-gray-900">300%</div>
                <div className="text-gray-600 text-sm">Growth Rate</div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Providers Section */}
      <Section
        id="providers"
        className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-gray-50 to-blue-50"
      >
        <Container>
          <SectionHeader 
            title="All Networks, One Platform"
            subtitle="Comprehensive telecom solutions for all major networks in Ghana."
            className="mb-12 sm:mb-16 lg:mb-20"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {providers.map((provider, index) => (
              <Card
                key={index}
                variant="interactive"
                className="group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-100"
              >
                <CardBody className="p-6 sm:p-8 text-center">
                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${provider.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <span className="text-xl sm:text-2xl font-bold text-white">
                      {provider.name.slice(0, 2)}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-4">
                    {provider.name}
                  </h3>
                  <p className="text-gray-600 text-center mb-6 sm:mb-8">
                    {provider.description}
                  </p>
                  <div className="space-y-3 mb-6 sm:mb-8">
                    {["Airtime top-up", "Data bundles", "Bulk operations"].map(
                      (service, idx) => (
                        <div key={idx} className="flex items-center justify-center">
                          <Check className="text-green-500 w-4 h-4 sm:w-5 sm:h-5 mr-3 flex-shrink-0" />
                          <span className="text-gray-700 text-sm sm:text-base">{service}</span>
                        </div>
                      )
                    )}
                  </div>
                  <Link to="/register">
                    <Button
                      size="sm"
                      className={`w-full bg-gradient-to-r ${provider.color} text-white hover:shadow-lg hover:scale-105 transition-all duration-200`}
                    >
                      Get Started
                    </Button>
                  </Link>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Testimonials Section */}
      <Section id="testimonials" className="py-16 sm:py-20 lg:py-24 bg-white">
        <Container>
          <SectionHeader 
            title="Trusted by Businesses"
            subtitle="Join thousands of satisfied businesses across Ghana using our platform to grow their operations."
            className="mb-12 sm:mb-16 lg:mb-20"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                variant="interactive"
                className="hover:shadow-xl transition-all duration-300"
              >
                <CardBody className="p-6 sm:p-8">
                  <div className="flex items-center mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-6 sm:mb-8 text-sm sm:text-base">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mr-4"
                    />
                    <div>
                      <div className="font-bold text-gray-900 text-sm sm:text-base">
                        {testimonial.name}
                      </div>
                      <div className="text-gray-600 text-xs sm:text-sm">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <img
          src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=1920&h=1080&fit=crop"
          alt="Team collaboration"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />

        <Container className="relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 sm:mb-8">
              Ready to Transform Your Business?
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 mb-8 sm:mb-12 leading-relaxed">
              Join thousands of businesses using our platform to scale their telecom operations. 
              Start your free trial today and see results in minutes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-12 sm:mb-16">
              <Link to="/register">
                <Button size="lg" variant="secondary" className="text-base sm:text-lg">
                  Start Free Trial - No Credit Card Required
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-base sm:text-lg border-white text-white hover:bg-white hover:text-blue-600">
                Schedule a Demo
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 pt-8 border-t border-white/20">
              {["Free 14-day trial", "No setup fees", "Cancel anytime"].map(
                (item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-center text-blue-100"
                  >
                    <Check className="mr-3 text-green-300 w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-medium text-sm sm:text-base">{item}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </Container>
      </Section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 sm:py-16">
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Phone className="text-white w-5 h-5" />
                </div>
                <span className="text-xl sm:text-2xl font-bold">TelecomSaaS</span>
              </div>
              <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
                Empowering telecom businesses across Ghana with innovative SaaS solutions.
              </p>
            </div>

            {[
              {
                title: "Product",
                links: [
                  { label: "Features", path: "#features" },
                  { label: "Providers", path: "#providers" },
                  { label: "Pricing", path: "/pricing" },
                  { label: "API", path: "/api" },
                ],
              },
              {
                title: "Support",
                links: [
                  { label: "Help Center", path: "/support" },
                  { label: "Contact Us", path: "/contact" },
                  { label: "System Status", path: "/status" },
                  { label: "Community", path: "/community" },
                ],
              },
              {
                title: "Company",
                links: [
                  { label: "About Us", path: "/about" },
                  { label: "Careers", path: "/careers" },
                  { label: "Privacy Policy", path: "/privacy-policy" },
                  { label: "Terms of Service", path: "/terms" },
                ],
              },
            ].map((section, index) => (
              <div key={index}>
                <h4 className="font-bold mb-6 text-lg">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      {link.path.startsWith("/") ? (
                        <Link
                          to={link.path}
                          className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          href={link.path}
                          className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 TelecomSaaS. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 sm:mt-0">
              {[
                { label: "Facebook", url: "#" },
                { label: "Twitter", url: "#" },
                { label: "LinkedIn", url: "#" },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
};
