import { recordNotification } from './ErrorLog';
import { uuidv4 } from './random';

type NotificationType = 'default' | 'error' | 'warning' | 'success';

const notifications: Notification[] = new Array(0);
let currentModeMessage: Notification = null;
let notifying = false;

/**
 * Number of notifications to display at a time.
 */
const NUMBER_TO_DISPLAY = 3;

const notificationIcon: Record<NotificationType, string> = {
  default: '',
  warning: '⚠️ ',
  error: '🔴 ',
  success: '✅ ',
};

/**
 * A class to manage Neon notifications.
 */
export class Notification {
  message: string;
  displayed: boolean;
  id: string;
  isModeMessage: boolean;
  timeoutID: number;
  type: NotificationType;
  /**
   * Create a new notification.
   * @param message - Notification content.
   */
  constructor (message: string, type: NotificationType) {
    this.message = notificationIcon[type] + message;
    this.displayed = false;
    this.id = uuidv4();
    this.isModeMessage = message.search('Mode') !== -1;
    this.timeoutID = -1;
    this.type = type;
  }

  /** Set the ID from setTimeout. */
  setTimeoutId (id: number): void {
    this.timeoutID = Math.max(id, -1);
  }

  /** Display the Notification. */
  display (): void {
    this.displayed = true;
  }

  /**
   * @returns The UUID for this notification.
   */
  getId (): string {
    return this.id;
  }
}

/**
 * Clear the notifications if no more exist or display another from the queue.
 * @param currentId - The ID of the notification to be cleared.
 */
function clearOrShowNextNotification (currentId: string): void {
  document.getElementById(currentId).remove();
  if (currentModeMessage !== null && currentModeMessage.getId() === currentId) {
    currentModeMessage = null;
  }
  if (notifications.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    startNotification();
  } else if (document.querySelectorAll('.neon-notification').length === 0) {
    document.getElementById('notification-content').style.display = 'none';
    notifying = false;
  }
}

/**
 * Display a notification.
 * @param notification - Notification to display.
 */
function displayNotification (notification: Notification): void {
  if (notification.isModeMessage) {
    if (currentModeMessage === null) {
      currentModeMessage = notification;
    } else {
      window.clearTimeout(currentModeMessage.timeoutID);
      notifications.push(notification);
      clearOrShowNextNotification(currentModeMessage.getId());
      return;
    }
  }
  const notificationContent = document.getElementById('notification-content');
  const newNotification = document.createElement('div');
  newNotification.classList.add('neon-notification');
  newNotification.classList.add(`neon-notification-${notification.type}`);
  newNotification.id = notification.getId();
  newNotification.innerHTML = notification.message;
  notificationContent.append(newNotification);
  notificationContent.style.display = '';
  notification.display();
}

/**
 * Start displaying notifications. Called automatically.
 */
function startNotification (): void {
  if (notifications.length > 0) {
    notifying = true;
    const currentNotification = notifications.pop();
    displayNotification(currentNotification);
    currentNotification.setTimeoutId(
      window.setTimeout(clearOrShowNextNotification, 5000, currentNotification.getId())
    );
    document
      .getElementById(currentNotification.getId())
      .addEventListener('click', () => {
        window.clearTimeout(currentNotification.timeoutID);
        clearOrShowNextNotification(currentNotification.getId());
      });
  }
}

/**
 * Add a notification to the queue.
 * @param notification - Notification content.
 */
export function queueNotification (notification: string, type: NotificationType = 'default'): void {
  const notif = new Notification(notification, type);
  notifications.push(notif);

  if (notif.type == 'error' || notif.type == 'warning') {
    recordNotification(notif);
  }

  if (!notifying || document.getElementById('notification-content').querySelectorAll('.neon-notification').length < NUMBER_TO_DISPLAY) {
    startNotification();
  }
}

export default { queueNotification };
