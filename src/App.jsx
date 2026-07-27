import React, { useState } from 'react';

function App() {
  // ၁။ Flashcards စာရင်း State
  const [cards, setCards] = useState([
    { id: 1, thai: "สวัสดี", read: "Sawatdee", eng: "Hello" },
    { id: 2, thai: "ขอบคุณ", read: "Khob khun", eng: "Thank you" }
  ]);

  // ၂။ Form ထဲက စာသားများ State
  const [newThai, setNewThai] = useState("");
  const [newRead, setNewRead] = useState("");
  const [newEng, setNewEng] = useState("");

  // ၃။ ပြင်ဆင်နေသည့် Card ၏ ID ကို မှတ်ထားရန် State (Edit Mode)
  const [editingId, setEditingId] = useState(null);

  // ၄။ အသံထွက်ပေးမည့် Function
  const playSound = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th-TH';
    window.speechSynthesis.speak(utterance);
  };

  // ၅။ Card အသစ်သိမ်းရန် သို့မဟုတ် ရှိပြီးသားကို ပြင်ရန် Function
  const saveCard = (e) => {
    e.preventDefault();
    if (!newThai || !newEng) return;

    if (editingId) {
      // ပြင်ဆင်သည့် အဆင့် (Update Existing Card)
      setCards(cards.map(card => 
        card.id === editingId 
          ? { ...card, thai: newThai, read: newRead, eng: newEng }
          : card
      ));
      setEditingId(null); // Edit mode မှ ထွက်မည်
    } else {
      // စာလုံးအသစ် ထည့်သည့် အဆင့် (Add New Card)
      const newCard = {
        id: Date.now(),
        thai: newThai,
        read: newRead,
        eng: newEng
      };
      setCards([...cards, newCard]);
    }

    // Form စာသားများ ပြန်ရှင်းခြင်း
    setNewThai("");
    setNewRead("");
    setNewEng("");
  };

  // ၆။ ပြင်ဆင်ခြင်း စတင်ရန် (Edit mode သို့ ပြောင်းရန်)
  const startEdit = (card) => {
    setEditingId(card.id);
    setNewThai(card.thai);
    setNewRead(card.read);
    setNewEng(card.eng);
  };

  // ၇။ ပြင်ဆင်ခြင်းကို ဖျက်သိမ်းရန် (Cancel Edit)
  const cancelEdit = () => {
    setEditingId(null);
    setNewThai("");
    setNewRead("");
    setNewEng("");
  };

  // ၈။ Card ကို ဖျက်ရန် Function (Delete)
  const deleteCard = (id) => {
    setCards(cards.filter(card => card.id !== id));
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}> Thai Flashcards V2.1</h1>

      {/* --- စာလုံးအသစ်ထည့်/ပြင်သည့် Form --- */}
      <form onSubmit={saveCard} style={styles.form}>
        <h3>{editingId ? "✏️ စာလုံး ပြန်ပြင်ရန်" : "➕ စာလုံးအသစ်ထည့်ရန်"}</h3>
        <input 
          placeholder="ထိုင်းစာလုံး (ဥပမာ- ขนม)" 
          value={newThai} 
          onChange={(e) => setNewThai(e.target.value)}
          style={styles.input}
        />
        <input 
          placeholder="ထွက်သံ (ဥပမာ- Kha-nom)" 
          value={newRead} 
          onChange={(e) => setNewRead(e.target.value)}
          style={styles.input}
        />
        <input 
          placeholder="အဓိပ္ပာယ် (ဥပမာ- Snack)" 
          value={newEng} 
          onChange={(e) => setNewEng(e.target.value)}
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

      {/* --- Flashcard များ ပြသသည့်နေရာ --- */}
      <div style={styles.cardGrid}>
        {cards.map((card) => (
          <div key={card.id} style={styles.card}>
            {/* အပေါ်ဘက် ခလုတ်များ (Edit & Delete) */}
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
  input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' },
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