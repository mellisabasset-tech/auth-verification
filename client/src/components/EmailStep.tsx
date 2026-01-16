import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";

interface EmailStepProps {
  onNext: (email: string) => void;
  onForgotEmail: () => void;
}

export function EmailStep({ onNext, onForgotEmail }: EmailStepProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailValue = email.trim();
    
    setError("");
    
    if (!emailValue) {
      setError("Enter an email or phone number");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 300);
      return;
    }
    
    if (!validateEmail(emailValue)) {
      setError("Enter a valid email or phone number");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 300);
      return;
    }

    onNext(emailValue);
  };

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-normal text-gray-900 mb-2 tracking-tight">Sign in</h1>
        <p className="text-sm text-gray-600">to continue to Google</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Input */}
        <div className="relative">
          <Input
            type="email"
            data-testid="input-email"
            placeholder="Email or phone"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full h-14 px-4 text-base border rounded-lg border-gray-300 
              focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 
              transition-all duration-200 ${isShaking ? 'error-shake border-red-500' : ''}`}
            autoComplete="username"
            spellCheck="false"
            autoCapitalize="off"
            autoCorrect="off"
          />
          {error && (
            <div className="flex items-center mt-2 text-sm text-red-600">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
        </div>

        {/* Forgot Email Link */}
        <div className="text-left">
          <button 
            type="button"
            data-testid="button-forgot-email"
            onClick={onForgotEmail}
            className="text-sm text-blue-600 hover:underline font-medium transition-colors duration-200"
          >
            Forgot email?
          </button>
        </div>

        {/* Guest Mode Text */}
        <div className="text-sm text-gray-600">
          <span>Not your computer? Use Guest mode to sign in privately.</span>
          <button 
            type="button" 
            className="text-blue-600 hover:underline ml-1 font-medium transition-colors duration-200"
          >
            Learn more about using Guest mode
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-between items-center pt-6">
          {/* Create Account Dropdown */}
          <div className="relative">
            <button 
              type="button"
              data-testid="button-create-account"
              className="flex items-center text-sm text-blue-600 font-medium hover:underline transition-colors duration-200"
            >
              Create account
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
          </div>
          
          {/* Next Button */}
          <Button 
            type="submit"
            data-testid="button-next"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-md font-medium text-sm 
              transition-all duration-200 shadow-sm hover:shadow-md focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50"
          >
            Next
          </Button>
        </div>
      </form>

      {/* Privacy and Terms */}
      <div className="mt-8 text-xs text-gray-500 text-center">
        <p>
          To review and adjust your security settings and get recommendations to help you keep your account secure, sign in to your account.
        </p>
        <div className="flex justify-center items-center space-x-4 mt-4">
          <button className="hover:underline transition-colors duration-200">Privacy</button>
          <button className="hover:underline transition-colors duration-200">Terms</button>
        </div>
      </div>
    </div>
  );
}
