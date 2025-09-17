/**
 * Landing Page Data Configuration
 * Dynamic content for the SaaS Telecom platform landing page
 */

export interface Provider {
  id: string;
  name: string;
  code: string;
  color: string;
  bgColor: string;
  textColor: string;
  description: string;
  features: string[];
  icon: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "core" | "advanced" | "business";
  metrics?: {
    value: string;
    label: string;
  };
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
  location: string;
}

export interface Stat {
  id: string;
  value: string;
  label: string;
  icon: string;
  trend?: {
    value: string;
    direction: "up" | "down";
  };
}

export interface LandingPageData {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    cta: {
      primary: string;
      secondary: string;
    };
    stats: Stat[];
  };
  providers: Provider[];
  features: Feature[];
  testimonials: Testimonial[];
  stats: Stat[];
  footer: {
    links: {
      product: Array<{ label: string; href: string }>;
      support: Array<{ label: string; href: string }>;
      company: Array<{ label: string; href: string }>;
      legal: Array<{ label: string; href: string }>;
    };
    social: Array<{ platform: string; href: string; icon: string }>;
  };
}

export const landingPageData: LandingPageData = {
  hero: {
    title: "Transform Your Telecom Business with Real-Time Intelligence",
    subtitle: "Scale • Automate • Dominate",
    description:
      "Empower your telecom operations with our comprehensive SaaS platform. Manage airtime, data bundles, and commissions across all major Ghanaian networks with real-time wallet updates and advanced analytics.",
    cta: {
      primary: "Start Free Trial",
      secondary: "Watch Demo",
    },
    stats: [
      {
        id: "networks",
        value: "4",
        label: "Networks Supported",
        icon: "Globe",
        trend: { value: "+2", direction: "up" },
      },
      {
        id: "transactions",
        value: "50K+",
        label: "Monthly Transactions",
        icon: "TrendingUp",
        trend: { value: "+25%", direction: "up" },
      },
      {
        id: "uptime",
        value: "99.9%",
        label: "Platform Uptime",
        icon: "Shield",
        trend: { value: "+0.1%", direction: "up" },
      },
      {
        id: "response",
        value: "<2s",
        label: "API Response Time",
        icon: "Zap",
        trend: { value: "-0.3s", direction: "up" },
      },
    ],
  },

  providers: [
    {
      id: "mtn",
      name: "MTN",
      code: "MTN",
      color: "from-yellow-400 to-yellow-600",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700",
      description:
        "Complete MTN airtime and data solutions with instant delivery and competitive rates.",
      features: [
        "Airtime Top-up",
        "Data Bundles",
        "Bulk Operations",
        "Real-time Balance",
      ],
      icon: "Smartphone",
    },
    {
      id: "telecel",
      name: "TELECEL",
      code: "TELECEL",
      color: "from-red-400 to-red-600",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      description:
        "Reliable TELECEL services with seamless integration and instant processing.",
      features: [
        "Voice & Data",
        "Bulk Processing",
        "Auto-recharge",
        "Transaction History",
      ],
      icon: "Phone",
    },
    {
      id: "at-big-time",
      name: "AT BIG TIME",
      code: "AT-BIG-TIME",
      color: "from-blue-400 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      description:
        "AT BIG TIME packages for comprehensive data solutions and business growth.",
      features: [
        "Data Packages",
        "Business Plans",
        "Volume Discounts",
        "Priority Support",
      ],
      icon: "Wifi",
    },
    {
      id: "at-ishare-premium",
      name: "AT iShare Premium",
      code: "AT-ISHARE-PREMIUM",
      color: "from-teal-400 to-teal-600",
      bgColor: "bg-teal-50",
      textColor: "text-teal-700",
      description:
        "Premium AT iShare packages with exclusive benefits and enhanced features.",
      features: [
        "Premium Plans",
        "Shared Data",
        "Family Packages",
        "Advanced Analytics",
      ],
      icon: "Users",
    },
  ],

  features: [
    {
      id: "real-time-wallet",
      title: "Real-Time Wallet Intelligence",
      description:
        "Live wallet balance updates with WebSocket connections and intelligent polling fallbacks for reliable financial tracking.",
      icon: "Wallet",
      category: "core",
      metrics: { value: "99.9%", label: "Uptime" },
    },
    {
      id: "bulk-operations",
      title: "Intelligent Bulk Processing",
      description:
        "Process thousands of transactions simultaneously with our advanced bulk operation engine and smart queue management.",
      icon: "Package",
      category: "advanced",
      metrics: { value: "10K+", label: "Per Minute" },
    },
    {
      id: "commission-engine",
      title: "Dynamic Commission System",
      description:
        "Automated commission calculations with multi-tier structures, real-time payouts, and comprehensive performance analytics.",
      icon: "TrendingUp",
      category: "business",
      metrics: { value: "15%", label: "Avg Commission" },
    },
    {
      id: "analytics-dashboard",
      title: "Advanced Analytics Engine",
      description:
        "Comprehensive business intelligence with predictive analytics, trend analysis, and actionable insights for growth.",
      icon: "BarChart3",
      category: "business",
      metrics: { value: "50+", label: "Reports" },
    },
    {
      id: "multi-agent",
      title: "Multi-Agent Architecture",
      description:
        "Role-based access control with individual performance tracking, territory management, and collaborative workflows.",
      icon: "Users",
      category: "advanced",
      metrics: { value: "100+", label: "Active Agents" },
    },
    {
      id: "security",
      title: "Bank-Grade Security",
      description:
        "Military-grade encryption, secure payment processing, and compliance with international security standards.",
      icon: "Shield",
      category: "core",
      metrics: { value: "256-bit", label: "Encryption" },
    },
  ],

  testimonials: [
    {
      id: "kwame-asant",
      name: "Kwame Asante",
      role: "Regional Manager",
      company: "TelecomPlus Ghana",
      content:
        "The real-time wallet updates revolutionized our operations. We can now track every transaction instantly and make data-driven decisions that increased our efficiency by 40%.",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      location: "Accra, Ghana",
    },
    {
      id: "sarah-mensah",
      name: "Sarah Mensah",
      role: "Operations Director",
      company: "DataFlow Solutions",
      content:
        "The bulk processing capabilities saved us 15 hours weekly. What used to take our team days now completes in minutes with zero errors.",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b1c2?w=150&h=150&fit=crop&crop=face",
      location: "Kumasi, Ghana",
    },
    {
      id: "ama-osei",
      name: "Ama Osei",
      role: "CEO",
      company: "ConnectGhana Telecom",
      content:
        "The analytics dashboard provides insights we never had before. We've optimized our pricing strategy and increased margins by 25% in just 3 months.",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      location: "Tema, Ghana",
    },
    {
      id: "kofi-adams",
      name: "Kofi Adams",
      role: "IT Manager",
      company: "Ghana Telecom Hub",
      content:
        "The platform's reliability is unmatched. 99.9% uptime and sub-2-second response times mean we can serve our customers without interruption.",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      location: "Takoradi, Ghana",
    },
  ],

  stats: [
    {
      id: "active-users",
      value: "2,500+",
      label: "Active Users",
      icon: "Users",
      trend: { value: "+180", direction: "up" },
    },
    {
      id: "transactions-monthly",
      value: "500K+",
      label: "Monthly Transactions",
      icon: "Activity",
      trend: { value: "+35%", direction: "up" },
    },
    {
      id: "revenue-processed",
      value: "₵50M+",
      label: "Revenue Processed",
      icon: "DollarSign",
      trend: { value: "+45%", direction: "up" },
    },
    {
      id: "customer-satisfaction",
      value: "4.9/5",
      label: "Customer Satisfaction",
      icon: "Star",
      trend: { value: "+0.2", direction: "up" },
    },
  ],

  footer: {
    links: {
      product: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "/pricing" },
        { label: "API Documentation", href: "/api" },
        { label: "Integrations", href: "/integrations" },
      ],
      support: [
        { label: "Help Center", href: "/support" },
        { label: "Contact Us", href: "/contact" },
        { label: "System Status", href: "/status" },
        { label: "Community", href: "/community" },
      ],
      company: [
        { label: "About Us", href: "/about" },
        { label: "Careers", href: "/careers" },
        { label: "Press", href: "/press" },
        { label: "Blog", href: "/blog" },
      ],
      legal: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Cookie Policy", href: "/cookies" },
        { label: "Compliance", href: "/compliance" },
      ],
    },
    social: [
      { platform: "LinkedIn", href: "#", icon: "Linkedin" },
      { platform: "Twitter", href: "#", icon: "Twitter" },
      { platform: "Facebook", href: "#", icon: "Facebook" },
      { platform: "YouTube", href: "#", icon: "Youtube" },
    ],
  },
};
