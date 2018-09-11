
var deferredPrompt;
let enableNotificationsButtons = document.querySelectorAll('.enable-notifications');

if (!window.Promise) {
  window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(function () {
      console.log('Service worker registered!');
    })
    .catch(function(err) {
      console.log(err);
    });
}

window.addEventListener('beforeinstallprompt', function(event) {
  console.log('beforeinstallprompt fired');
  event.preventDefault();
  deferredPrompt = event;
  return false;
});

// Notification.requestPermission() with a callback function now deprecated. Now it is promise based. Re-written below.
// const askForNotificationPermission = () => {
//   Notification.requestPermission((result) => {
//     console.log('User has chosen:', result);
//     if (result !== 'granted') {
//       console.log('No notification permission granted');
//     } else {
          // Permission granted
          // Hide Button
//     }
//   });
// }

const displayConfirmNotification = () => {
  let options = {
    body: 'You successfully subscribed to our notification service'
  };
  new Notification('Successfully Subscribed!', options);
}

const askForNotificationPermission = () => {
  Notification.requestPermission()
    .then((result) => {
      console.log('User has chosen:', result);
      if (result === 'denied') {
        console.log('No notification permission granted');
        return;
      }
      if (result === 'default') {
        console.log('Permission request was dismissed');
        return;
      }

      // Permision granted.
      // Hide Button.
      console.log('We have lift off!');
      displayConfirmNotification();

    })
}

if ('Notification' in window) {
  for (let i = 0; i < enableNotificationsButtons.length; i++) {
    enableNotificationsButtons[i].style.display = 'inline-block';
    enableNotificationsButtons[i].addEventListener('click', askForNotificationPermission);
  }
}