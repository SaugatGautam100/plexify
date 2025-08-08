'use client';

import { User, MapPin, Edit, Save, Mail, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import { useFirebaseAuth } from '@/components/auth/firebase-auth-context';
import { getDatabase, ref, set, get, onValue, off, remove } from 'firebase/database';
import app from '@/app/firebaseConfig';
import { useRouter } from 'next/navigation';
import AvatarUpload from '@/components/profile/avatar-upload';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { getAuth, signOut } from 'firebase/auth'; // <-- Import signOut

// ... Address and ProfileData interfaces remain unchanged

export default function ProfilePage() {
  const { user, userData, loading, refreshUserData } = useFirebaseAuth();
  const router = useRouter();

  // ... all your state hooks

  const [profileData, setProfileData] = useState<ProfileData>({
    UserName: '',
    UserAddress: '',
    UserPhone: '',
    UserEmail: '',
    UserAvatar: 'https://static.vecteezy.com/system/resources/previews/020/911/732/non_2x/profile-icon-avatar-icon-user-icon-person-icon-free-png.png',
    addresses: [],
    orders: [],
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      orderUpdates: true,
      promotions: true,
      newsletter: false,
    },
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [newAddress, setNewAddress] = useState<Address>({
    id: '',
    type: 'home',
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Nepal',
    isDefault: false,
  });
  const [activeTab, setActiveTab] = useState('profile');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?returnUrl=/profile');
      return;
    }

    if (user) {
      const db = getDatabase(app);
      const userRef = ref(db, `AllUsers/Users/${user.uid}`);

      const unsubscribe = onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setProfileData(prev => ({
            ...prev,
            UserName: data.UserName || '',
            UserAddress: data.UserAddress || '',
            UserPhone: data.UserPhone || user.phoneNumber || '',
            UserEmail: data.UserEmail || user.email || '',
            UserAvatar: data.UserAvatar || 'https://static.vecteezy.com/system/resources/previews/020/911/732/non_2x/profile-icon-avatar-icon-user-icon-person-icon-free-png.png',
          }));
        } else {
          setProfileData(prev => ({
            ...prev,
            UserName: userData?.UserName || '',
            UserAddress: userData?.UserAddress || '',
            UserPhone: userData?.UserPhone || user.phoneNumber || '',
            UserEmail: userData?.UserEmail || user.email || '',
            UserAvatar: userData?.UserAvatar || 'https://static.vecteezy.com/system/resources/previews/020/911/732/non_2x/profile-icon-avatar-icon-user-icon-person-icon-free-png.png',
          }));
          toast.warning('No profile data found. Please update your profile.');
        }
      }, (error) => {
        toast.error('Failed to load profile data. Please try again.');
      });

      return () => off(userRef, 'value', unsubscribe);
    }
  }, [user, loading, userData, router]);

  const handleProfileUpdate = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpdate = (newAvatar: string) => {
    setProfileData(prev => ({ ...prev, UserAvatar: newAvatar }));
  };

  const handleSaveProfile = async () => {
    if (!user) {
      toast.error('No user logged in.');
      return;
    }

    if (!profileData.UserName.trim() || !profileData.UserAddress.trim() || !profileData.UserEmail.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.UserEmail)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      const db = getDatabase(app);
      const userRef = ref(db, `AllUsers/Users/${user.uid}`);

      const snapshot = await get(userRef);
      const currentData = snapshot.val() || {};

      const updatedData = {
        ...currentData,
        UserName: profileData.UserName,
        UserAddress: profileData.UserAddress,
        UserPhone: profileData.UserPhone || user.phoneNumber,
        UserEmail: profileData.UserEmail || user.email || currentData.UserEmail,
        UserAvatar: profileData.UserAvatar,
        UserCartItems: currentData.UserCartItems || {},
        UserWishlistItems: currentData.UserWishlistItems || {},
        updatedAt: Date.now(),
      };

      await set(userRef, updatedData);

      await refreshUserData();

      setIsEditing(false);
      toast.success('Your profile has been successfully updated.');
    } catch (error: any) {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- DELETE ACCOUNT FUNCTION ---
  const handleDeleteAccount = async () => {
    if (!user) {
      toast.error('No user logged in.');
      return;
    }
    try {
      setIsLoading(true);
      const db = getDatabase(app);
      const userRef = ref(db, `AllUsers/Users/${user.uid}`);
      await remove(userRef);

      // Sign out the user from Firebase Auth
      const auth = getAuth(app);
      await signOut(auth);

      toast.success('Your account has been deleted.');
      router.push('/login');
    } catch (error: any) {
      toast.error('Failed to delete account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getUserDisplayName = () => {
    return profileData.UserName || userData?.UserName || user?.phoneNumber?.replace(/^\+977/, '') || user?.email || 'User';
  };

  const getUserContactInfo = () => {
    return profileData.UserPhone || userData?.UserEmail || profileData.UserPhone || userData?.UserPhone || user?.email || user?.phoneNumber || 'No contact info';
  };
  const getEmailInfo = () => {
    return profileData.UserEmail || userData?.UserEmail || profileData.UserPhone || userData?.UserPhone || user?.email || user?.phoneNumber || 'No contact info';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6 mb-8">
          <div className="flex items-center gap-6">
            <AvatarUpload
              currentAvatar={profileData.UserAvatar}
              onAvatarUpdate={handleAvatarUpdate}
              userName={getUserDisplayName()}
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{getUserDisplayName()}</h1>
              <p className="text-gray-600">{getUserContactInfo()}</p>
              <p className="text-gray-600">{getEmailInfo()}</p>
              <p className="text-sm text-gray-500">
                Member since {userData?.createdAt ? new Date(userData.createdAt).getFullYear() : new Date().getFullYear()}
              </p>
            </div>
          </div>
          {activeTab !== 'settings' && (
            <Button
              variant={isEditing ? "outline" : "default"}
              onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>
          )}
        </div>

        <Tabs defaultValue="profile" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      value={profileData.UserName}
                      onChange={(e) => handleProfileUpdate('UserName', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="useremail">Email</Label>
                    <Input
                      id="useremail"
                      type="email"
                      value={profileData.UserEmail}
                      onChange={(e) => handleProfileUpdate('UserEmail', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userphone">Phone Number</Label>
                    <Input
                      id="userphone"
                      type="tel"
                      value={profileData.UserPhone}
                      disabled={true}
                      placeholder="98XXXXXXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="useraddress">Address</Label>
                    <Input
                      id="useraddress"
                      type="text"
                      value={profileData.UserAddress}
                      onChange={(e) => handleProfileUpdate('UserAddress', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your address"
                    />
                  </div>
                </div>

                <div className="space-y-4 mt-6">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{profileData.UserEmail || 'Not provided'}</p>
                      <p className="text-sm text-gray-600">Email Address</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{profileData.UserPhone || 'Not provided'}</p>
                      <p className="text-sm text-gray-600">Phone Number</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{profileData.UserAddress || 'Not provided'}</p>
                      <p className="text-sm text-gray-600">Address</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={isLoading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isLoading ? 'Deleting...' : 'Delete Account'}
                </Button>
              </CardContent>
            </Card>

            {/* Delete Account Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogContent className="bg-white rounded-lg shadow-lg max-w-md p-6 font-inter">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900">Delete Account</DialogTitle>
                  <DialogDescription className="text-gray-600 text-sm sm:text-base">
                    Are you sure you want to <span className="text-red-600 font-semibold">delete your account</span>?<br />
                    This action cannot be undone and all your data will be permanently removed.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteDialogOpen(false)}
                    className="rounded-lg border-gray-300 hover:bg-gray-50 text-xs sm:text-sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      setDeleteDialogOpen(false);
                      await handleDeleteAccount();
                    }}
                    className="rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm"
                  >
                    Confirm Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}