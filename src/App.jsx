import React, { useState } from 'react';

function App() {
  // ၁။ Flashcards စာရင်း State
  const [cards, setCards] = useState([
    { id: 1, thai: "สวัสดี", read: "Sawatdee", eng: "မင်္ဂလာပါ" },
    { id: 2, thai: "ขอบคุณ", read: "Khob khun", eng: "ကျေးဇူးတင်ပါတယ်" }
  ]);

  // ၂။ Form ထဲက စာသားများ State
  const [newEng, setNewEng] = useState(""); // မြန်မာစာ (အဓိပ္ပာယ်)
  const [newThai, setNewThai] = useState(""); // ထိုင်းစာ
  const [newRead, setNewRead] = useState(""); // အသံထွက်
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false); // ဘာသာပြန်နေစဉ် စောင့်ရန် State

  // 🔊 အသံထွက်ပေးမည့် Function
  const playSound = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th-TH';
    window.speechSynthesis.speak(utterance);
  };

  // 🤖 မြန်မာစာမှ ထိုင်းစာနှင့် အသံထွက်သို့ အလိုအလျောက် ပြောင်းပေးမည့် Function
  const autoTranslate = async () => {
    if (!newEng && !newThai) {
      alert("ကျေးဇူးပြု၍ မြန်မာစာ အဓိပ္ပာယ်ကို ပထမအကွက်တွင် အရင်ရိုက်ထည့်ပါဗျာ။");
      return;
    }

    setLoading(true);

    try {
      if (newEng) {
        // ၁။ မြန်မာစာမှ ထိုင်းစာသို့ ဘာသာပြန်ခြင်း
        const responseThai = await fetch(
          `https://translate.googleapis.com/translate_a/single?client=gtx&sl=my&tl=th&dt=t&dt=rm&q=${encodeURIComponent(newEng)}`
        );
        const dataThai = await responseThai.json();
        const translatedThai = dataThai[0]?.[0]?.[0] || "";
        setNewThai(translatedThai);

        // ၂။ ရရှိလာသော ထိုင်းစာမှ အသံထွက် (Phonetic Reading) ရယူခြင်း
        if (translatedThai) {
          const responsePhonetic = await fetch(
            `https://translate.googleapis.com/translate_a/single?client=gtx&sl=th&tl=my&dt=t&dt=rm&q=${encodeURIComponent(translatedThai)}`
          );
          const dataPhonetic = await responsePhonetic.json();
          const phoneticReading = dataPhonetic[0]?.[1]?.[3] || dataPhonetic[0]?.[0]?.[3] || "";
          setNewRead(phoneticReading);
        }
      } else if (newThai) {
        // ထိုင်းစာ အရင်ရိုက်ထားပါက မြန်မာစာသို့ ပြန်လှည့်ပေးခြင်း
        const response = await fetch(
          `https://translate.googleapis.com/translate_a/single?client=gtx&sl=th&tl=my&dt=t&dt=rm&q=${encodeURIComponent(newThai)}`
        );
        const data = await response.json();
        setNewEng(data[0]?.[0]?.[0] || "");
        setNewRead(data[0]?.[1]?.[3] || data[0]?.[0]?.[3] || "");
      }
    } catch (error) {
      alert("အလိုအလျောက် ဘာသာပြန်ရယူစဉ် အမှားအယွင်းရှိခဲ့ပါသည်။ ကိုယ်တိုင် ရိုက်ထည့်နိုင်ပါတယ်ဗျာ။");
    } finally {
      setLoading(false);
    }
  };

  // 💾 Card သိမ်းဆည်းသည့် Function
  const saveCard = (e) => {
    e.preventDefault();
    if (!newThai || !newEng) return;

    if (editingId) {
      setCards(cards.map(card => 
        card.id === editingId 
          ? { ...card, thai: newThai, read: newRead, eng: newEng }
          : card
      ));
      setEditingId(null);
    } else {
      const newCard = {
        id: Date.now(),
        thai: newThai,
        read: newRead,
        eng: newEng
      };
      setCards([...cards, newCard]);
    }

    setNewEng("");
    setNewThai("");
    setNewRead("");
  };

  const startEdit = (card) => {
    setEditingId(card.id);
    setNewEng(card.eng);
    setNewThai(card.thai);
    setNewRead(card.read);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewEng("");
    setNewThai("");
    setNewRead("");
  };

  const deleteCard = (id) => {
    setCards(cards.filter(card => card.id !== id));
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}> Thai Flashcards V3.1</h1>

      <form onSubmit={saveCard} style={styles.form}>
        <h3>{editingId ? "✏️ စာလုံး ပြန်ပြင်ရန်" : "➕ စာလုံးအသစ်ထည့်ရန်"}</h3>
        
        {/* ၁။ မြန်မာစာ အရင်ရိုက်သည့် အကွက် (Primary Input) */}
        <label style={styles.label}>၁။ မြန်မာစာ / အဓိပ္ပာယ် ရိုက်ပါ</label>
        <input 
          placeholder="ဥပမာ- ကျောင်း" 
          value={newEng} 
          onChange={(e) => setNewEng(e.target.value)}
          style={styles.input}
        />

        {/* --- အလိုအလျောက် ဘာသာပြန်ပေးသည့် ခလုတ် --- */}
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

        {/* ၂။ ထိုင်းစာ အကွက် (Auto-filled) */}
        <label style={styles.label}>၂။ ထိုင်းစာလုံး (အလိုအလျောက် ထွက်လာမည်)</label>
        <input 
          placeholder="ဥပမာ- โรงเรียน" 
          value={newThai} 
          onChange={(e) => setNewThai(e.target.value)}
          style={styles.input}
        />

        {/* ၃။ အသံထွက် အကွက် (Auto-filled) */}
        <label style={styles.label}>၃။ ထွက်သံ (အလိုအလျောက် ထွက်လာမည်)</label>
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
            Cancel
          </button>
        )}
      </form>

      <div style={styles.cardGrid}>
        {cards.map((card) => (
          <div key={card.id} style={styles.card}>
            <div style={styles.actionRow}>
              <button onClick={() => startEdit(card)} style={styles.iconBtn} title="ပြင်ရန်">✏️</button>
              <button onClick={() => deleteCard(card.id)} style={styles.iconBtn} title="ဖျက်ရန်">🗑️</button>
            </div>

            <div style={styles.cardTop}>
              <h2 style={styles.thaiText}>{card.thai}</h2>
              <button onClick={() => playSound(card.thai)} style={styles.speakerBtn} title="အသံဖွင့်ရန်">
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
  updateBtn: { width: '100%', padding: '10px', backgroundColor: '#ffc107', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '5px' },
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