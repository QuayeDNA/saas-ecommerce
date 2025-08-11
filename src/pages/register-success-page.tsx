import { Link } from 'react-router-dom';
import { FaCheck, FaArrowRight, FaShieldAlt, FaClock } from 'react-icons/fa';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardBody, 
  Container, 
  Section, 
  Badge 
} from '../design-system';

export const RegisterSuccessPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-100">
      <Container className="py-8 sm:py-12">
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Card className="w-full max-w-2xl shadow-xl border-0" variant="elevated" size="lg">
            <CardHeader className="text-center pb-8">
              {/* Success Icon */}
              <div className="mx-auto bg-gradient-to-br from-green-100 to-emerald-100 p-6 rounded-full w-24 h-24 flex items-center justify-center mb-6 animate-pulse">
                <FaCheck className="text-green-600 text-3xl" />
              </div>
              
              {/* Main Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Registration Submitted Successfully!
              </h1>
              
              {/* Subtitle */}
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-lg mx-auto">
                Your agent account has been created and is now pending approval by a super admin. 
                You'll receive an email notification once your account is approved.
              </p>
            </CardHeader>
            
            <CardBody className="pt-0">
              <div className="space-y-6">
                {/* Process Steps */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
                    What happens next?
                  </h2>
                  
                  <div className="grid gap-4 sm:gap-6">
                    {/* Step 1 */}
                    <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">1</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-blue-900 mb-1">Review Process</h3>
                        <p className="text-blue-700 text-sm sm:text-base">
                          Your registration will be reviewed by a super admin within 24-48 hours.
                        </p>
                      </div>
                    </div>
                    
                    {/* Step 2 */}
                    <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-semibold text-sm">2</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-green-900 mb-1">Email Notification</h3>
                        <p className="text-green-700 text-sm sm:text-base">
                          You'll receive an email once your account is approved or if additional information is needed.
                        </p>
                      </div>
                    </div>
                    
                    {/* Step 3 */}
                    <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-semibold text-sm">3</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-purple-900 mb-1">Access Dashboard</h3>
                        <p className="text-purple-700 text-sm sm:text-base">
                          After approval, you can log in and start using your agent dashboard to manage orders and customers.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Why Review Section */}
                <Section>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                    <div className="flex items-start space-x-4">
                      <FaShieldAlt className="text-blue-600 mt-1 text-xl flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-blue-900 mb-3 text-lg">
                          Why do we review applications?
                        </h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-blue-800 text-sm sm:text-base">Ensure quality service for customers</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-blue-800 text-sm sm:text-base">Verify business legitimacy</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-blue-800 text-sm sm:text-base">Maintain platform security</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-blue-800 text-sm sm:text-base">Provide proper onboarding support</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Section>
                
                {/* Status Badge */}
                <div className="text-center">
                  <Badge colorScheme="warning" size="lg" className="text-sm sm:text-base px-4 py-2">
                    <FaClock className="mr-2" />
                    Status: Pending Approval
                  </Badge>
                </div>
                
                {/* Action Buttons */}
                <div className="space-y-3 sm:space-y-0 sm:space-x-3 sm:flex sm:justify-center">
                  <Link to="/login" className="block sm:inline-block">
                    <Button 
                      variant="primary" 
                      size="lg" 
                      fullWidth={false}
                      className="w-full sm:w-auto"
                    >
                      <FaArrowRight className="mr-2" />
                      Back to Login
                    </Button>
                  </Link>
                  <Link to="/" className="block sm:inline-block">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      fullWidth={false}
                      className="w-full sm:w-auto"
                    >
                      Back to Home
                    </Button>
                  </Link>
                </div>
                
                {/* Additional Info */}
                <div className="text-center pt-4">
                  <p className="text-gray-500 text-sm">
                    Need help? Contact our support team at{' '}
                    <a href="mailto:support@brytelinks.com" className="text-blue-600 hover:text-blue-800 underline">
                      support@brytelinks.com
                    </a>
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </Container>
    </div>
  );
}; 