// Push Notification Manager for Web
class PushNotificationManager {
  constructor() {
    this.token = null;
    this.permission = Notification.permission;
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
  }

  async init() {
    if (!this.isSupported) {
      console.log('Push notifications not supported');
      return false;
    }

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('SW registered:', registration);

      // Initialize Firebase
      await this.initFirebase(registration);
      
      return true;
    } catch (error) {
      console.error('Push init error:', error);
      return false;
    }
  }

  async initFirebase(registration) {
    // Load Firebase scripts dynamically
    await this.loadScript('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
    await this.loadScript('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

    // TODO: Replace with your Firebase config
    firebase.initializeApp({
      apiKey: "YOUR_API_KEY",
      authDomain: "your-project.firebaseapp.com",
      projectId: "your-project",
      messagingSenderId: "123456789",
      appId: "1:123456789:web:abcdef"
    });

    const messaging = firebase.messaging();

    try {
      this.token = await messaging.getToken({ 
        vapidKey: 'YOUR_VAPID_KEY',
        serviceWorkerRegistration: registration 
      });
      
      console.log('FCM Token:', this.token);
      await this.sendTokenToServer(this.token);

      // Handle token refresh
      messaging.onTokenRefresh(async () => {
        this.token = await messaging.getToken({ vapidKey: 'YOUR_VAPID_KEY' });
        await this.sendTokenToServer(this.token);
      });

      // Handle foreground messages
      messaging.onMessage((payload) => {
        console.log('Foreground message:', payload);
        this.showInAppNotification(payload);
      });

    } catch (error) {
      console.error('Failed to get FCM token:', error);
    }
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async requestPermission() {
    if (!this.isSupported) return false;
    
    const permission = await Notification.requestPermission();
    this.permission = permission;
    
    if (permission === 'granted') {
      await this.init();
      return true;
    }
    
    return false;
  }

  showInAppNotification(payload) {
    // Show custom in-app notification instead of system notification
    const { title, body } = payload.notification;
    
    const notification = document.createElement('div');
    notification.className = 'in-app-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <strong>${title}</strong>
        <p>${body}</p>
      </div>
      <button class="notification-close">×</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => notification.remove(), 5000);
    
    notification.querySelector('.notification-close').onclick = () => {
      notification.remove();
    };
  }

  async sendTokenToServer(token) {
    // Send token to your backend
    try {
      await fetch('https://your-api.com/api/registerToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          platform: 'web',
          userId: localStorage.getItem('user_id') || generateUserId()
        })
      });
    } catch (error) {
      console.error('Failed to send token:', error);
    }
  }

  async subscribeToRoute(routeId) {
    // Subscribe to FCM topic or update server preferences
    const subscriptions = JSON.parse(localStorage.getItem('push_subscriptions') || '[]');
    if (!subscriptions.includes(routeId)) {
      subscriptions.push(routeId);
      localStorage.setItem('push_subscriptions', JSON.stringify(subscriptions));
    }
    
    // Update server
    await fetch('https://your-api.com/api/updateSubscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: this.token,
        routes: subscriptions
      })
    });
  }

  scheduleReminder(routeId, direction, time) {
    // Request server to schedule push notifications
    return fetch('https://your-api.com/api/scheduleBusReminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: this.token,
        routeId,
        direction,
        departureTime: time,
        reminderMinutes: [10, 5, 1]
      })
    });
  }
}

function generateUserId() {
  const id = 'user_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('user_id', id);
  return id;
}

// Initialize
const pushManager = new PushNotificationManager();

// Add styles for in-app notifications
const style = document.createElement('style');
style.textContent = `
  .in-app-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    padding: 16px 20px;
    max-width: 320px;
    z-index: 10000;
    animation: slideIn 0.3s ease;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  .in-app-notification strong {
    color: #333;
    font-size: 0.95rem;
  }
  
  .in-app-notification p {
    color: #666;
    font-size: 0.85rem;
    margin: 4px 0 0 0;
  }
  
  .notification-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #999;
    cursor: pointer;
    padding: 0;
    margin-left: auto;
  }
  
  .push-prompt {
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: #667eea;
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(102,126,234,0.4);
    display: flex;
    align-items: center;
    gap: 16px;
    z-index: 1000;
  }
  
  .push-prompt button {
    background: white;
    color: #667eea;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
  }
`;
document.head.appendChild(style);
