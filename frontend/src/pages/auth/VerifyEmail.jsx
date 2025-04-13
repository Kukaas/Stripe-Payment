import { verifyEmail } from '@/lib/hooks/api/authApi';
import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '../Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const verificationAttempted = useRef(false);

  useEffect(() => {
    const verify = async () => {
      // Skip if verification was already attempted
      if (verificationAttempted.current) return;

      try {
        const token = searchParams.get('token');

        if (!token) {
          setStatus('error');
          setMessage('No verification token found');
          return;
        }

        // Mark that we've attempted verification
        verificationAttempted.current = true;

        const response = await verifyEmail(token);
        
        if (response?.data?.message) {
          setStatus('success');
          setMessage(response.data.message);
        }
      } catch (error) {
        console.error('Error verifying email:', error);
        
        if (error?.response?.data?.message?.includes('already verified')) {
          setStatus('success');
          setMessage('Email already verified. You can now login.');
        } else {
          setStatus('error');
          setMessage(error?.response?.data?.message || 'An error occurred during verification');
        }
      }
    };

    verify();
  }, [searchParams]); // Remove isVerified from dependencies

  return (
    <Layout>
    <div className="flex justify-center items-center min-h-[80vh] w-full px-4">
      <div className="w-full max-w-md">
        <Card className="border border-border overflow-hidden transition-all duration-300">
          <CardContent className="p-6">
            {status === 'verifying' && (
              <div className="text-center py-8">
                <h3 className="text-xl font-medium mb-4 text-foreground">
                  Verifying your email address...
                </h3>
                <div className="flex justify-center">
                  <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </div>
            )}
            
            {status === 'success' && (
              <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-medium mb-2 text-foreground">
                  {message}
                </h3>
                <p className="text-muted-foreground mb-6">
                  You can now access all features of your account.
                </p>
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full py-6 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 rounded-xl shadow-lg hover:shadow-blue-300/30 text-white"
                >
                  Go to Login
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Button>
              </div>
            )}
            
            {status === 'error' && (
              <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-medium mb-2 text-foreground">
                  Verification Failed
                </h3>
                <p className="text-muted-foreground mb-6">
                  {message}
                </p>
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full py-6 text-base font-medium bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-300 rounded-xl shadow-lg hover:shadow-red-300/30 text-white"
                >
                  Return to Login
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <p className="text-muted-foreground mt-8 text-center">
          Need help? <a href="#" className="text-primary hover:text-primary/80 font-medium">Contact Support</a>
        </p>
      </div>
    </div>
  </Layout>
  );
};

export default VerifyEmail;