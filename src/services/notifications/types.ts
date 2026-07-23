/**
 * Future notification adapters (Telegram, Discord, etc.) can implement this
 * interface without changing the screener core.
 */
export interface NotificationChannel {
  id: string;
  name: string;
  send(message: string): Promise<void>;
}

/** Registry reserved for future notification wiring. */
export const notificationChannels: NotificationChannel[] = [];
