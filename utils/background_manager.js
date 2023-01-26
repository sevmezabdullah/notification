import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

const SOCKET_HANDLER = 'socket-handler';

TaskManager.defineTask(SOCKET_HANDLER, async () => {
  const now = Date.now();
  console.log(
    `Got background fetch call at date: ${new Date(now).toISOString()}`
  );
  connect();
  return BackgroundFetch.BackgroundFetchResult.NewData;
});
