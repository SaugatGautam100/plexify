'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { signIn } from 'next-auth/react';

interface GoogleSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  userInfo: {
    name: string;
    email: string;
  };
}

export default function GoogleSignupModal({ isOpen, onClose, userInfo }: GoogleSignupModalProps) {
  const [userType, setUserType] = useState<'user' | 'seller'>('user');
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    businessName: '',
    businessAddress: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.phone) {
        toast({
          title: 'Error',
          description: 'Phone number is required.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      if (userType === 'user' && !formData.address) {
        toast({
          title: 'Error',
          description: 'Address is required for user accounts.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      if (userType === 'seller' && (!formData.businessName || !formData.businessAddress)) {
        toast({
          title: 'Error',
          description: 'Business name and address are required for seller accounts.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/auth/google-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userInfo.email,
          name: userInfo.name,
          userType,
          additionalData: formData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Account Created',
          description: 'Your account has been created successfully. Signing you in...',
        });
        
        // Close modal first
        onClose();
        
        // Sign in with Google again to get the updated session
        await signIn('google', { 
          callbackUrl: userType === 'seller' ? '/seller/dashboard' : '/' 
        });
        
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to create account.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Your Google Registration</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Account Type</Label>
            <Select value={userType} onValueChange={(value: 'user' | 'seller') => setUserType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Customer Account</SelectItem>
                <SelectItem value="seller">Seller Account</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="98XXXXXXXX"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              required
            />
          </div>

          {userType === 'user' ? (
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                placeholder="Your complete address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                required
                rows={3}
              />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  placeholder="Your Business Name"
                  value={formData.businessName}
                  onChange={(e) => handleChange('businessName', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="businessAddress">Business Address *</Label>
                <Textarea
                  id="businessAddress"
                  placeholder="Your complete business address"
                  value={formData.businessAddress}
                  onChange={(e) => handleChange('businessAddress', e.target.value)}
                  required
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Business Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Tell us about your business..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                />
              </div>
            </>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Creating Account...' : 'Complete Registration'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}