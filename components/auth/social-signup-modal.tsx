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

interface SocialSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  userInfo: {
    name: string;
    email: string;
  };
  provider: string;
}

export default function SocialSignupModal({ isOpen, onClose, userInfo, provider }: SocialSignupModalProps) {
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
      const response = await fetch('/api/auth/social-complete', {
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
        
        // Sign in with the provider after account creation
        await signIn(provider, { 
          callbackUrl: userType === 'seller' ? '/seller/dashboard' : '/' 
        });
        
        onClose();
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Registration</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Account Type</Label>
            <Select value={userType} onValueChange={(value: 'user' | 'seller') => setUserType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Customer</SelectItem>
                <SelectItem value="seller">Seller</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
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
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Your address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                required
                rows={3}
              />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  placeholder="Your Business Name"
                  value={formData.businessName}
                  onChange={(e) => handleChange('businessName', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="businessAddress">Business Address</Label>
                <Textarea
                  id="businessAddress"
                  placeholder="Your business address"
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

          <div className="flex gap-2">
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