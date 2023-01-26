import io from 'socket.io-client';
export const socket = io('http://192.168.1.115:3000');

export const connect = async () => {
  socket.connect();
};

export const messageToServer = async (listener, data) => {
  socket.emit(listener, data);
};

export const checkNotification = async () => {
  let notificationData;
  socket.on('notification', (data) => {
    notificationData = data;
    console.log('Notification : ', data);
    return data;
  });
  return notificationData;
};
export const disconnect = async () => {
  socket.disconnect();
};
