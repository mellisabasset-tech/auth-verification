import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleLogo } from "./GoogleLogo";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

interface PasswordStepProps {
  email: string;
  onNext: (password: string) => void;
  onBack: () => void;
  onForgotPassword: () => void;
}

export function PasswordStep({ email, onNext, onBack, onForgotPassword }: PasswordStepProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [staySignedIn, setStaySignedIn] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    onNext(password);
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <button 
          data-testid="button-back-to-email"
          onClick={onBack}
          className="mr-4 p-1 hover:bg-gray-100 rounded"
        >
          <ArrowLeft className="w-5 h-5 text-google-gray" />
        </button>
        <div>
          <GoogleLogo size="small" />
        </div>
      </div>

      <h1 className="text-2xl font-product-sans font-normal text-gray-800 mb-2">Welcome</h1>
      <div className="flex items-center mb-8">
        <span data-testid="text-user-email" className="text-sm text-google-gray">{email}</span>
        <button className="ml-2 text-google-blue text-sm hover:underline">Switch account</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            data-testid="input-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field w-full px-4 py-3 pr-12 border border-gray-300 rounded-md text-base focus:border-google-blue"
            required
          />
          <button 
            type="button"
            data-testid="button-toggle-password"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-google-gray hover:text-gray-800"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <div className="text-left">
          <button 
            type="button"
            data-testid="button-forgot-password"
            onClick={onForgotPassword}
            className="text-sm text-google-blue hover:underline font-medium"
          >
            Forgot password?
          </button>
        </div>

        <div className="flex items-center">
          <input 
            type="checkbox" 
            data-testid="checkbox-stay-signed-in"
            id="staySignedIn" 
            checked={staySignedIn}
            onChange={(e) => setStaySignedIn(e.target.checked)}
            className="mr-3"
          />
          <label htmlFor="staySignedIn" className="text-sm text-google-gray">Stay signed in</label>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            type="submit"
            data-testid="button-next-password"
            className="google-button bg-google-blue text-white px-6 py-2 rounded-md font-medium text-sm hover:bg-google-blue-dark"
          >
            Next
          </Button>
        </div>
      </form>
    </div>
  );
}
