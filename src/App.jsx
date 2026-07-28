import React, { useState, useEffect, useRef } from 'react';
import { auth, googleProvider, db } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';

function App() {
  const [user, setUser] = useState(null);
  const [cards, setCards] = useState([]);

  const [newEng, setNewEng] = useState("");   // မြန်မာစာ
  const [newThai, setNewThai] = useState(""); // ထိုင်းစာ
  const [newRead, setNewRead] = useState(""); // အသံထွက်
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // 🔑 Element သို့ တိုက်ရိုက် ရောက်ရှိရန် Refs များ
  const formRef = useRef(null);
  const engInputRef = useRef(null);

  // 🔑 User Login စောင့်ကြည့်ခြင်း နှင့် မူလ Data များ ဖတ်ယူခြင်း
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchCloudCards(currentUser.uid);
      } else {
        loadLocalCards();
      }
      setIsLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  // LocalStorage မှ Data ဖတ်ခြင်း
  const loadLocalCards = () => {
    const savedCards = localStorage.getItem('my_thai_flashcards');
    if (savedCards) {
      try {
        setCards(JSON.parse(savedCards));
      } catch (e) {
        console.error("Saved data error", e);
      }
    } else {
      setCards([
        { id: 1, thai: "สวัสดี", read: "Sawatdee", eng: "မင်္ဂလာပါ" },
        { id: 2, thai: "ขอบคุณ", read: "Khob khun", eng: "ကျေးဇူးတင်ပါတယ်" }
      ]);
    }
  };

  // Cloud Firestore မှ Data ဖတ်ခြင်း
  const fetchCloudCards = async (userId) => {
    try {
      const q = query(collection(db, "flashcards"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const cloudCards = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));

      if (cloudCards.length === 0) {
        const savedCards = localStorage.getItem('my_thai_flashcards');
        const defaultData = savedCards ? JSON.parse(savedCards) : [
          { thai: "สวัสดี", read: "Sawatdee", eng: "မင်္ဂလာပါ" },
          { thai: "ขอบคุณ", read: "Khob khun", eng: "ကျေးဇူးတင်ပါတယ်" }
        ];

        const uploadedCards = [];
        for (const card of defaultData) {
          const docRef = await addDoc(collection(db, "flashcards"), {
            thai: card.thai,
            read: card.read,
            eng: card.eng,
            userId: userId,
            createdAt: Date.now()
          });
          uploadedCards.push({ id: docRef.id, thai: card.thai, read: card.read, eng: card.eng });
        }
        setCards(uploadedCards);
      } else {
        setCards(cloudCards);
      }
    } catch (error) {
      console.error("Cloud Error:", error);
      alert("Cloud Database သို့ ချိတ်ဆက်ရာတွင် အမှားအယွင်း ရှိနေပါသည်: " + error.message);
    }
  };

  // LocalStorage သိမ်းဆည်းခြင်း
  useEffect(() => {
    if (isLoaded && !user) {
      localStorage.setItem('my_thai_flashcards', JSON.stringify(cards));
    }
  }, [cards, user, isLoaded]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      alert("Login ဝင်ရတာ အဆင်မပြေပါဗျာ: " + error.message);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const playSound = (text) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th-TH';
    window.speechSynthesis.speak(utterance);
  };

  const autoTranslate = async () => {
    if (!newEng.trim()) {
      alert("ကျေးဇူးပြု၍ မြန်မာစာ အဓိပ္ပာယ်ကို ပထမအကွက်တွင် အရင်ရိုက်ထည့်ပါဗျာ။");
      return;
    }

    setLoading(true);

    try {
      const resThai = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=my&tl=th&dt=t&q=${encodeURIComponent(newEng)}`
      );
      const dataThai = await resThai.json();
      
      let fetchedThai = "";
      if (dataThai && dataThai[0]) {
        fetchedThai = dataThai[0].map(item => item[0]).join('').trim();
      }

      if (fetchedThai) {
        setNewThai(fetchedThai);

        const resRead = await fetch(
          `https://translate.googleapis.com/translate_a/single?client=gtx&sl=th&tl=en&dt=rm&q=${encodeURIComponent(fetchedThai)}`
        );
        const dataRead = await resRead.json();
        
        let fetchedRead = "";
        if (dataRead && dataRead[0]) {
          for (let item of dataRead[0]) {
            if (item && item[3]) {
              fetchedRead += item[3] + " ";
            }
          }
        }
        setNewRead(fetchedRead.trim());
      }
    } catch (error) {
      alert("အလိုအလျောက် ဘာသာပြန်ရယူစဉ် အမှားအယွင်းရှိခဲ့ပါသည်။ ကိုယ်တိုင် ပြင်ဆင်ရိုက်ထည့်နိုင်ပါတယ်ဗျာ။");
    } finally {
      setLoading(false);
    }
  };

  // 💾 Card သိမ်းဆည်းခြင်း / ပြင်ဆင်ခြင်း
  const saveCard = async (e) => {
    e.preventDefault();
    
    if (!newThai.trim() || !newEng.trim()) {
      alert("ထိုင်းစာ နှင့် မြန်မာစာ အဓိပ္ပာယ် ဖြည့်သွင်းပေးပါဗျာ။");
      return;
    }

    const cardData = {
      thai: newThai.trim(),
      read: newRead.trim(),
      eng: newEng.trim()
    };

    let targetCardId = null;

    try {
      if (editingId !== null) {
        targetCardId = editingId;
        if (user) {
          await updateDoc(doc(db, "flashcards", editingId), cardData);
        }
        setCards(prevCards =>
          prevCards.map(card =>
            card.id === editingId ? { ...card, ...cardData } : card
          )
        );
        setEditingId(null);
      } else {
        if (user) {
          const docRef = await addDoc(collection(db, "flashcards"), {
            ...cardData,
            userId: user.uid,
            createdAt: Date.now()
          });
          targetCardId = docRef.id;
          const newCard = { id: docRef.id, ...cardData };
          setCards(prevCards => [...prevCards, newCard]);
        } else {
          targetCardId = Date.now();
          const newCard = { id: targetCardId, ...cardData };
          setCards(prevCards => [...prevCards, newCard]);
        }
      }

      setNewEng("");
      setNewThai("");
      setNewRead("");

      // ⚡ Save/Update ပြီးပါက လှုပ်ရှားမှု မပါဘဲ အဆိုပါ Card သို့ ချက်ချင်း လျှပ်တစ်ပြက် ပြောင်းလဲပြသမည်
      setTimeout(() => {
        const cardElement = document.getElementById(`card-${targetCardId}`);
        if (cardElement) {
          cardElement.scrollIntoView({ behavior: 'auto', block: 'center' });
        }
      }, 50);

    } catch (err) {
      console.error("Save Error:", err);
      alert("Cloud သို့ သိမ်းဆည်းရာတွင် အမှားတစ်ခု ရှိနေပါသည်: " + err.message);
    }
  };

  // ✏️ စာလုံး ပြန်ပြင်ရန် ခလုတ်နှိပ်သည့်အခါ
  const startEdit = (card) => {
    setEditingId(card.id);
    setNewEng(card.eng);
    setNewThai(card.thai);
    setNewRead(card.read);

    // ⚡ လှုပ်ရှားမှု မပါဘဲ စာရိုက်သည့် ဖောင်ဆီသို့ ချက်ချင်း လျှပ်တစ်ပြက် ပြောင်းလဲပြသမည်
    formRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' });

    // 🎯 စာရိုက်ကွက်ထဲသို့ Cursor ချက်ချင်း ထည့်ပေးမည်
    engInputRef.current?.focus();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewEng("");
    setNewThai("");
    setNewRead("");
  };

  const deleteCard = async (id) => {
    try {
      if (user) {
        await deleteDoc(doc(db, "flashcards", id));
      }
      setCards(prevCards => prevCards.filter(card => card.id !== id));
    } catch (err) {
      alert("Card ဖျက်ရာတွင် အမှားရှိပါသည်: " + err.message);
    }
  };

  return (
    <div style={styles.container} translate="no">
      <h1 style={styles.header}> Thai Flashcards V3.3</h1>
      <div style={styles.userBar}>
        {user ? (
          <div style={styles.userInfo}>
            <span>👤 <b>{user.displayName}</b> (အမြဲတမ်းအသုံးပြုလို့ရပါပြီ)</span>
            <button type="button" onClick={handleLogout} style={styles.logoutBtn}>
              Logout ထွက်မည်
            </button>
          </div>
        ) : (
          <div style={styles.userInfo}>
            <span>☁️အမြဲတမ်း အသုံးပြုရန် Login ဝင်ပါ</span>
            <button type="button" onClick={handleGoogleLogin} style={styles.loginBtn}>
              🔑 Google Account ဖြင့် ဝင်မည်
            </button>
          </div>
        )}
      </div>

      <form ref={formRef} onSubmit={saveCard} style={styles.form}>
        <h3>{editingId ? "✏️ စာလုံး ပြန်ပြင်ရန်" : "➕ စာလုံးအသစ်ထည့်ရန်"}</h3>
        
        <label style={styles.label}>၁။ မြန်မာစာ / အဓိပ္ပာယ် ရိုက်ပါ</label>
        <input 
          ref={engInputRef}
          placeholder="ဥပမာ- ကျောင်း" 
          value={newEng} 
          onChange={(e) => setNewEng(e.target.value)}
          style={styles.input}
        />

        <div style={styles.autoRow}>
          <button 
            type="button" 
            onClick={autoTranslate} 
            disabled={loading}
            style={styles.autoBtn}
          >
            {loading ? "⏳ ထိုင်းစာနှင့် အသံထွက် ရယူနေသည်..." : "✨ ထိုင်းစာနှင့် အသံထွက် အလိုအလျောက် ဖြည့်မည်"}
          </button>
        </div>

        <label style={styles.label}>၂။ ထိုင်းစာလုံး</label>
        <input 
          placeholder="ဥပမာ- โรงเรียน" 
          value={newThai} 
          onChange={(e) => setNewThai(e.target.value)}
          style={styles.input}
          translate="no"
        />

        <label style={styles.label}>၃။  အသံထွက်</label>
        <input 
          placeholder="ဥပမာ- Rong riean" 
          value={newRead} 
          onChange={(e) => setNewRead(e.target.value)}
          style={styles.input}
        />

        <button type="submit" style={editingId ? styles.updateBtn : styles.saveBtn}>
          {editingId ? "Update Card (ပြင်ဆင်ချက်များ သိမ်းမည်)" : "Save New Card (အသစ်သိမ်းမည်)"}
        </button>

        {editingId && (
          <button type="button" onClick={cancelEdit} style={styles.cancelBtn}>
            Cancel (မပြင်တော့ပါ)
          </button>
        )}
      </form>

      <div style={styles.cardGrid}>
        {cards.map((card) => (
          <div key={card.id} id={`card-${card.id}`} style={styles.card}>
            <div style={styles.actionRow}>
              <button type="button" onClick={() => startEdit(card)} style={styles.iconBtn} title="ပြင်ရန်">✏️</button>
              <button type="button" onClick={() => deleteCard(card.id)} style={styles.iconBtn} title="ဖျက်ရန်">🗑️</button>
            </div>

            <div style={styles.cardTop}>
              <h2 style={styles.thaiText} translate="no">{card.thai}</h2>
              <button type="button" onClick={() => playSound(card.thai)} style={styles.speakerBtn} title="အသံဖွင့်ရန်">
                🔊
              </button>
            </div>
            <p style={styles.readText}><i>({card.read})</i></p>
            <hr style={{ border: '0.5px solid #eee' }} />
            <p style={styles.engText}>{card.eng}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh' },
  header: { textAlign: 'center', color: '#1a73e8', marginBottom: '10px' },
  userBar: {
    backgroundColor: '#fff', padding: '12px 20px', borderRadius: '10px',
    maxWidth: '500px', margin: '0 auto 20px', boxShadow: '0 1px 5px rgba(0,0,0,0.08)'
  },
  userInfo: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '14px' },
  loginBtn: { padding: '8px 14px', backgroundColor: '#4285F4', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  logoutBtn: { padding: '6px 12px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  form: { 
    backgroundColor: '#fff', padding: '20px', borderRadius: '12px', 
    maxWidth: '500px', margin: '0 auto 30px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
  },
  label: { fontSize: '13px', color: '#555', fontWeight: 'bold', display: 'block', marginBottom: '4px' },
  input: { width: '100%', padding: '10px', marginBottom: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' },
  autoRow: { marginBottom: '15px' },
  autoBtn: { 
    width: '100%', padding: '10px', backgroundColor: '#6f42c1', color: '#fff', 
    border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' 
  },
  saveBtn: { width: '100%', padding: '10px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  updateBtn: { width: '100%', padding: '10px', backgroundColor: '#ffc107', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '8px' },
  cancelBtn: { width: '100%', padding: '8px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' },
  card: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', position: 'relative' },
  actionRow: { display: 'flex', justifyContent: 'flex-end', gap: '5px' },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' },
  cardTop: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '5px' },
  thaiText: { fontSize: '28px', margin: 0, color: '#333' },
  speakerBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' },
  readText: { color: '#666', margin: '10px 0' },
  engText: { fontSize: '20px', fontWeight: 'bold', color: '#1a73e8' }
};

export default App;