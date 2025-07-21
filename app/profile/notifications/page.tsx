'use client';

import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, off, update, set } from 'firebase/database';
import { getToken, onMessage } from 'firebase/messaging'; // Re-import FCM functions
import { useFirebaseAuth } from '@/components/auth/firebase-auth-context';
import app, { messaging } from '../../firebaseConfig'; // Import messaging
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BellRing, CheckCircle } from 'lucide-react'; // Removed BellOff, XCircle
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

/**
 * NotificationsPage component displays a list of user notifications,
 * fetched from Firebase Realtime Database. It allows users to mark notifications as read,
 * and manages web push notification subscriptions via FCM.
 */
export default function NotificationsPage() {
  const { user, loading: authLoading } = useFirebaseAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const router = useRouter();

  /**
   * Requests notification permission from the user and generates an FCM token.
   * This function is now called automatically on mount if permission is 'default'.
   */
  const requestFCMTokenAndPermission = async () => {
    if (!('Notification' in window)) {
      setMessage("This browser does not support desktop notification.");
      return;
    }
    if (!messaging) {
      setMessage("Notification service not available.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        setMessage("Notification permission granted!");
        // FIX: Correctly pass vapidKey in an object
        const currentToken = await getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY });
        if (currentToken) {
          console.log('FCM Registration Token:', currentToken);
          setFcmToken(currentToken);
          if (user) {
            const db = getDatabase(app);
            await set(ref(db, `AllUsers/Users/${user.uid}/fcmToken`), currentToken);
            setMessage("Notifications enabled and token saved!");
          }
        } else {
          console.warn('No FCM registration token available. Request permission to generate one.');
          setMessage("Failed to get notification token. Please ensure your browser supports it.");
        }
      } else {
        setMessage("Notification permission denied. You will not receive push notifications.");
      }
    } catch (error: any) {
      console.error("Error requesting notification permission:", error);
      setMessage(`Error enabling notifications: ${error.message}`);
    }
  };

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.push('/login?returnUrl=/notifications');
      return;
    }

    setIsLoading(true);
    setMessage('');

    const db = getDatabase(app);
    const userNotificationsRef = ref(db, `AllUsers/Users/${user.uid}/notifications`);

    // Listen for database notifications
    const unsubscribeDb = onValue(userNotificationsRef, (snapshot) => {
      const fetchedNotifications: any[] = [];
      if (snapshot.exists()) {
        const notificationsData = snapshot.val();
        Object.keys(notificationsData).forEach(key => {
          fetchedNotifications.push({ id: key, ...notificationsData[key] });
        });
        fetchedNotifications.sort((a, b) => b.timestamp - a.timestamp);
      }
      setNotifications(fetchedNotifications);
      setIsLoading(false);
      if (fetchedNotifications.length === 0) {
        setMessage("No notifications yet.");
      } else {
        setMessage('');
      }
    }, (error) => {
      console.error("Error fetching notifications:", error);
      setMessage(`Failed to load notifications: ${error.message}`);
      setNotifications([]);
      setIsLoading(false);
    });

    // Check initial notification permission status
    if ('Notification' in window) {
      const currentPermission = Notification.permission;
      setNotificationPermission(currentPermission);

      // If permission is default and user is logged in, attempt to request token
      if (currentPermission === 'default' && user && messaging) {
        requestFCMTokenAndPermission();
      } else if (currentPermission === 'granted' && user && messaging) {
        // If already granted, try to get the token again (e.g., if it expired or was not saved)
        // FIX: Correctly pass vapidKey in an object
        getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY })
          .then((currentToken) => {
            if (currentToken) {
              setFcmToken(currentToken);
              // Ensure token is saved in DB
              const db = getDatabase(app);
              set(ref(db, `AllUsers/Users/${user.uid}/fcmToken`), currentToken);
            }
          })
          .catch((err) => {
            console.error('An error occurred while retrieving token. ', err);
            setMessage(`Error getting notification token: ${err.message}`);
          });
      }
    }

    // Listen for foreground FCM messages
    let unsubscribeFCM: (() => void) | undefined;
    if (messaging) {
      unsubscribeFCM = onMessage(messaging, (payload) => {
        console.log('Message received in foreground. Payload:', payload);
        // Display notification using browser's Notification API
        if (payload.notification) {
          new Notification(payload.notification.title || 'New Notification', {
            body: payload.notification.body,
            icon: payload.notification.icon || '/favicon.ico',
          });
        }
      });
    }

    return () => {
      off(userNotificationsRef, 'value', unsubscribeDb);
      if (unsubscribeFCM) {
        unsubscribeFCM();
      }
    };
  }, [user, authLoading, router, messaging]);

  /**
   * Marks a specific notification as read in Firebase.
   */
  const markAsRead = async (notificationId: string) => {
    if (!user) {
      setMessage("Please log in to mark notifications as read.");
      return;
    }
    try {
      const db = getDatabase(app);
      const notificationRef = ref(db, `AllUsers/Users/${user.uid}/notifications/${notificationId}`);
      await update(notificationRef, { read: true });
      setMessage("Notification marked as read.");
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
      setMessage(`Failed to mark notification as read: ${error.message}`);
    }
  };

  /**
   * Marks all unread notifications as read.
   */
  const markAllAsRead = async () => {
    if (!user) {
      setMessage("Please log in to mark notifications as read.");
      return;
    }
    try {
      const db = getDatabase(app);
      const updates: { [key: string]: any } = {};
      notifications.forEach(notification => {
        if (!notification.read) {
          updates[`AllUsers/Users/${user.uid}/notifications/${notification.id}/read`] = true;
        }
      });
      if (Object.keys(updates).length > 0) {
        await update(ref(db), updates);
        setMessage("All unread notifications marked as read.");
      } else {
        setMessage("No unread notifications to mark as read.");
      }
    } catch (error: any) {
      console.error("Error marking all notifications as read:", error);
      setMessage(`Failed to mark all notifications as read: ${error.message}`);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500 text-lg">Loading notifications...</p>
      </div>
    );
  }

  const hasUnread = notifications.some(n => !n.read);

  return (
    <div className="container mx-auto px-4 py-8 font-inter">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Notifications</h1>

        {message && (
          <div
            className={`border px-4 py-3 rounded-lg relative mb-6 ${
              message.includes('successfully') || message.includes('granted') || message.includes('enabled') ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'
            }`}
            role="alert"
          >
            <span className="block sm:inline">{message}</span>
          </div>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Web Push Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Receive instant updates about your orders and account directly on this device,
              even when you're not actively browsing the site.
            </p>
            <div className="flex items-center justify-between">
              <span className="font-medium">Status: </span>
              {notificationPermission === 'granted' ? (
                <Badge className="bg-green-500 hover:bg-green-600 text-white">Enabled</Badge>
              ) : notificationPermission === 'denied' ? (
                <Badge className="bg-red-500 hover:bg-red-600 text-white">Blocked</Badge>
              ) : (
                <Badge variant="secondary">Not Requested</Badge>
              )}
            </div>
            {notificationPermission === 'denied' && (
              <p className="text-sm text-red-600">
                Notifications are blocked by your browser. Please change browser settings to enable them.
              </p>
            )}
            {notificationPermission === 'default' && (
              <p className="text-sm text-blue-600">
                You may be prompted for notification permission when you visit this page.
              </p>
            )}
            {notificationPermission === 'granted' && !fcmToken && (
              <p className="text-sm text-orange-600">
                Permission granted, but token not yet obtained or saved. Please refresh the page or try again.
              </p>
            )}
          </CardContent>
        </Card>

        {notifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <BellRing className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold mb-2">No notifications yet</h2>
              <p className="text-gray-600">You'll see updates about your orders and account here.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {hasUnread && (
              <div className="flex justify-end mb-4">
                <Button variant="outline" onClick={markAllAsRead} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Mark All As Read
                </Button>
              </div>
            )}
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card key={notification.id} className={`${!notification.read ? 'border-blue-500 border-2' : 'border-gray-200'}`}>
                  <CardContent className="p-4 flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {notification.read ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : (
                        <BellRing className="w-6 h-6 text-blue-600 animate-pulse" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                        {notification.title}
                      </h3>
                      <p className={`text-sm mt-1 ${!notification.read ? 'text-gray-700' : 'text-gray-500'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="flex-shrink-0 text-blue-500 hover:text-blue-700"
                      >
                        Mark as Read
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
