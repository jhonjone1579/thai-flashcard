import React, { useState } from 'react';
import { thaiWords } from './data/words';
import FlashCard from './components/FlashCard';

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < thaiWords.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : thaiWords.length - 1));
  };

  return (
    <div style={{ textAlign: 'center', fontFamily: 'sans-serif', paddingTop: '40px' }}>
      <h1>Thai Flashcard App v2</h1>
      <p>ကတ်ပြားအရေအတွက်: {currentIndex + 1} / {thaiWords.length}</p>

      <FlashCard cardData={thaiWords[currentIndex]} />

      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={handlePrev}
          style={{ padding: '10px 20px', marginRight: '10px', fontSize: '16px', cursor: 'pointer' }}
        >
          ⬅️ ရှေ့တစ်ခု
        </button>
        <button 
          onClick={handleNext}
          style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
        >
          နောက်တစ်ခု ➡️
        </button>
      </div>
    </div>
  );
}

export default App;