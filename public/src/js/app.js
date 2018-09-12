
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
  if ('serviceWorker' in navigator) {
    let options = {
      body: 'You successfully subscribed to our notification service',
      icon: '/src/images/icons/app-icon-96x96.png',
      image: '/src/images/sf-boat.jpg',
      dir: 'ltr',
      lang: 'en-US', // BCP 47 compliant language code
      vibrate: [100, 50, 200],
      badge: '/src/images/icons/app-icon-96x96.png',
      tag: 'confirm-notification',
      renotify: true,
      actions: [
        { action: 'confirm', title: 'Okay', icon: '/src/images/icons/app-icon-96x96.png' },
        { action: 'cancel', title: 'Cancel', icon: '/src/images/icons/app-icon-96x96.png' }
      ]
    };

    navigator.serviceWorker.ready
      .then((swreg) => {
        swreg.showNotification('Successfully subscribed!', options);
      });
  }
}

const configurePushSub = () => {
  if (!('serviceWoker' in navigator)) {
    return;
  }

  let reg;
  navigator.serviceWorker.ready
    .then((swreg) => {
      reg = swreg;
      return swreg.pushManager.getSubscription();
    })
    .then((sub) => {
      if (sub === null) {
        // Create a new subscription
        let vapidPublicKey = 'BOldvj-FCVW2AyEXuut2TRtIgzXoXzITel4H3K6WZ2-gdi28qDzHee0XVwIZlnAdInQl49_tGr88VKdN4iNlFvk';
        let convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
        return reg.pushManager.subscribe({
          userVisibility: true,
          applicationServerKey: convertedVapidPublicKey
        });
      } else {
        // We have a subscription
      }
    })
    .then((newSub) => {
      return fetch('https://instagramclonepwa.firebaseio.com/subscriptions.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(newSub)
      })
    })
    .then((res) => {
      if (res.ok) {
        displayConfirmNotification();
      }
    })
    .catch((err) => {
      console.log(err);
    });
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
      configurePushSub();
      // displayConfirmNotification();

    })
}

if ('Notification' in window && 'serviceWorker' in navigator) {
  for (let i = 0; i < enableNotificationsButtons.length; i++) {
    enableNotificationsButtons[i].style.display = 'inline-block';
    enableNotificationsButtons[i].addEventListener('click', askForNotificationPermission);
  }
}