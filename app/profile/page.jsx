'use client';
import { User, MapPin, Package, Settings, Edit, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { useFirebaseAuth } from '@/components/auth/firebase-auth-context';
import { getDatabase, ref, set, get } from 'firebase/database';
import app from '@/app/firebaseConfig';
import { useRouter } from 'next/navigation';

import AvatarUpload from '@/components/profile/avatar-upload';

export default function ProfilePage() {
  const { user, userData, loading, refreshUserData } = useFirebaseAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gender: 'prefer-not-to-say',
    bio: '',
    createdAt: '',
    addresses: [],
    orders: [],
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      orderUpdates: true,
      promotions: true,
      newsletter: false,
    },
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [newAddress, setNewAddress] = useState({
    type: 'home',
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Nepal',
    isDefault: false,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?returnUrl=/profile');
    }
  }, [user, loading, router]);

  // Load user data when available
  useEffect(() => {
    if (userData) {
      setProfileData(prev => ({
        ...prev,
        name: userData.displayName || '',
        email: userData.email || '',
        phone: userData.mobileNumber || userData.phoneNumber || '',
        address: userData.address || '',
        createdAt: userData.createdAt ? new Date(userData.createdAt).toISOString() : new Date().toISOString(),
      }));
    }
  }, [userData]);

  const handleProfileUpdate = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpdate = (newAvatar) => {
    setProfileData(prev => ({ ...prev, avatar: newAvatar }));
  };

  const handlePreferenceUpdate = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [field]: value }
    }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const db = getDatabase(app);
      const userRef = ref(db, `AllUsers/Users/${user.uid}`);
      
      // Get current user data
      const snapshot = await get(userRef);
      const currentData = snapshot.val() || {};
      
      // Update user data in Firebase
      const updatedData = {
        ...currentData,
        displayName: profileData.name,
        email: profileData.email,
        mobileNumber: profileData.phone,
        address: profileData.address,
        gender: profileData.gender,
        bio: profileData.bio,
        avatar: profileData.avatar,
        preferences: profileData.preferences,
        updatedAt: Date.now(),
      };

      await set(userRef, updatedData);
      
      // Refresh user data in context
      await refreshUserData();
      
      setIsEditing(false);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAddAddress = () => {
    if (!newAddress.name || !newAddress.street || !newAddress.city) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const address = {
      ...newAddress,
      id: Date.now().toString(),
    };

    setProfileData(prev => ({
      ...prev,
      addresses: [...prev.addresses, address]
    }));

    setNewAddress({
      type: 'home',
      name: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Nepal',
      isDefault: false,
    });

    setShowAddressDialog(false);
    toast({
      title: 'Address added',
      description: 'New address has been added successfully.',
    });
  };

  const handleDeleteAddress = (addressId) => {
    setProfileData(prev => ({
      ...prev,
      addresses: prev.addresses.filter(addr => addr.id !== addressId)
    }));
    toast({
      title: 'Address deleted',
      description: 'Address has been removed successfully.',
    });
  };

  const handleSetDefaultAddress = (addressId) => {
    setProfileData(prev => ({
      ...prev,
      addresses: prev.addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      }))
    }));
    toast({
      title: 'Default address updated',
      description: 'Default address has been changed successfully.',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'default';
      case 'shipped': return 'secondary';
      case 'processing': return 'outline';
      default: return 'destructive';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-6 mb-8">
          <AvatarUpload
            currentAvatar={profileData.avatar}
            onAvatarUpdate={handleAvatarUpdate}
            userName={profileData.name || 'User'}
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{profileData.name || 'User'}</h1>
            <p className="text-gray-600">{profileData.email || profileData.phone}</p>
            <p className="text-sm text-gray-500">
              Member since {new Date(profileData.createdAt).getFullYear()}
            </p>
            {userData && (
              <Badge variant="outline" className="mt-2">
                {userData.userType === 'seller' ? 'Seller Account' : 'Customer Account'}
              </Badge>
            )}
          </div>
          <Button
            variant={isEditing ? "outline" : "default"}
            onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
          >
            {isEditing ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
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
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => handleProfileUpdate('name', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleProfileUpdate('email', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleProfileUpdate('phone', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      type="text"
                      value={profileData.address}
                      onChange={(e) => handleProfileUpdate('address', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={profileData.gender}
                      onValueChange={(value) => handleProfileUpdate('gender', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => handleProfileUpdate('bio', e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Saved Addresses</h2>
              <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Address
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Address</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="addressType">Address Type</Label>
                      <Select
                        value={newAddress.type}
                        onValueChange={(value) => setNewAddress(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="home">Home</SelectItem>
                          <SelectItem value="work">Work</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="addressName">Address Name</Label>
                      <Input
                        id="addressName"
                        value={newAddress.name}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Home, Office"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="street">Street Address</Label>
                      <Input
                        id="street"
                        value={newAddress.street}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                        placeholder="123 Main Street"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          value={newAddress.zipCode}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Select
                          value={newAddress.country}
                          onValueChange={(value) => setNewAddress(prev => ({ ...prev, country: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Nepal">Nepal</SelectItem>
                            <SelectItem value="India">India</SelectItem>
                            <SelectItem value="USA">United States</SelectItem>
                            <SelectItem value="Canada">Canada</SelectItem>
                            <SelectItem value="UK">United Kingdom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowAddressDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddAddress}>
                        Add Address
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profileData.addresses.map((address) => (
                <Card key={address.id} className={address.isDefault ? 'ring-2 ring-blue-500' : ''}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <CardTitle className="text-base">{address.name}</CardTitle>
                      {address.isDefault && (
                        <Badge variant="default" className="text-xs">Default</Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDeleteAddress(address.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>{address.street}</p>
                      <p>{address.city}, {address.state} {address.zipCode}</p>
                      <p>{address.country}</p>
                    </div>
                    {!address.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => handleSetDefaultAddress(address.id)}
                      >
                        Set as Default
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Order History</h2>
              <p className="text-gray-600">{profileData.orders.length} orders</p>
            </div>

            {profileData.orders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-16">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                  <p className="text-gray-600 mb-4">When you place orders, they'll appear here.</p>
                  <Button onClick={() => router.push('/products')}>
                    Start Shopping
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {profileData.orders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <Package className="w-5 h-5 text-gray-400" />
                          <div>
                            <h3 className="font-semibold">Order {order.id}</h3>
                            <p className="text-sm text-gray-600">
                              Placed on {new Date(order.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                          <p className="text-sm text-gray-600 mt-1">
                            {order.items} item{order.items > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total: ${order.total}</span>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          <Button variant="outline" size="sm">
                            Track Order
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                  <Button
                    variant={profileData.preferences.emailNotifications ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePreferenceUpdate('emailNotifications', !profileData.preferences.emailNotifications)}
                  >
                    {profileData.preferences.emailNotifications ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">SMS Notifications</h4>
                    <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                  </div>
                  <Button
                    variant={profileData.preferences.smsNotifications ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePreferenceUpdate('smsNotifications', !profileData.preferences.smsNotifications)}
                  >
                    {profileData.preferences.smsNotifications ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Order Updates</h4>
                    <p className="text-sm text-gray-600">Get notified about order status changes</p>
                  </div>
                  <Button
                    variant={profileData.preferences.orderUpdates ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePreferenceUpdate('orderUpdates', !profileData.preferences.orderUpdates)}
                  >
                    {profileData.preferences.orderUpdates ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Promotional Emails</h4>
                    <p className="text-sm text-gray-600">Receive promotional offers and deals</p>
                  </div>
                  <Button
                    variant={profileData.preferences.promotions ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePreferenceUpdate('promotions', !profileData.preferences.promotions)}
                  >
                    {profileData.preferences.promotions ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Newsletter</h4>
                    <p className="text-sm text-gray-600">Subscribe to our weekly newsletter</p>
                  </div>
                  <Button
                    variant={profileData.preferences.newsletter ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePreferenceUpdate('newsletter', !profileData.preferences.newsletter)}
                  >
                    {profileData.preferences.newsletter ? 'Subscribed' : 'Unsubscribed'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Download My Data
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}