// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

let db = null;

try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log("Firebase 配置成功");
} catch (error) {
  console.error("Firebase 配置失败:", error);
  // 创建一个模拟的数据库对象，用于本地测试
  db = {
    _saveGames: [],
    collection: () => ({
      // 模拟添加文档
      addDoc: async (data) => {
        const id = `local_${Date.now()}`;
        db._saveGames.push({ id, ...data });
        console.log("本地保存成功，ID:", id);
        return { id };
      },
      // 模拟查询
      query: () => ({
        orderBy: () => ({
          limit: () => ({
            getDocs: async () => ({
              empty: db._saveGames.length === 0,
              docs: db._saveGames.map(game => ({
                id: game.id,
                data: () => game
              }))
            })
          })
        })
      })
    })
  };
}

export { db };
