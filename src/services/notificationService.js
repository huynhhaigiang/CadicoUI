import * as signalR from '@microsoft/signalr'

const connectNotificationHub = (token, onMessageReceived) => {
  const connection = new signalR.HubConnectionBuilder()
    .withUrl('https://quanlitiendoapi.cadico.vn/notificationHub', {
      accessTokenFactory: () => token,
    })
    .withAutomaticReconnect()
    .build()

  connection
    .start()
    .then(() => console.log('Connected to Notification Hub'))
    .catch(err => console.error('Connection failed: ', err))

  connection.on('ReceiveNotification', message => {
    onMessageReceived(message)
  })

  return connection
}

export default connectNotificationHub
