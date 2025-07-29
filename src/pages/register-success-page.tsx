import { Link } from 'react-router-dom';
import { FaCheck, FaArrowRight, FaShieldAlt } from 'react-icons/fa';
import { Button, Card, CardHeader, CardBody, Alert } from '../design-system';

export const RegisterSuccessPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-white to-emerald-100">
      <div className="flex-grow flex items-center justify-center px-4 sm:px-6 py-8">
        <Card className="w-full max-w-lg shadow-xl border-0" variant="elevated" size="lg">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto bg-gradient-to-br from-green-100 to-emerald-100 p-4 rounded-2xl w-20 h-20 flex items-center justify-center mb-6">
              <FaCheck className="text-green-600 text-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Registration Submitted!
            </h1>
            <p className="text-gray-600">
              Your agent account is pending approval by a super admin.<br/>
              You will be notified by email once your account is approved and you can then log in.
            </p>
          </CardHeader>
          <CardBody className="text-center pt-0">
            <div className="space-y-4 mb-6">
              <Alert status="info" variant="left-accent">
                <div className="text-sm">
                  <div className="font-medium">What happens next?</div>
                  <ol className="list-decimal list-inside mt-2 space-y-1 text-left">
                    <li>Your registration will be reviewed by a super admin.</li>
                    <li>You will receive an email once your account is approved.</li>
                    <li>After approval, you can log in and start using your agent dashboard.</li>
                  </ol>
                </div>
              </Alert>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start">
                  <FaShieldAlt className="text-blue-600 mt-1 mr-3 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-2">Why do we review applications?</p>
                    <ul className="space-y-1 text-sm">
                      <li>• Ensure quality service for customers</li>
                      <li>• Verify business legitimacy</li>
                      <li>• Maintain platform security</li>
                      <li>• Provide proper onboarding support</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Link to="/login">
                <Button variant="primary" size="lg" fullWidth>
                  <FaArrowRight className="mr-2" />
                  Back to Login
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" size="lg" fullWidth>
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}; 