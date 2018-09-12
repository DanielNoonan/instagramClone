

//Open an indexDB 'database' and create an 'object store' in there.
let dbPromise = idb.open('posts-store', 1, (db) => {
    if(!db.objectStoreNames.contains('posts')) {
      db.createObjectStore('posts', {keyPath: 'id'});
    }
    if(!db.objectStoreNames.contains('sync-posts')) {
      db.createObjectStore('sync-posts', {keyPath: 'id'});
    }
  });
  //The variable dpPromise can now be used to open/access my database. Also IF the objectStore 'posts' does not exist then it will create one.

//Add data to the 'posts' database objectStore
const writeData = (st, data) => {
    return dbPromise
        .then((db) => {
            let tx = db.transaction(st, 'readwrite');
            let store = tx.objectStore(st);
            store.put(data);
            return tx.complete;
        });
}

const readAllData = (st) => {
    console.log('readAllData: ', st);
    return dbPromise
        .then((db) => {
            let tx = db.transaction(st, 'readonly');
            let store = tx.objectStore(st);
            return store.getAll();
        })
}

//Delete all the data in idexedDB everytime before writing data to it. This ensures that if data has been deleted from firebase then it will nolonger exist in indexedDB.
const clearAllData = (st) => {
    return dbPromise
        .then((db) => {
            let tx = db.transaction(st, 'readwrite');
            let store = tx.objectStore(st);
            store.clear();
            return tx.complete;
        })
}

//Delete just a specific item of data from indexedDB rather than deleting EVERY item from indexedDB as above.
const deleteItemFromData = (st, id) => {
    dbPromise
        .then((db) => {
            let tx = db.transaction(st, 'readwrite');
            let store = tx.objectStore(st);
            store.delete(id);
            return tx.complete;
        })
        .then(() => {
            console.log('indexedDB item deleted: ', id)
        })
}

//Turn Vapid Key from a Base64 string to a Uint8 Array which is what is needed to pass in the subscribe method in app.js
function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
  
    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);
  
    for (var i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }