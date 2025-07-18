'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/app/firebaseConfig';
import { 
  signInWithPhoneNumber, 
  RecaptchaVerifier,
  ConfirmationResult
} from 'firebase/auth';
import { getDatabase, ref, set, get } from 'firebase/database';
import app from '@/app/firebaseConfig';
import { useRouter } from 'next/navigation';

export default function PhoneAuth() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Initialize reCAPTCHA when component mounts
    const initializeRecaptcha = () => {
      try {
        if (!recaptchaVerifier && typeof window !== 'undefined') {
          const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
            callback: (response: any) => {
              console.log('reCAPTCHA solved:', response);
            },
            'expired-callback': () => {
              console.log('reCAPTCHA expired');
              toast({
                title: 'reCAPTCHA Expired',
                description: 'Please try again.',
                variant: 'destructive',
              });
            }
          });
          setRecaptchaVerifier(verifier);
        }
      } catch (error) {
        console.error('Error initializing reCAPTCHA:', error);
      }
    };

    initializeRecaptcha();

    // Cleanup function
    return () => {
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
      }
    };
  }, []);

  const saveUserToDatabase = async (user: any) => {
    try {
      const db = getDatabase(app);
      const userRef = ref(db, `AllUsers/Users/${user.uid}`);
      
      // Check if user already exists
      const snapshot = await get(userRef);
      
      if (!snapshot.exists()) {
        // Create new user record
        const userData = {
          uid: user.uid,
          phoneNumber: user.phoneNumber,
          userType: 'user',
          address: '',
          UserCartItems: {},
          UserWishlistItems: {}
        };
        
        await set(userRef, userData);
        console.log('New user saved to database:', userData);
        
        toast({
          title: 'Welcome!',
          description: 'Your account has been created successfully.',
        });
      } else {
        // Update existing user's last login
        const existingData = snapshot.val();
        if (existingData.mobileNumber !== user.phoneNumber) {
          await set(ref(db, `AllUsers/Users/${user.uid}/mobileNumber`), user.phoneNumber);
        }
        
        console.log('Existing user login updated:', existingData);
        
        toast({
          title: 'Welcome back!',
          description: 'You have been logged in successfully.',
        });
      }
    } catch (error) {
      console.error('Error saving user to database:', error);
      toast({
        title: 'Warning',
        description: 'Login successful, but there was an issue saving user data.',
        variant: 'destructive',
      });
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid phone number.',
        variant: 'destructive',
      });
      return;
    }

    // Format phone number
    let formattedPhone = phoneNumber.trim();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+977' + formattedPhone.replace(/^0+/, '');
    }

    // Validate phone number format
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(formattedPhone)) {
      toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid phone number with country code.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Sending OTP to:', formattedPhone);
      
      // Ensure reCAPTCHA is initialized
      if (!recaptchaVerifier) {
        throw new Error('reCAPTCHA not initialized');
      }

      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
      setConfirmationResult(confirmation);
      setStep('otp');
      
      toast({
        title: 'OTP Sent',
        description: 'Please check your phone for the verification code.',
      });
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      
      let errorMessage = 'Failed to send OTP. Please try again.';
      
      switch (error.code) {
        case 'auth/invalid-phone-number':
          errorMessage = 'Invalid phone number format.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many requests. Please try again later.';
          break;
        case 'auth/quota-exceeded':
          errorMessage = 'SMS quota exceeded. Please try again later.';
          break;
        case 'auth/invalid-app-credential':
          errorMessage = 'Firebase configuration error. Please check your setup.';
          break;
        case 'auth/captcha-check-failed':
          errorMessage = 'reCAPTCHA verification failed. Please try again.';
          break;
        default:
          errorMessage = error.message || 'Failed to send OTP. Please try again.';
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });

      // Reset reCAPTCHA on error
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
        setRecaptchaVerifier(null);
        // Reinitialize reCAPTCHA
        setTimeout(() => {
          const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
            callback: (response: any) => {
              console.log('reCAPTCHA solved:', response);
            }
          });
          setRecaptchaVerifier(verifier);
        }, 1000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp.trim() || otp.length !== 6) {
      toast({
        title: 'Error',
        description: 'Please enter a valid 6-digit OTP.',
        variant: 'destructive',
      });
      return;
    }

    if (!confirmationResult) {
      toast({
        title: 'Error',
        description: 'Please request OTP first.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      
      console.log('User signed in:', user);
      
      // Save user data to Firebase Realtime Database
      await saveUserToDatabase(user);
      
      // Redirect to home page or previous page
      const returnUrl = new URLSearchParams(window.location.search).get('returnUrl') || '/';
      router.push(returnUrl);
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      let errorMessage = 'Invalid OTP. Please try again.';
      
      switch (error.code) {
        case 'auth/invalid-verification-code':
          errorMessage = 'Invalid verification code.';
          break;
        case 'auth/code-expired':
          errorMessage = 'Verification code has expired. Please request a new one.';
          break;
        case 'auth/session-expired':
          errorMessage = 'Session expired. Please request a new code.';
          break;
        default:
          errorMessage = error.message || 'Invalid OTP. Please try again.';
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtp('');
    setStep('phone');
    setConfirmationResult(null);
    
    // Clear and reinitialize reCAPTCHA
    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
      setRecaptchaVerifier(null);
    }
    
    setTimeout(() => {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: (response: any) => {
          console.log('reCAPTCHA solved:', response);
        }
      });
      setRecaptchaVerifier(verifier);
    }, 1000);
    
    toast({
      title: 'Ready to resend',
      description: 'Please enter your phone number again.',
    });
  };

  const handleBack = () => {
    setStep('phone');
    setOtp('');
    setConfirmationResult(null);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          {step === 'phone' ? 'Phone Authentication' : 'Verify OTP'}
        </CardTitle>
        <CardDescription>
          {step === 'phone' 
            ? 'Enter your phone number to receive a verification code'
            : 'Enter the 6-digit code sent to your phone'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'phone' ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+977 98XXXXXXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">
                Include country code (e.g., +977 for Nepal)
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send OTP'}
            </Button>
            <div id="recaptcha-container"></div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                required
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                Code sent to {phoneNumber}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleBack}
                className="flex-1"
                disabled={isLoading}
              >
                Back
              </Button>
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Verify'}
              </Button>
            </div>
            
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={handleResendOTP}
                disabled={isLoading}
                className="text-sm"
              >
                Didn't receive code? Resend
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}