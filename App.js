import { StyleSheet, Text, View, Button } from 'react-native';
import { connect, disconnect, socket } from './utils/socket_manager';

import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { useEffect, useState } from 'react';

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

const SOCKET_HANDLER = 'socket-handler';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

TaskManager.defineTask(SOCKET_HANDLER, async () => {
  const now = Date.now();
  console.log(
    `Got background fetch call at date: ${new Date(now).toISOString()}`
  );
  connect();

  socket.on('notification', (data) => {
    console.log(data);
    schedulePushNotification(data.title, data.body);
  });

  return BackgroundFetch.BackgroundFetchResult.NewData;
});

async function registerBackgroundFetchAsync() {
  return BackgroundFetch.registerTaskAsync(SOCKET_HANDLER, {
    minimumInterval: 1 * 60, // 15 minutes
    stopOnTerminate: false, // android only,
    startOnBoot: true, // android only
  });
}

async function unregisterBackgroundFetchAsync() {
  return BackgroundFetch.unregisterTaskAsync(SOCKET_HANDLER);
}

async function schedulePushNotification(title, body) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
      data: { data: 'goes here' },
    },
    trigger: { seconds: 1 },
  });
}

export default function App() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [status, setStatus] = useState(null);
  socket.on('notification', (data) => {
    console.log(data);
  });
  useEffect(() => {
    checkStatusAsync();
  }, []);
  const checkStatusAsync = async () => {
    const status = await BackgroundFetch.getStatusAsync();
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      SOCKET_HANDLER
    );

    setStatus(status);
    setIsRegistered(isRegistered);
  };

  const registerNotificationService = async () => {
    if (isRegistered) {
      await unregisterBackgroundFetchAsync();
    } else {
      await registerBackgroundFetchAsync();
    }

    checkStatusAsync();
  };
  return (
    <View style={{ marginTop: 100 }}>
      <View style={styles.textContainer}>
        <Text>
          Background fetch status:{' '}
          <Text style={{ fontWeight: 'bold' }}>
            {status && BackgroundFetch.BackgroundFetchStatus[status]}
          </Text>
        </Text>
        <Text>
          Background fetch task name:{' '}
          <Text style={{ fontWeight: 'bold' }}>
            {isRegistered ? SOCKET_HANDLER : 'Not registered yet!'}
          </Text>
        </Text>
      </View>
      <View style={styles.textContainer}></View>
      <Button
        title={
          isRegistered
            ? 'Unregister BackgroundFetch task'
            : 'Register BackgroundFetch task'
        }
        onPress={() => {
          registerNotificationService();
          schedulePushNotification();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
