import notifee, {
  AuthorizationStatus,
  EventType,
  Notification,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';
// import * as RootNavigation from './RootNavigation';

class Notifications {
  constructor() {
    this.bootstrap();

    notifee.onForegroundEvent(({type, detail}) => {
      switch (type) {
        case EventType.DISMISSED:
          console.debug('User dismissed notification', detail.notification);
          break;
        case EventType.PRESS:
          console.debug('User pressed notification', detail.notification);
          this.handleNotificationOpen(detail.notification as Notification);
          break;
      }
    });

    notifee.onBackgroundEvent(async ({type, detail}) => {
      const {notification} = detail;
      console.debug('Notification received: background', type, detail);
      if (notification) {
        this.handleNotificationOpen(notification);
      }
    });

    notifee
      .getTriggerNotificationIds()
      .then(ids => {
        console.debug('All trigger notifications: ', ids);
      });
    notifee
      .getTriggerNotifications()
      .then(notifications => {
        console.debug('All trigger notifications: ', notifications);
      });
    // notifee.cancelAllNotifications()
  }

  public handleNotificationOpen(notification: Notification) {
    const {data} = notification;
    console.debug('Notification received: foreground', data);
    // RootNavigation.navigate('Detail', {savedReminder: data?.details});
  }

  public async bootstrap() {
    const initialNotification = await notifee.getInitialNotification();

    if (initialNotification) {
      console.debug('Notification caused application to open', initialNotification.notification,);
      console.debug('Press action used to open the app', initialNotification.pressAction,);
      this.handleNotificationOpen(initialNotification.notification);
    }
  }

  public async checkPermissions() {
    const settings = await notifee.requestPermission();

    if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
      console.debug('Permission settings:', settings);
      return true;
    } else {
      console.debug('User declined permissions');
      return false;
    }
  }

  public async scheduleNotification({
    reminder,
    delay
  }: {
    reminder: string;
    delay: number;
  }) {
    const hasPermissions = await this.checkPermissions();

    var notifyAt = new Date(); // get current date
    notifyAt.setSeconds(notifyAt.getSeconds() + delay);
    
    if (hasPermissions) {
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: +notifyAt,
      };

      await notifee.createTriggerNotification(
        {
          id: '1',
          title: `🔔 Please check for any FaceID requests -  ${reminder}`,
          body: 'Tap on it to check',
          android: {
            channelId: 'reminder',
            pressAction: {
              id: 'default',
            },
          },
          data: {
            id: '1',
            action: 'reminder',
            details: {
              name: reminder,
              date: notifyAt.toString(),
            },
          },
        },
        trigger,
      );
    }
  }

  public async cancelNotification() {
    await notifee.cancelNotification('1');
  }
}

export default new Notifications();