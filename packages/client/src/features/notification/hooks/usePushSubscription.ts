import { useCallback, useEffect, useState } from 'react';
import {
  useSavePushSubscriptionMutation,
  useDeletePushSubscriptionMutation,
} from '../notificationApi';
import { useToast } from '../../../shared/hooks/useToast';

const isPushSupported = (): boolean =>
  'serviceWorker' in navigator && 'PushManager' in window;

const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
};

const toSubscriptionInput = (subscription: PushSubscription) => {
  const json = subscription.toJSON();
  return {
    endpoint: json.endpoint as string,
    keys: {
      p256dh: json.keys?.['p256dh'] as string,
      auth: json.keys?.['auth'] as string,
    },
    userAgent: navigator.userAgent,
  };
};

export const usePushSubscription = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [showPermissionGuidance, setShowPermissionGuidance] = useState(false);
  const [savePushSubscription] = useSavePushSubscriptionMutation();
  const [deletePushSubscription] = useDeletePushSubscriptionMutation();
  const { addToast } = useToast();

  useEffect(() => {
    if (!isPushSupported()) return;

    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => setIsSubscribed(!!subscription))
      .catch(() => setIsSubscribed(false));
  }, []);

  const subscribe = useCallback(async (): Promise<void> => {
    const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!isPushSupported() || !publicKey) return;

    if (Notification.permission === 'denied') {
      setShowPermissionGuidance(true);
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      if (permission === 'denied') setShowPermissionGuidance(true);
      return;
    }

    // Optimistic: flip the toggle on immediately once permission is granted.
    // Registering the service worker and saving the subscription happen in
    // the background — only roll back if one of those actually fails.
    setIsSubscribed(true);
    setIsSubscribing(true);

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });

      await savePushSubscription(toSubscriptionInput(subscription)).unwrap();
    } catch {
      setIsSubscribed(false);
      addToast('Could not enable push notifications. Please try again.', 'error');
    } finally {
      setIsSubscribing(false);
    }
  }, [savePushSubscription, addToast]);

  const unsubscribe = useCallback(async (): Promise<void> => {
    if (!isPushSupported()) return;

    setIsSubscribed(false);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) return;

      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      await deletePushSubscription({ endpoint }).unwrap();
    } catch {
      setIsSubscribed(true);
      addToast('Could not disable push notifications. Please try again.', 'error');
    }
  }, [deletePushSubscription, addToast]);

  const dismissPermissionGuidance = useCallback(
    () => setShowPermissionGuidance(false),
    []
  );

  return {
    isSupported: isPushSupported(),
    isSubscribed,
    isSubscribing,
    showPermissionGuidance,
    subscribe,
    unsubscribe,
    dismissPermissionGuidance,
  };
};
