const indexedDb = window.indexedDB;

let db; 
const request = indexedDb.open("budget", 1);

request.onupgradeneeded = ({ target }) => {
    db = target.result;
    db.createObjectStore("pending", { autoIncrement: true })
};

request.onsuccess = ({ target }) => {
    db = target.result;
    if(navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = (e) => {
    console.log('Error')
};

const saveRecord = (record) => {
    const transaction = db.transaction(['pending'], 'readwrite');
    const store = transaction.objectStore('pending');

    store.add(record);
};

const checkDatabase = () => {
    const transaction = db.transaction(['pending'], 'readwrite');
    const store = transaction.objectStore('pending');
    const getAll = store.getAll();

    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */**',
                    "Content-Type": 'application/json'
                }
            })
            .then(() => {
                const transaction = db.transaction(['pending'], 'readwrite');
                const store = transaction.objectStore('pending');
                store.clear()
            })
        }
    }
}
window.addEventListener("online", checkDatabase);