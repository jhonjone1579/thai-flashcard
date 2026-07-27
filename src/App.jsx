import React, { useState } from 'react';

function App() {
  // ၁။ Flashcards စာရင်းကို သိမ်းဆည်းရန် State
  const [cards, setCards] = useState([
    { id: 1, thai: "สวัสดี", read: "Sawatdee", eng: "Hello" },
    { id: 2, thai: "ขอบคุณ", read: "Khob khun", eng: "Thank you" }
  ]);

  // ၂။ Form ထဲက စာသားများကို သိမ်းဆည်းရန် State
  const [newThai, setNewThai] = useState("");
  const [newRead, setNewRead] = useState("");
  const [newEng, setNewEng] = useState("");

  // ၃။ အသံထွက်ပေးမည့် Function (Text-to-Speech)
  const playSound = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th-TH'; // ထိုင်းအသံသတ်မှတ်ခြင်း
    window.speechSynthesis.speak(utterance);
  };

  // ၄။ စာလုံးအသစ် သိမ်းဆည်းသည့် Function
  const saveCard = (e) => {
    e.preventDefault();
    if (!newThai || !newEng) return; // အလွတ်ဖြစ်နေရင် ဘာမှမလုပ်ဘူး

    const newCard = {
      id: Date.now(),
      thai: newThai,
      read: newRead,
      eng: newEng
    };

    setCards([...cards, newCard]); // ရှိပြီးသားစာရင်းထဲ အသစ်ပေါင်းထည့်
    
    // Form ကို ပြန်ရှင်းပစ်ခြင်း
    setNewThai("");
    setNewRead("");
    setNewEng("");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>🇹🇭 Thai Flashcards V2</h1>

      {/* --- စာလုံးအသစ်ထည့်သည့် Form --- */}
      <form onSubmit={saveCard} style={styles.form}>
        <h3>စာလုံးအသစ်ထည့်ရန်</h3>
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
        <button type="submit" style={styles.saveBtn}>Save New Card</button>
      </form>

      {/* --- Flashcard များ ပြသသည့်နေရာ --- */}
      <div style={styles.cardGrid}>
        {cards.map((card) => (
          <div key={card.id} style={styles.card}>
            <div style={styles.cardTop}>
              <h2 style={styles.thaiText}>{card.thai}</h2>
              <button onClick={() => playSound(card.thai)} style={styles.speakerBtn}>
                🔊
              </button>
            </div>
            <p style={styles.readText}><i>({card.read})</i></p>
            <hr />
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
  input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd' },
  saveBtn: { width: '100%', padding: '10px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' },
  card: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  cardTop: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' },
  thaiText: { fontSize: '28px', margin: 0, color: '#333' },
  speakerBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' },
  readText: { color: '#666', margin: '10px 0' },
  engText: { fontSize: '20px', fontWeight: 'bold', color: '#1a73e8' }
};

export default App;