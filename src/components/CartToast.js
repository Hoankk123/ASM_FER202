import React, { useEffect, useState, useRef } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

function CartToast({ show, onClose, message, duration = 5000 }) {
  const [progress, setProgress] = useState(100);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!show) {
      setProgress(100);
      return;
    }

    setProgress(100);
    const intervalTime = 50; // Update every 50ms for smooth progress bar
    const totalSteps = duration / intervalTime;
    const decrement = 100 / totalSteps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= decrement) {
          clearInterval(timer);
          if (onCloseRef.current) onCloseRef.current();
          return 0;
        }
        return prev - decrement;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [show, message, duration]);

  if (!show) return null;

  const secondsLeft = Math.max(1, Math.ceil((progress / 100) * (duration / 1000)));

  return (
    <ToastContainer
      position="top-start"
      className="p-3"
      style={{ position: 'fixed', top: '15px', left: '15px', zIndex: 99999 }}
    >
      <Toast
        show={show}
        onClose={onClose}
        bg="success"
        className="shadow-lg border-0 overflow-hidden"
        style={{ minWidth: '320px', maxWidth: '380px', borderRadius: '10px' }}
      >
        <Toast.Header closeButton className="bg-success text-white border-0 py-2">
          <strong className="me-auto text-white d-flex align-items-center">
            <span className="me-1 fs-5">🛒</span> Đã thêm vào giỏ hàng
          </strong>
          <small className="badge bg-white text-success fw-bold px-2 py-1 ms-2">
            {secondsLeft}s
          </small>
        </Toast.Header>
        <Toast.Body className="text-white fw-semibold py-2 px-3 fs-6">
          {message}
        </Toast.Body>
        {/* Thanh đếm ngược 5s tự tụt hết */}
        <div
          style={{
            height: '5px',
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            width: '100%',
          }}
        >
          <div
            style={{
              height: '100%',
              backgroundColor: '#ffc107', // Màu vàng nổi bật đếm ngược trên nền xanh lá
              width: `${progress}%`,
              transition: 'width 50ms linear',
            }}
          />
        </div>
      </Toast>
    </ToastContainer>
  );
}

export default CartToast;
