// MyInfoPage.jsx
import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import confetti from 'canvas-confetti';

Modal.setAppElement('#root'); // 모달 접근성 설정

function MyInfoPage() {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 1.0 },
      angle: 90,
      startVelocity: 45,
    });
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        style={{
          content: {
            width: '400px',
            height: '200px',
            margin: 'auto',
            textAlign: 'center',
            borderRadius: '12px',
            paddingTop: '40px',
          },
        }}
      >
        <h2 style={{ fontSize: '28px' }}>🎉 프로필 설정 완료!</h2>
        <p style={{ fontSize: '28px' }}>이제 추천 레시피를 만나보세요.</p>
        <button onClick={() => setIsOpen(false)} style={{ marginTop: '20px' }}>
          닫기
        </button>
      </Modal>

      <div style={{ marginTop: '60px' }}>
        <h1>내 정보 페이지입니다</h1>
        <h2>내 정보</h2>
        <h2>저장된 레시피</h2>
      </div>
    </div>
  );
}

export default MyInfoPage;
