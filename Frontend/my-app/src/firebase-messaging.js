// src/firebase-messaging.js
import { messaging } from "./firebase";
import { getToken, onMessage } from "firebase/messaging";

/**
 * Register the Firebase Service Worker
 * (must match the file name in public/)
 */
const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      console.log("✅ Service Worker registered successfully:", registration);
      return registration;
    } catch (err) {
      console.error("❌ Service Worker registration failed:", err);
    }
  } else {
    console.warn("Service workers are not supported in this browser.");
  }
};

/**
 * Request permission & get FCM token
 */
export const requestFcmToken = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.warn("🚫 Notification permission not granted by user.");
      return null;
    }

    // Wait for service worker to be registered before getting token
    const registration = await registerServiceWorker();

    // Get FCM token linked with service worker
    const token = await getToken(messaging, {
      vapidKey: process.env.REACT_APP_VAPID_KEY, // Your public VAPID key
      serviceWorkerRegistration: registration, // ✅ attach service worker registration
    });

    if (token) {
      console.log("✅ FCM Token generated:", token);
      return token;
    } else {
      console.warn("⚠️ No registration token available. Request permission again.");
      return null;
    }
  } catch (err) {
    console.error("❌ FCM token request failed:", err);
    return null;
  }
};

/**
 * Listen for foreground messages
 * (When the app is open and in focus)
 */
export const onFcmMessage = (callback) => {
  onMessage(messaging, (payload) => {
    console.log("📩 Foreground message received:", payload);
    if (callback) callback(payload);

    // Optional: show a notification popup while app is open
    if (payload.notification) {
      new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: payload.notification.icon,
      });
    }
  });
};
