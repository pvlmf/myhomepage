const DB_NAME = "HomePageMemoDB";
const DB_VERSION = 2;
const STORE_NAME = "memo";
const MEMO_KEY = "current_memo";

let db = null;

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (db.objectStoreNames.contains(STORE_NAME)) {
        db.deleteObjectStore(STORE_NAME);
      }
      db.createObjectStore(STORE_NAME, { keyPath: "id" });
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onerror = (event) => {
      console.error("indexedDB error", event.target.error);
      reject(event.target.error);
    };
  });
}

function loadMemo() {
  if (!db) return;

  const transaction = db.transaction([STORE_NAME], "readonly");
  const store = transaction.objectStore(STORE_NAME);
  const request = store.get(MEMO_KEY);

  request.onsuccess = () => {
    if (request.result) {
      document.getElementById("memo-input").value = request.result.content;
    }
  };

  request.onerror = (event) => {
    console.error("failed to get memo", event.target.error);
  };
}

function saveMemo() {
  if (!db) return;

  const memoText = document.getElementById("memo-input").value;
  const transaction = db.transaction([STORE_NAME], "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  const memoData = {
    id: MEMO_KEY,
    content: memoText,
    updateAt: new Date().toISOString(),
  };

  const request = store.put(memoData);

  request.onsuccess = () => {
    const status = document.getElementById("save-status");
    status.textContent = "保存しました。";
    status.style.opacity = "1";

    setTimeout(() => {
      status.style.opacity = "0";
    }, 2000);
  };

  request.onerror = (event) => {
    console.error("failed to save memo", event.target.error);
  };
}

function clearMemo() {
  if (!db) return;
  const tx = db.transaction([STORE_NAME], "readwrite");
  tx.objectStore(STORE_NAME).delete(MEMO_KEY);
  document.getElementById("memo-input").value = "";
}

async function main() {
  await initDB();
  await loadMemo();

  document.getElementById("saveMemo").addEventListener("click", saveMemo);
  document.getElementById("clearMemo").addEventListener("click", clearMemo);
}

main();
