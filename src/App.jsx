import React, { useState } from 'react';

function App() {
  // ၁။ Default Flashcards စာရင်း
  const [cards, setCards] = useState([
    { id: 1, thai: "สวัสดี", read: "Sawatdee", eng: "မင်္ဂလာပါ" },
    { id: 2, thai: "ขอบคุณ", read: "Khob khun", eng: "ကျေးဇူးတင်ပါတယ်" }
  ]);

  // ၂။ Form Inputs များအတွက် State
  const [newEng, setNewEng] = useState("");   // မြန်မာစာ (အဓိပ္ပာယ်)
  const [newThai, setNewThai] = useState(""); // ထိုင်းစာ
  const [newRead, setNewRead] = useState(""); // အသံထွက်
  const [editingId, setEditingId] = useState(null); // ပြင်ဆင်နေသည့် ID
  const [loading, setLoading] = useState(false);

  // 🔊 အသံထွက်ပေးမည့် Function
  const playSound = (text) => {
    if (!text) return;
    window.speechSynthesis.cancel(); // ရှိပြီးသား အသံများကို အရင်ရပ်မည်
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th-TH';
    window.speechSynthesis.speak(utterance);
  };

  // 🤖 မြန်မာစာမှ ထိုင်းစာနှင့် အသံထွက်သို့ အလိုအလျောက် ပြောင်းပေးမည့် Function
  const autoTranslate = async () => {
    if (!newEng.trim()) {
      alert("ကျေးဇူးပြု၍ မြန်မာစာ အဓိပ္ပာယ်ကို ပထမအကွက်တွင် အရင်ရိုက်ထည့်ပါဗျာ။");
      return;
    }

    setLoading(true);

    try {
      // ၁။ မြန်မာစာ -> ထိုင်းစာ ဘာသာပြန်ခြင်း
      const resThai = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=my&tl=th&dt=t&q=${encodeURIComponent(newEng)}`
      );
      const dataThai = await resThai.json();
      
      // ထိုင်းစာသီးသန့် စုစည်းထုတ်ယူခြင်း
      let fetchedThai = "";
      if (dataThai && dataThai[0]) {
        fetchedThai = dataThai[0].map(item => item[0]).join('').trim();
      }

      if (fetchedThai) {
        setNewThai(fetchedThai);

        // ၂။ ရရှိလာသော ထိုင်းစာ -> အသံထွက် (Phonetic Romanization) ရယူခြင်း
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

  // 💾 Card သစ် သိမ်းဆည်းခြင်း သို့မဟုတ် ပြင်ဆင်ခြင်း
  const saveCard = (e) => {
    e.preventDefault();
    if (!newThai.trim() || !newEng.trim()) {
      alert("ထိုင်းစာ နှင့် မြန်မာစာ အဓိပ္ပာယ် ဖြည့်သွင်းပေးပါဗျာ။");
      return;
    }

    if (editingId !== null) {
      // ပြင်ဆင်သည့် အဆင့် (Functional State Update သုံးထား၍ ချက်ချင်း အလုပ်လုပ်မည်)
      setCards(prevCards =>
        prevCards.map(card =>
          card.id === editingId
            ? { ...card, thai: newThai.trim(), read: newRead.trim(), eng: newEng.trim() }
            : card
        )
      );
      setEditingId(null);
    } else {
      // အသစ်ထည့်သည့် အဆင့်
      const newCard = {
        id: Date.now(),
        thai: newThai.trim(),
        read: newRead.trim(),
        eng: newEng.trim()
      };
      setCards(prevCards => [...prevCards, newCard]);
    }

    // Form ကို ပြန်ရှင်းပစ်မည်
    setNewEng("");
    setNewThai("");
    setNewRead("");
  };

  // ✏️ ပြင်ဆင်ရန် နှိပ်သည့်အခါ
  const startEdit = (card) => {
    setEditingId(card.id);
    setNewEng(card.eng);
    setNewThai(card.thai);
    setNewRead(card.read);
  };

  // ❌ ပြင်ဆင်ခြင်း ဖျက်သိမ်းရန်
  const cancelEdit = () => {
    setEditingId(null);
    setNewEng("");
    setNewThai("");
    setNewRead("");
  };

  // 🗑️ ဖျက်ရန်
  const deleteCard = (id) => {
    setCards(prevCards => prevCards.filter(card => card.id !== id));
  };

  return (
    <div style={styles.container} translate="no">
      <h1 style={styles.header}> Thai Flashcards V3.2</h1>

      {/* --- Form Section --- */}
      <form onSubmit={saveCard} style={styles.form}>
        <h3>{editingId ? "✏️ စာလုံး ပြန်ပြင်ရန်" : "➕ စာလုံးအသစ်ထည့်ရန်"}</h3>
        
        <label style={styles.label}>၁။ မြန်မာစာ / အဓိပ္ပာယ် ရိုက်ပါ</label>
        <input 
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

        <label style={styles.label}>၃။ ထွက်သံ / အသံထွက်</label>
        <input 
          placeholder="ဥပမာ- Rong riean" 
          value={newRead} 
          onChange={(e) => setNewRead(e.target.value)}
          style={styles.input}
        />

        <button type="submit" style={editingId ? styles.updateBtn : styles.saveBtn}>
          {editingId ? "Update Card" : "Save New Card"}
        </button>

        {editingId && (
          <button type="button" onClick={cancelEdit} style={styles.cancelBtn}>
            Cancel (မပြင်တော့ပါ)
          </button>
        )}
      </form>

      {/* --- Flashcard Display Section --- */}
      <div style={styles.cardGrid}>
        {cards.map((card) => (
          <div key={card.id} style={styles.card}>
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

// ဒီဇိုင်းသတ်မှတ်ချက်များ
const styles = {
  container: { padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh' },
  header: { textAlign: 'center', color: '#1a73e8' },
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