import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  Container,
  Section,
  SectionHeader,
} from "../design-system";
import { landingPageData } from "../data/landing-page-data";
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
  Activity,
  DollarSign,
  Package,
  Linkedin,
  Twitter,
  Facebook,
  Youtube,
  ChevronDown,
  Sparkles,
  Target,
  Award,
  Clock,
  Layers,
} from "lucide-react";

const iconMap = {
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
  Activity,
  DollarSign,
  Package,
  Linkedin,
  Twitter,
  Facebook,
  Youtube,
  ChevronDown,
  Sparkles,
  Target,
  Award,
  Clock,
  Layers,
};

export const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const providersRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Update active section based on scroll position
      const sections = [
        { id: "hero", ref: heroRef },
        { id: "features", ref: featuresRef },
        { id: "providers", ref: providersRef },
        { id: "testimonials", ref: testimonialsRef },
      ];

      const current = sections.find((section) => {
        if (section.ref.current) {
          const rect = section.ref.current.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });

      if (current) {
        setActiveSection(current.id);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  const getIcon = (iconName: string) => {
    return iconMap[iconName as keyof typeof iconMap] || Star;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-xl shadow-2xl border-b border-gray-100"
            : "bg-transparent"
        }`}
      >
        <Container>
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                <Phone className="text-white w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 bg-clip-text text-transparent">
                  TelecomSaaS
                </span>
                <div className="text-xs text-gray-500 -mt-1">by AmaliTech</div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {[
                { id: "features", label: "Features" },
                { id: "providers", label: "Networks" },
                { id: "testimonials", label: "Reviews" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-sm font-medium transition-all duration-300 hover:text-blue-600 ${
                    activeSection === item.id
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-blue-600 transition-colors font-medium text-sm"
                >
                  Sign In
                </Link>
                <Link to="/register">
                  <Button
                    size="sm"
                    className="text-sm shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100 bg-white/95 backdrop-blur-xl rounded-b-2xl shadow-xl">
              <div className="flex flex-col space-y-4">
                {[
                  { id: "features", label: "Features" },
                  { id: "providers", label: "Networks" },
                  { id: "testimonials", label: "Reviews" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="text-gray-600 hover:text-blue-600 transition-colors py-2 font-medium text-left"
                  >
                    {item.label}
                  </button>
                ))}
                <div className="pt-2 border-t border-gray-100">
                  <Link
                    to="/login"
                    className="block text-gray-600 hover:text-blue-600 transition-colors font-medium py-2"
                  >
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
      </nav>

      {/* Hero Section */}
      <Section
        id="hero"
        ref={heroRef}
        className="pt-24 pb-16 sm:pt-32 sm:pb-20 lg:pt-40 lg:pb-24 relative overflow-hidden"
      >
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-teal-50"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-500"></div>

        <Container className="relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-teal-100 text-blue-700 px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg">
                <Sparkles className="w-4 h-4 mr-2" />
                {landingPageData.hero.subtitle}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-8">
                {landingPageData.hero.title
                  .split(" ")
                  .map((word, wordIndex) => (
                    <span
                      key={wordIndex}
                      className={wordIndex === 2 ? "block" : ""}
                    >
                      {word}{" "}
                    </span>
                  ))}
              </h1>

              <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed mb-12 max-w-3xl mx-auto lg:mx-0">
                {landingPageData.hero.description}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 mb-16">
                <Link to="/register">
                  <Button
                    size="lg"
                    className="text-lg px-8 py-4 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
                  >
                    {landingPageData.hero.cta.primary}
                    <ArrowRight className="ml-3 w-6 h-6" />
                  </Button>
                </Link>
                <button
                  onClick={() => scrollToSection("features")}
                  className="group flex items-center text-gray-600 hover:text-blue-600 transition-colors font-semibold text-lg"
                >
                  <div className="bg-white shadow-xl rounded-full p-4 mr-4 group-hover:shadow-2xl transition-all duration-300">
                    <Play className="w-6 h-6 ml-1" />
                  </div>
                  {landingPageData.hero.cta.secondary}
                </button>
              </div>

              {/* Hero Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {landingPageData.hero.stats.map((stat) => {
                  const IconComponent = getIcon(stat.icon);
                  return (
                    <div
                      key={stat.id}
                      className="text-center lg:text-left group"
                    >
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                        <div className="flex items-center justify-center lg:justify-start mb-3">
                          <div className="text-blue-600 mr-3 group-hover:scale-110 transition-transform duration-300">
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <div className="text-3xl font-bold text-gray-900">
                            {stat.value}
                          </div>
                        </div>
                        <div className="text-gray-600 text-sm font-medium">
                          {stat.label}
                        </div>
                        {stat.trend && (
                          <div
                            className={`text-xs mt-2 flex items-center justify-center lg:justify-start ${
                              stat.trend.direction === "up"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {stat.trend.value}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column - Interactive Dashboard */}
            <div className="relative">
              <Card className="relative overflow-hidden transform hover:scale-105 transition-all duration-500 shadow-2xl">
                <div className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-8">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-bold text-lg">
                          Dashboard
                        </div>
                        <div className="text-gray-400 text-sm">
                          Real-time Analytics
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-lg"></div>
                      <div className="w-3 h-3 bg-red-400 rounded-full shadow-lg"></div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                      <div className="text-3xl font-bold text-white mb-2">
                        ₵247,850
                      </div>
                      <div className="text-gray-300 text-sm flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2 text-green-400" />
                        Wallet Balance
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                      <div className="text-3xl font-bold text-white mb-2">
                        1,247
                      </div>
                      <div className="text-gray-300 text-sm flex items-center">
                        <Activity className="w-4 h-4 mr-2 text-blue-400" />
                        Transactions
                      </div>
                    </div>
                  </div>

                  {/* Network Status */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-white font-semibold">
                        Network Status
                      </span>
                      <div className="flex space-x-2">
                        {["MTN", "TELECEL", "AT"].map((network, idx) => (
                          <div key={network} className="flex items-center">
                            <div
                              className={`w-2 h-2 rounded-full mr-2 ${
                                idx === 0
                                  ? "bg-green-400"
                                  : idx === 1
                                  ? "bg-yellow-400"
                                  : "bg-red-400"
                              } animate-pulse`}
                            ></div>
                            <span className="text-gray-300 text-xs">
                              {network}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-green-400 text-sm font-medium">
                      All systems operational
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-teal-400 to-blue-500 rounded-3xl flex items-center justify-center text-white shadow-2xl animate-bounce">
                  <Zap className="w-8 h-8" />
                </div>
                <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl flex items-center justify-center text-white shadow-2xl animate-pulse">
                  <RefreshCw className="w-6 h-6" />
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      {/* Features Section */}
      <Section
        id="features"
        ref={featuresRef}
        className="py-20 lg:py-32 bg-white"
      >
        <Container>
          <SectionHeader
            title="Powerful Features for Modern Telecom Business"
            subtitle="Everything you need to scale your operations, optimize performance, and maximize profits."
            className="mb-16 lg:mb-20"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {landingPageData.features.map((feature) => {
              const IconComponent = getIcon(feature.icon);
              return (
                <Card
                  key={feature.id}
                  variant="interactive"
                  className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white to-gray-50 hover:from-blue-50 hover:to-teal-50"
                >
                  <CardBody className="p-8 lg:p-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-6 text-lg">
                      {feature.description}
                    </p>
                    {feature.metrics && (
                      <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-4 border border-blue-100">
                        <div className="text-2xl font-bold text-blue-600">
                          {feature.metrics.value}
                        </div>
                        <div className="text-sm text-gray-600">
                          {feature.metrics.label}
                        </div>
                      </div>
                    )}
                  </CardBody>
                </Card>
              );
            })}
          </div>

          {/* Feature Showcase */}
          <div className="mt-24 lg:mt-32 grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <div>
              <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Built for Scale, Designed for Growth
              </h3>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Whether you're a startup or enterprise, our platform grows with
                your ambitions.
              </p>
              <div className="space-y-6">
                {[
                  { icon: "Zap", text: "Sub-2 second API response times" },
                  { icon: "Shield", text: "Bank-grade security & compliance" },
                  { icon: "Users", text: "Multi-agent role management" },
                  { icon: "BarChart3", text: "Advanced analytics & reporting" },
                  {
                    icon: "RefreshCw",
                    text: "Real-time wallet synchronization",
                  },
                  { icon: "Target", text: "Predictive performance insights" },
                ].map((item, itemIndex) => {
                  const IconComponent = getIcon(item.icon);
                  return (
                    <div key={itemIndex} className="flex items-start">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center text-white mr-6 flex-shrink-0 shadow-lg">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900 mb-1">
                          {item.text}
                        </div>
                        <div className="text-gray-600">
                          Optimized for performance and reliability
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-teal-600 rounded-3xl p-8 lg:p-12 text-white shadow-2xl">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">300%</div>
                    <div className="text-blue-100">Growth Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">50K+</div>
                    <div className="text-blue-100">Transactions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">99.9%</div>
                    <div className="text-blue-100">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">24/7</div>
                    <div className="text-blue-100">Support</div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-6 shadow-2xl">
                <Award className="w-8 h-8 text-yellow-500 mb-2" />
                <div className="text-xl font-bold text-gray-900">
                  #1 Platform
                </div>
                <div className="text-gray-600 text-sm">Ghana Telecom SaaS</div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Providers Section */}
      <Section
        id="providers"
        ref={providersRef}
        className="py-20 lg:py-32 bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50"
      >
        <Container>
          <SectionHeader
            title="Complete Network Coverage"
            subtitle="Seamless integration with all major Ghanaian telecom networks."
            className="mb-16 lg:mb-20"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {landingPageData.providers.map((provider) => {
              const IconComponent = getIcon(provider.icon);
              return (
                <Card
                  key={provider.id}
                  variant="interactive"
                  className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white hover:bg-gradient-to-br hover:from-white hover:to-blue-50"
                >
                  <CardBody className="p-8 lg:p-10">
                    <div className="flex items-start justify-between mb-6">
                      <div
                        className={`w-16 h-16 bg-gradient-to-br ${provider.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <IconComponent className="w-8 h-8" />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {provider.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {provider.code}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                      {provider.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      {provider.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center">
                          <Check className="text-green-500 w-5 h-5 mr-3 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Link to="/register">
                      <Button
                        size="sm"
                        className={`w-full bg-gradient-to-r ${provider.color} text-white hover:shadow-xl hover:scale-105 transition-all duration-300 border-0`}
                      >
                        Get Started with {provider.name}
                      </Button>
                    </Link>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Testimonials Section */}
      <Section
        id="testimonials"
        ref={testimonialsRef}
        className="py-20 lg:py-32 bg-white"
      >
        <Container>
          <SectionHeader
            title="Trusted by Industry Leaders"
            subtitle="Join thousands of successful businesses using our platform to transform their operations."
            className="mb-16 lg:mb-20"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {landingPageData.testimonials.map((testimonial) => (
              <Card
                key={testimonial.id}
                variant="interactive"
                className="hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white to-gray-50"
              >
                <CardBody className="p-8 lg:p-10">
                  <div className="flex items-center mb-6">
                    {[...Array(testimonial.rating)].map((_, starIndex) => (
                      <Star
                        key={starIndex}
                        className="w-5 h-5 text-yellow-400 fill-current mr-1"
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-8 text-lg italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-14 h-14 rounded-full mr-6 border-4 border-blue-100"
                    />
                    <div>
                      <div className="font-bold text-gray-900 text-lg">
                        {testimonial.name}
                      </div>
                      <div className="text-blue-600 font-semibold">
                        {testimonial.role}
                      </div>
                      <div className="text-gray-500 text-sm">
                        {testimonial.company}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {testimonial.location}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Stats Section */}
          <div className="mt-20 lg:mt-24 bg-gradient-to-r from-blue-600 via-blue-700 to-teal-600 rounded-3xl p-8 lg:p-12 text-white">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">
                Trusted by the Industry
              </h3>
              <p className="text-xl text-blue-100">
                Real results from real businesses
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {landingPageData.stats.map((stat) => {
                const IconComponent = getIcon(stat.icon);
                return (
                  <div key={stat.id} className="text-center group">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <div className="text-4xl font-bold mb-2">{stat.value}</div>
                    <div className="text-blue-100 mb-2">{stat.label}</div>
                    {stat.trend && (
                      <div className="text-green-300 text-sm flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        {stat.trend.value}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section className="py-20 lg:py-32 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"></div>

        <Container className="relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-semibold mb-8 border border-white/20">
              <Clock className="w-4 h-4 mr-2" />
              Limited Time: Free Setup & Training
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
              Ready to Transform Your{" "}
              <span className="block bg-gradient-to-r from-blue-400 via-teal-400 to-green-400 bg-clip-text text-transparent">
                Telecom Business?
              </span>
            </h2>

            <p className="text-xl sm:text-2xl text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto">
              Join the leading telecom businesses in Ghana. Start your free
              trial today and experience the power of intelligent telecom
              management.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
              <Link to="/register">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-xl px-10 py-5 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
                >
                  Start Free Trial - No Card Required
                  <ArrowRight className="ml-3 w-6 h-6" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="text-xl px-10 py-5 border-2 border-white text-white hover:bg-white hover:text-gray-900 transition-all duration-300"
              >
                Schedule Demo
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12 border-t border-white/20">
              {[
                { icon: "Shield", text: "14-day free trial" },
                { icon: "Zap", text: "No setup fees" },
                { icon: "RefreshCw", text: "Cancel anytime" },
              ].map((item, itemIndex) => {
                const IconComponent = getIcon(item.icon);
                return (
                  <div
                    key={itemIndex}
                    className="flex items-center justify-center text-white group"
                  >
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="font-semibold text-lg">{item.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </Section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 lg:py-20">
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-teal-600 rounded-2xl flex items-center justify-center">
                  <Phone className="text-white w-6 h-6" />
                </div>
                <div>
                  <span className="text-2xl font-bold">TelecomSaaS</span>
                  <div className="text-sm text-gray-400">by AmaliTech</div>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed text-lg mb-6 max-w-md">
                Empowering telecom businesses across Ghana with intelligent SaaS
                solutions for airtime, data, and commission management.
              </p>
              <div className="flex space-x-4">
                {landingPageData.footer.social.map((social, index) => {
                  const IconComponent = getIcon(social.icon);
                  return (
                    <a
                      key={index}
                      href={social.href}
                      className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors duration-300"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <IconComponent className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>

            {[
              { title: "Product", links: landingPageData.footer.links.product },
              { title: "Support", links: landingPageData.footer.links.support },
              { title: "Company", links: landingPageData.footer.links.company },
              { title: "Legal", links: landingPageData.footer.links.legal },
            ].map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <h4 className="font-bold mb-6 text-lg">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <Link
                      key={linkIndex}
                      to={link.href}
                      className="block text-gray-400 hover:text-white transition-colors text-base"
                    >
                      {link.label}
                    </Link>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-400 text-base">
              © 2025 TelecomSaaS by AmaliTech. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 sm:mt-0">
              <span className="text-gray-400 text-sm">
                Made with ❤️ in Ghana
              </span>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
};
