// src/pages/support-page.tsx

/**
 * Support Page
 * 
 * Features:
 * - FAQs with expandable answers
 * - Contact form
 * - Knowledge base links
 * - Live chat option
 * - Mobile-first responsive design
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, CardHeader, CardBody, Button, Input, Alert } from '../design-system';
import { 
  FaArrowLeft, FaEnvelope, FaPhone, FaComment, 
  FaQuestionCircle, FaChevronDown, FaChevronUp,
  FaCheckCircle
} from 'react-icons/fa';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export const SupportPage: React.FC = () => {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Toggle FAQ item
  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.name || !formData.email || !formData.message) {
      setFormError('Please fill in all required fields');
      return;
    }
    
    if (!formData.email.includes('@')) {
      setFormError('Please enter a valid email address');
      return;
    }
    
    // Clear errors and show success state
    setFormError(null);
    setFormSubmitted(true);
    
    // In a real app, you would send the data to your backend here
    // Form data submitted
  };

  // Sample FAQ data
  const faqs: FAQItem[] = [
    { 
      id: 1, 
      question: 'How do I make a single airtime purchase?', 
      answer: 'To make a single airtime purchase, log in to your account, navigate to the desired network page (MTN, Vodafone, or AirtelTigo), enter the phone number and amount, then click on "Purchase Airtime". Follow the payment instructions to complete your transaction.' 
    },
    { 
      id: 2, 
      question: 'How do I make bulk airtime purchases?', 
      answer: 'For bulk purchases, go to the MTN page and select the "Bulk Purchase" option. You can either enter multiple numbers manually or upload an Excel file with the required format. Follow the instructions to complete the transaction.' 
    },
    { 
      id: 3, 
      question: 'What payment methods are accepted?', 
      answer: 'We accept various payment methods including mobile money (MTN MoMo, Vodafone Cash, AirtelTigo Money), bank transfers, and credit/debit cards. The available payment options will be displayed during checkout.' 
    },
    { 
      id: 4, 
      question: 'How do I check my transaction history?', 
      answer: 'You can view your transaction history by navigating to the "History" page from your dashboard. This page displays all your past transactions with details such as date, amount, status, and recipient.' 
    },
    { 
      id: 5, 
      question: 'What should I do if a transaction fails?', 
      answer: 'If a transaction fails, first check your transaction history to confirm the status. If the amount was deducted but the service wasn\'t delivered, please contact our support team with your transaction details for assistance.' 
    },
    { 
      id: 6, 
      question: 'How do I register as an agent?', 
      answer: 'To register as an agent, click on "Register" on the homepage and select "Business Agent" as your account type. Fill in your business details, choose a subscription plan, and complete the registration process.' 
    },
    { 
      id: 7, 
      question: 'What is AFA registration?', 
      answer: 'AFA (Airtime For All) registration is a special program that allows you to register customers under your agent account. Navigate to the "AFA Registration" page from your dashboard to register new customers.' 
    },
  ];

  // Knowledge base categories
  const knowledgeBaseCategories = [
    { title: 'Getting Started', count: 12, icon: '🚀' },
    { title: 'Account & Billing', count: 8, icon: '💳' },
    { title: 'Airtime Purchases', count: 15, icon: '📱' },
    { title: 'Bulk Orders', count: 6, icon: '📊' },
    { title: 'Agent Resources', count: 10, icon: '🏪' },
    { title: 'Technical Issues', count: 9, icon: '🔧' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 shadow-lg sticky top-0 z-10">
        <Container padding="md">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors group">
                <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Home</span>
              </Link>
            </div>
            
            <div className="text-lg font-bold text-gray-900">Support Center</div>
            <div className="w-24"></div> {/* Spacer for alignment */}
          </div>
        </Container>
      </div>

      {/* Hero section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-12">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">How can we help you?</h1>
            <p className="text-blue-100 mb-6">
              Find answers to common questions or reach out to our support team
            </p>
            
            {/* Quick contact options */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8">
              <a 
                href="tel:+233551234567"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 flex flex-col items-center transition-all hover:-translate-y-1"
              >
                <FaPhone className="text-2xl mb-2" />
                <span className="text-sm font-medium">Call Us</span>
                <span className="text-xs opacity-80">24/7 Support</span>
              </a>
              
              <a 
                href="mailto:support@telecomsaas.com"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 flex flex-col items-center transition-all hover:-translate-y-1"
              >
                <FaEnvelope className="text-2xl mb-2" />
                <span className="text-sm font-medium">Email</span>
                <span className="text-xs opacity-80">24hr Response</span>
              </a>
              
              <a 
                href="#contact-form"
                className="col-span-2 sm:col-span-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 flex flex-col items-center transition-all hover:-translate-y-1"
              >
                <FaComment className="text-2xl mb-2" />
                <span className="text-sm font-medium">Live Chat</span>
                <span className="text-xs opacity-80">Instant Help</span>
              </a>
            </div>
          </div>
        </Container>
      </div>

      {/* Main content */}
      <Container className="py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Knowledge Base */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card variant="elevated" size="md" className="sticky top-24">
              <CardHeader>
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <FaQuestionCircle className="mr-2 text-blue-600" />
                  Knowledge Base
                </h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {knowledgeBaseCategories.map((category) => (
                    <Link 
                      key={category.title}
                      to="#" 
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <span className="text-xl mr-3">{category.icon}</span>
                        <span>{category.title}</span>
                      </div>
                      <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    </Link>
                  ))}
                </div>
                
                <div className="mt-6">
                  <Button 
                    variant="outline" 
                    colorScheme="default" 
                    size="md" 
                    fullWidth
                  >
                    Browse All Articles
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Main Content - FAQs and Contact Form */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            {/* FAQs */}
            <Card variant="elevated" size="lg" className="mb-8">
              <CardHeader>
                <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {faqs.map(faq => (
                    <div 
                      key={faq.id} 
                      className="border rounded-lg overflow-hidden transition-all duration-200"
                    >
                      <button 
                        className={`w-full flex justify-between items-center p-4 text-left ${expandedFAQ === faq.id ? 'bg-blue-50' : 'bg-white'}`}
                        onClick={() => toggleFAQ(faq.id)}
                      >
                        <span className="font-medium text-gray-900">{faq.question}</span>
                        {expandedFAQ === faq.id ? <FaChevronUp /> : <FaChevronDown />}
                      </button>
                      
                      {expandedFAQ === faq.id && (
                        <div className="p-4 border-t bg-gray-50">
                          <p className="text-gray-700">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Contact Form */}
            <Card variant="elevated" size="lg" id="contact-form">
              <CardHeader>
                <h2 className="text-2xl font-bold text-gray-900">Contact Support</h2>
                <p className="text-gray-600 mt-1">Fill out the form below and we'll get back to you shortly.</p>
              </CardHeader>
              <CardBody>
                {formSubmitted ? (
                  <div className="text-center py-8">
                    <div className="mx-auto bg-green-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-6">
                      <FaCheckCircle className="text-green-600 text-3xl" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Message Received!</h3>
                    <p className="text-gray-600 mb-6">
                      Thank you for contacting us. Our support team will respond within 24 hours.
                    </p>
                    <Button 
                      variant="outline" 
                      colorScheme="default" 
                      size="md"
                      onClick={() => {
                        setFormSubmitted(false);
                        setFormData({
                          name: '',
                          email: '',
                          subject: '',
                          message: ''
                        });
                      }}
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {formError && (
                      <Alert status="error" variant="left-accent">
                        {formError}
                      </Alert>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        label="Your Name"
                        placeholder="Enter your full name"
                        required
                      />
                      
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        label="Email Address"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      label="Subject"
                      placeholder="What is your inquiry about?"
                    />
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={5}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Please describe your issue or question in detail"
                        required
                      ></textarea>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="privacy"
                        name="privacy"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        required
                      />
                      <label htmlFor="privacy" className="ml-2 block text-sm text-gray-700">
                        I agree to the <Link to="/privacy-policy" className="text-blue-600 hover:text-blue-800">Privacy Policy</Link>
                      </label>
                    </div>
                    
                    <Button
                      type="submit"
                      variant="primary"
                      colorScheme="default"
                      size="lg"
                      fullWidth
                    >
                      Submit Request
                    </Button>
                  </form>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default SupportPage;
