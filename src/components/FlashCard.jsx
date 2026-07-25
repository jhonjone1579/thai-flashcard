import React, { useState } from 'react';

function FlashCard({ cardData }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      onClick={() => setIsFlipped(!isFlipped)}
      style={{
        width: '300px',
        height: '200px',
        margin: '20px auto',
        padding: '20px',
        borderRadius: '15px',
        backgroundColor: isFlipped ? '#183b85' : '#276460',
        color: isFlipped ? '#fafcf7' : '#f3f5f6',
        border: '2px solid #e2e8f0',
        boxShadow: '0 15px 20px -8px rgba(12, 19, 10, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.30s ease'
      }}
    >
      <span style={{ fontSize: '12px', opacity: 0.8, marginBottom: '10px' }}>
        [{cardData.category}]
      </span>

      {!isFlipped ? (
        <>
          <h1 style={{ fontSize: '36px', margin: '0' }}>{cardData.thai}</h1>
          <p style={{ color: '#dadde0', marginTop: '8px' }}>({cardData.phonetic})</p>
          <small style={{ marginTop: '15px', opacity: 0.9 }}>👉 အဓိပ္ပာယ်ကြည့်ရန် နှိပ်ပါ</small>
        </>
      ) : (
        <>
          <h2 style={{ fontSize: '28px', margin: '0' }}>{cardData.myanmar}</h2>
          <small style={{ marginTop: '15px', opacity: 0.9 }}>👈 မူရင်းစာပြောင်းရန် ပြန်နှိပ်ပါ</small>
        </>
      )}
    </div>
  );
}

export default FlashCard;