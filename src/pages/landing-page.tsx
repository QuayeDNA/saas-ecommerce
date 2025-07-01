import { useState, useEffect } from "react";
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
  Headphones,
  Star,
  Globe,
  Zap,
  BarChart3,
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

  const testimonials = [
    {
      name: "Sarah Mensah",
      role: "CEO, Mensah Telecom",
      content:
        "TelecomSaaS transformed our operations. 300% revenue increase in just 6 months.",
      rating: 5,
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b1c2?w=150&h=150&fit=crop&crop=face",
    },
    {
      name: "Kwame Asante",
      role: "Owner, Mobile Services",
      content:
        "Incredibly user-friendly with outstanding support. Everything in one dashboard.",
      rating: 5,
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
    {
      name: "Ama Osei",
      role: "Manager, Communications",
      content:
        "Fast, reliable, secure. The analytics help us make better decisions daily.",
      rating: 5,
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
  ];

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Bank-Grade Security",
      description:
        "Advanced encryption protecting your data with 99.9% uptime guarantee.",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Processing",
      description:
        "Lightning-fast transactions with real-time updates in seconds.",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Smart Analytics",
      description:
        "Comprehensive insights to optimize operations and drive growth.",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Multi-Agent Support",
      description:
        "Scale with role-based access and individual performance tracking.",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "All Networks",
      description: "Complete integration with MTN, Vodafone, and AirtelTigo.",
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: "24/7 Support",
      description:
        "Round-the-clock expert assistance via phone, chat, and email.",
    },
  ];

  const networks = [
    {
      name: "MTN",
      color: "from-yellow-400 to-yellow-600",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
    },
    {
      name: "Vodafone",
      color: "from-red-400 to-red-600",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
    },
    {
      name: "AirtelTigo",
      color: "from-blue-400 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center">
                <Phone className="text-white w-5 h-5" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                TelecomSaaS
              </span>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-indigo-600 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
              >
                Features
              </a>
              <a
                href="#services"
                className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
              >
                Services
              </a>
              <a
                href="#testimonials"
                className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
              >
                Reviews
              </a>
              <div className="flex items-center space-x-4">
                <button className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">
                  Sign In
                </button>
                <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium">
                  Get Started
                </button>
              </div>
            </div>
          </nav>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100 bg-white/95 backdrop-blur-md rounded-b-2xl">
              <div className="flex flex-col space-y-4">
                <a
                  href="#features"
                  className="text-gray-600 hover:text-indigo-600 transition-colors py-2 font-medium"
                >
                  Features
                </a>
                <a
                  href="#services"
                  className="text-gray-600 hover:text-indigo-600 transition-colors py-2 font-medium"
                >
                  Services
                </a>
                <a
                  href="#testimonials"
                  className="text-gray-600 hover:text-indigo-600 transition-colors py-2 font-medium"
                >
                  Reviews
                </a>
                <div className="flex flex-col space-y-3 pt-4 border-t border-gray-100">
                  <button className="text-gray-600 hover:text-indigo-600 transition-colors py-2 font-medium text-left">
                    Sign In
                  </button>
                  <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-medium">
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234f46e5' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-sm font-medium mb-8">
                <Zap className="w-4 h-4 mr-2" />
                Trusted by 1000+ businesses
              </div>

              <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
                Transform Your
                <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Telecom Business
                </span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed mb-12 max-w-2xl">
                Streamline airtime and data distribution across all major
                networks. Manage sales, track performance, and scale your
                business effortlessly.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 mb-16">
                <button className="group bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-semibold text-lg flex items-center">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="group flex items-center text-gray-600 hover:text-indigo-600 transition-colors font-semibold">
                  <div className="bg-white shadow-lg rounded-full p-3 mr-4 group-hover:shadow-xl transition-all">
                    <Play className="w-5 h-5 ml-1" />
                  </div>
                  Watch Demo
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                {[
                  { value: "1000+", label: "Active Agents" },
                  { value: "₵2M+", label: "Monthly Volume" },
                  { value: "99.9%", label: "Uptime" },
                  { value: "24/7", label: "Support" },
                ].map((stat, index) => (
                  <div key={index} className="text-center lg:text-left">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-gray-600 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Hero Image */}
            <div className="relative">
              <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-500">
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop"
                  alt="Modern Dashboard Interface"
                  className="w-full h-92 object-cover"
                />

                {/* Dashboard Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>

                {/* Dashboard Content */}
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <Phone className="w-5 h-5" />
                      </div>
                      <span className="font-bold">Dashboard</span>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                      <div className="text-2xl font-bold">₵45,250</div>
                      <div className="text-white/80 text-sm">Total Sales</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                      <div className="text-2xl font-bold">1,247</div>
                      <div className="text-white/80 text-sm">Transactions</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center text-white animate-bounce shadow-xl">
                <Smartphone className="w-8 h-8" />
              </div>
              <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center text-white animate-pulse shadow-xl">
                <Wifi className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to run a successful telecom business, designed
              with simplicity and power in mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white border border-gray-100 rounded-3xl p-8 hover:shadow-2xl hover:border-indigo-100 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Additional Feature Highlight */}
          <div className="mt-24 grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Built for Scale, Designed for Growth
              </h3>
              <p className="text-xl text-gray-600 mb-8">
                Whether you're a small business or managing a large network, our
                platform scales with your ambitions.
              </p>
              <div className="space-y-4">
                {[
                  "Unlimited transactions and users",
                  "Real-time notifications and alerts",
                  "Advanced reporting and analytics",
                  "Mobile-first design for anywhere access",
                ].map((item, index) => (
                  <div key={index} className="flex items-center">
                    <Check className="text-green-500 w-6 h-6 mr-4 flex-shrink-0" />
                    <span className="text-gray-700 text-lg">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop"
                alt="Business Growth Analytics"
                className="rounded-3xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-6 shadow-xl">
                <TrendingUp className="w-8 h-8 text-green-500 mb-2" />
                <div className="text-2xl font-bold text-gray-900">300%</div>
                <div className="text-gray-600 text-sm">Growth Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section
        id="services"
        className="py-32 bg-gradient-to-br from-gray-50 to-indigo-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              All Networks, One Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive telecom solutions for all major networks in Ghana.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {networks.map((network, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-indigo-100"
              >
                <div
                  className={`w-20 h-20 bg-gradient-to-br ${network.color} rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <span className="text-2xl font-bold text-white">
                    {network.name.slice(0, 2)}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
                  {network.name} Services
                </h3>
                <p className="text-gray-600 text-center mb-8">
                  Complete {network.name} solutions with competitive rates and
                  instant delivery.
                </p>
                <div className="space-y-3 mb-8">
                  {["Airtime top-up", "Data bundles", "Bulk operations"].map(
                    (service, idx) => (
                      <div key={idx} className="flex items-center">
                        <Check className="text-green-500 w-5 h-5 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{service}</span>
                      </div>
                    )
                  )}
                </div>
                <button
                  className={`w-full bg-gradient-to-r ${network.color} text-white py-4 rounded-2xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Trusted by Businesses
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of satisfied businesses across Ghana using our
              platform to grow their operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white border border-gray-100 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-8">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-bold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <img
          src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=1920&h=1080&fit=crop"
          alt="Team collaboration"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl lg:text-6xl font-bold text-white mb-8">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-indigo-100 mb-12 leading-relaxed">
            Join thousands of businesses using our platform to scale their
            telecom operations. Start your free trial today and see results in
            minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
            <button className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center">
              Start Free Trial - No Credit Card Required
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-indigo-600 transition-all duration-300">
              Schedule a Demo
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-white/20">
            {["Free 14-day trial", "No setup fees", "Cancel anytime"].map(
              (item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center text-indigo-100"
                >
                  <Check className="mr-3 text-green-300 w-5 h-5" />
                  <span className="font-medium">{item}</span>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Phone className="text-white w-5 h-5" />
                </div>
                <span className="text-2xl font-bold">TelecomSaaS</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Empowering telecom businesses across Ghana with innovative SaaS
                solutions.
              </p>
            </div>

            {[
              {
                title: "Product",
                links: [
                  { label: "Features", path: "/features" },
                  { label: "Services", path: "/services" },
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
                      <a
                        href={link.path}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
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
              {["Facebook", "Twitter", "LinkedIn"].map((social, index) => (
                <a
                  key={index}
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
