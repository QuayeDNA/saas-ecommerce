// src/pages/privacy-policy-page.tsx

/**
 * Privacy Policy Page
 * 
 * Features:
 * - Comprehensive privacy policy content
 * - Mobile-first responsive design
 * - Clear section organization
 * - Consistent with design system
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, CardHeader, CardBody } from '../design-system';
import { FaArrowLeft } from 'react-icons/fa';

export const PrivacyPolicyPage: React.FC = () => {
  // Scroll to specific section when anchor links are clicked
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <Container padding="md">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors group">
                <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Home</span>
              </Link>
            </div>
            
            <div className="text-lg font-bold text-gray-900">Privacy Policy</div>
            <div className="w-24"></div> {/* Spacer for alignment */}
          </div>
        </Container>
      </div>

      {/* Main content */}
      <Container className="py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Table of Contents - Desktop */}
          <div className="lg:col-span-3 hidden lg:block">
            <div className="sticky top-24">
              <Card variant="outlined" size="sm">
                <CardHeader>
                  <h3 className="font-medium text-lg">Contents</h3>
                </CardHeader>
                <CardBody className="py-2">
                  <nav className="space-y-1">
                    {[
                      { id: 'introduction', label: 'Introduction' },
                      { id: 'information-collection', label: 'Information We Collect' },
                      { id: 'information-use', label: 'How We Use Information' },
                      { id: 'information-sharing', label: 'Information Sharing' },
                      { id: 'cookies', label: 'Cookies & Technologies' },
                      { id: 'security', label: 'Data Security' },
                      { id: 'your-rights', label: 'Your Rights' },
                      { id: 'childrens-privacy', label: 'Children\'s Privacy' },
                      { id: 'changes', label: 'Changes to Policy' },
                      { id: 'contact', label: 'Contact Us' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className="block w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 text-sm transition-colors"
                      >
                        {item.label}
                      </button>
                    ))}
                  </nav>
                </CardBody>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <Card variant="elevated" size="lg">
              <CardHeader>
                <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
                <p className="text-gray-600 mt-2">Last Updated: July 1, 2025</p>
              </CardHeader>
              <CardBody className="prose prose-sm sm:prose lg:prose-lg max-w-none">
                <section id="introduction" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
                  <p>
                    Welcome to TelecomSaaS. We respect your privacy and are committed to protecting your personal data. 
                    This privacy policy will inform you about how we look after your personal data when you visit our website 
                    and tell you about your privacy rights and how the law protects you.
                  </p>
                </section>

                <section id="information-collection" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
                  <p>
                    We collect several different types of information for various purposes to provide and improve our service to you:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li><strong>Personal Data:</strong> Name, email address, phone number, username, password</li>
                    <li><strong>Usage Data:</strong> IP address, browser type, pages visited, time and date of visit</li>
                    <li><strong>Transaction Data:</strong> Payment details, purchase history, airtime orders</li>
                    <li><strong>Business Information:</strong> For agent accounts, business name, type, and category</li>
                  </ul>
                </section>

                <section id="information-use" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Information</h2>
                  <p>We use the collected data for various purposes, including:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li>To provide and maintain our service</li>
                    <li>To notify you about changes to our service</li>
                    <li>To provide customer support</li>
                    <li>To process payments and prevent fraudulent transactions</li>
                    <li>To provide personalized service experience</li>
                    <li>To monitor usage of our service</li>
                    <li>To detect, prevent and address technical issues</li>
                  </ul>
                </section>

                <section id="information-sharing" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Information Sharing</h2>
                  <p>We may share your personal information in the following situations:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li><strong>With Service Providers:</strong> To facilitate our service, process payments, or perform service-related services.</li>
                    <li><strong>For Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
                    <li><strong>With Affiliates:</strong> With our subsidiaries or affiliated companies.</li>
                    <li><strong>With Your Consent:</strong> After obtaining your explicit permission.</li>
                    <li><strong>For Legal Requirements:</strong> When required by law or to protect our rights.</li>
                  </ul>
                </section>

                <section id="cookies" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies & Technologies</h2>
                  <p>
                    We use cookies and similar tracking technologies to track activity on our service and store certain information. 
                    These technologies are used to remember your preferences, improve your experience, and analyze how you use our service.
                  </p>
                  <p className="mt-2">
                    You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not 
                    accept cookies, you may not be able to use some portions of our service.
                  </p>
                </section>

                <section id="security" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
                  <p>
                    The security of your data is important to us. We implement appropriate security measures to protect your personal 
                    information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission 
                    over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                  </p>
                </section>

                <section id="your-rights" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
                  <p>You have certain data protection rights, including:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li>The right to access, update, or delete your information</li>
                    <li>The right to rectification (to correct inaccurate data)</li>
                    <li>The right to object to our processing of your personal data</li>
                    <li>The right to restriction (request we limit our processing)</li>
                    <li>The right to data portability</li>
                    <li>The right to withdraw consent</li>
                  </ul>
                </section>

                <section id="childrens-privacy" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
                  <p>
                    Our service is not intended for use by children under the age of 18. We do not knowingly collect personally identifiable 
                    information from children under 18. If you are a parent or guardian and you are aware that your child has provided us 
                    with personal data, please contact us.
                  </p>
                </section>

                <section id="changes" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
                  <p>
                    We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy 
                    on this page and updating the "last updated" date. You are advised to review this Privacy Policy periodically for any changes.
                  </p>
                </section>

                <section id="contact" className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                  <p>
                    If you have any questions about this Privacy Policy, please contact us:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>By email: privacy@telecomsaas.com</li>
                    <li>By phone: +233 55 123 4567</li>
                    <li>By mail: P.O. Box 123, Accra, Ghana</li>
                  </ul>
                </section>
              </CardBody>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default PrivacyPolicyPage;
