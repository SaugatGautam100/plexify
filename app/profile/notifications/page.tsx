'use client';

import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, off, update, set, push, Unsubscribe } from 'firebase/database';
import { useFirebaseAuth } from '@/components/auth/firebase-auth-context';
import app from '../../firebaseConfig';
import { Card, CardContent } from '@/components/ui/card';
import { BellRing, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

type NotificationItem = {
  title: string;
  price: number;
  quantity: number;
  category: string;
  unit: string;
  type: string;
  images: string[];
};

type Notification = {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
};

export default function NotificationsPage() {
  const { user, loading: authLoading } = useFirebaseAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');
  const [imageIndices, setImageIndices] = useState<{ [key: string]: { [itemIndex: number]: number } }>({});
  const router = useRouter();

  const saveNotificationToFirebase = async (userId: string, title: string, message: string) => {
    try {
      const db = getDatabase(app);
      const notificationsRef = ref(db, `AllUsers/Users/${userId}/UserNotifications`);
      const newNotificationRef = push(notificationsRef);
      await set(newNotificationRef, {
        title,
        message,
        timestamp: Date.now(),
        read: false,
      });
    } catch (error: any) {
      console.error("Error saving notification to Firebase:", error);
      setMessage(`Error saving notification: ${error.message}`);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/login?returnUrl=/notifications');
      return;
    }

    setIsLoading(true);
    setMessage('');

    const db = getDatabase(app);
    const userNotificationsRef = ref(db, `AllUsers/Users/${user.uid}/UserNotifications`);

    const unsubscribeDb = onValue(userNotificationsRef, (snapshot) => {
      const fetchedNotifications: Notification[] = [];
      const newImageIndices: { [key: string]: { [itemIndex: number]: number } } = {};
      if (snapshot.exists()) {
        const notificationsData = snapshot.val() as Record<string, any>;
        Object.keys(notificationsData).forEach(key => {
          const notification: Notification = { id: key, ...notificationsData[key] };
          fetchedNotifications.push(notification);
          // Initialize image indices for each item in the notification
          const items = parseNotificationItems(notification.message);
          newImageIndices[key] = items.reduce((acc, _, index) => ({
            ...acc,
            [index]: 0
          }), {});
        });
        fetchedNotifications.sort((a, b) => b.timestamp - a.timestamp);
      }
      setNotifications(fetchedNotifications);
      setImageIndices(newImageIndices);
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
      setImageIndices({});
      setIsLoading(false);
    });

    return () => {
      off(userNotificationsRef, 'value', unsubscribeDb as unknown as Unsubscribe);
    };
  }, [user, authLoading, router]);

  // Automatic carousel for item images
  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndices((prev) => {
        const newIndices = { ...prev };
        notifications.forEach((notification) => {
          const items = parseNotificationItems(notification.message);
          newIndices[notification.id] = newIndices[notification.id] || {};
          items.forEach((item, itemIndex) => {
            const imageCount = item.images?.length || 1;
            if (imageCount > 1) {
              newIndices[notification.id][itemIndex] = ((prev[notification.id]?.[itemIndex] || 0) + 1) % imageCount;
            }
          });
        });
        return newIndices;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [notifications]);

  function parseNotificationItems(message: string): NotificationItem[] {
    const itemLines = message.split('\n').filter(line => line.startsWith('- '));
    return itemLines.map(line => {
            const match = line.match(/- Title: (.+); Price: Rs\.([\d.]+); Quantity: (\d+); Category: (.+); Unit: (.+); Type: (.+); Images: \[([^\]]*)\]/);

      if (match) {
        const images = match[7].split(',').map(url => url.trim()).filter(url => url);
        return {
          title: match[1],
          price: parseFloat(match[2]),
          quantity: parseInt(match[3]),
          category: match[4],
          unit: match[5],
          type: match[6],
          images: images.length > 0 ? images : ['https://placehold.co/100x100/E0E0E0/808080?text=No+Image'],
        };
      }
      return null;
    }).filter((item): item is NotificationItem => item !== null);
  }

  const markAsRead = async (notificationId: string) => {
    if (!user) {
      setMessage("Please log in to mark notifications as read.");
      return;
    }
    try {
      const db = getDatabase(app);
      const notificationRef = ref(db, `AllUsers/Users/${user.uid}/UserNotifications/${notificationId}`);
      await update(notificationRef, { read: true });
      setMessage("Notification marked as read.");
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
      setMessage(`Failed to mark notification as read: ${error.message}`);
    }
  };

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
          updates[`AllUsers/Users/${user.uid}/UserNotifications/${notification.id}/read`] = true;
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
      <div className="container mx-auto px-4 py-8 sm:py-16 text-center">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500 text-base sm:text-lg">Loading notifications...</p>
      </div>
    );
  }

  const hasUnread = notifications.some(n => !n.read);

  return (
    <div className="container mx-auto px-4 py-8 font-inter">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">My Notifications</h1>

        {message && (
          <div
            className={`border px-4 py-3 rounded-lg mb-6 ${
              message.includes('successfully') || message.includes('granted') || message.includes('enabled')
                ? 'bg-green-100 border-green-400 text-green-700'
                : 'bg-red-100 border-red-400 text-red-700'
            }`}
            role="alert"
          >
            <span className="block text-sm sm:text-base">{message}</span>
          </div>
        )}

        {notifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12 sm:py-16">
              <BellRing className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-lg sm:text-xl font-semibold mb-2">No notifications yet</h2>
              <p className="text-gray-600 text-sm sm:text-base">
                You'll see updates about your orders and account here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {hasUnread && (
              <div className="flex justify-end mb-4">
                <Button
                  variant="outline"
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 text-xs sm:text-sm"
                >
                  <CheckCircle className="w-4 h-4" /> Mark All As Read
                </Button>
              </div>
            )}
            <div className="space-y-4">
              {notifications.map((notification) => {
                const items = parseNotificationItems(notification.message);
                const summaryLines = notification.message.split('\n').filter(line => !line.startsWith('- '));
                return (
                  <Card
                    key={notification.id}
                    className={`${
                      !notification.read ? 'border-blue-500 border-2' : 'border-gray-200'
                    }`}
                  >
                    <CardContent className="p-4 flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {notification.read ? (
                          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                        ) : (
                          <BellRing className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 animate-pulse" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3
                          className={`font-semibold text-sm sm:text-base ${
                            !notification.read ? 'text-gray-900' : 'text-gray-600'
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <p
                          className={`text-xs sm:text-sm mt-1 ${
                            !notification.read ? 'text-gray-700' : 'text-gray-500'
                          }`}
                        >
                          {summaryLines[0]}
                        </p>
                        {items.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs sm:text-sm font-semibold">Order Items:</p>
                            {items.map((item, itemIndex) => (
                              <div key={itemIndex} className="flex items-start space-x-3 mt-2">
                                <img
                                  src={item.images[imageIndices[notification.id]?.[itemIndex] || 0]}
                                  alt={item.title}
                                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/100x100/E0E0E0/808080?text=No+Image';
                                  }}
                                />
                                <div>
                                  <p className="text-xs sm:text-sm font-medium">{item.title}</p>
                                  <p className="text-xs text-gray-500">
                                    Price: Rs.{item.price.toFixed(2)} x {item.quantity}
                                  </p>
                                  <p className="text-xs text-gray-500">Category: {item.category}</p>
                                  <p className="text-xs text-gray-500">Unit: {item.unit}</p>
                                  <p className="text-xs text-gray-500">Type: {item.type}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <p
                          className={`text-xs sm:text-sm mt-2 ${
                            !notification.read ? 'text-gray-700' : 'text-gray-500'
                          }`}
                        >
                          {summaryLines.slice(1).join('\n')}
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
                          className="flex-shrink-0 text-blue-500 hover:text-blue-700 text-xs sm:text-sm"
                        >
                          Mark as Read
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}



