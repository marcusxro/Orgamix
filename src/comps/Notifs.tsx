import { useEffect } from 'react';

const useNotification = () => {
  const notifyUser = (notificationText: string, url: string): void => {
    // Check if the browser supports notifications
    if (!("Notification" in window)) {
      alert("This browser doesn't support notifications.");
      return;
    }

    // Create a function to handle notification creation
    const createNotification = (): void => {
      const notification = new Notification(notificationText, {
        body: 'Click here for more details.',
        icon: '../../assets/UserNoProfile.jpg', // Add your icon path here
      });

      // Add onclick event
      notification.onclick = () => {
        window.open(url, '_blank'); // Open URL in a new tab
        notification.close(); // Close the notification
      };

      console.log("Notification displayed!"); // Confirm notification is displayed
    };

    // Handle the permission states
    if (Notification.permission === "granted") {
      createNotification();
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission()
        .then((permission: NotificationPermission) => {
          if (permission === "granted") {
            createNotification();
          }
        })
        .catch((error: Error) => {
          console.error("Failed to request notification permission:", error);
        });
    }
  };

  return { notifyUser };
};

export default useNotification;
