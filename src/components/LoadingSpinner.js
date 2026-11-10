import React from 'react';
import { Container, Spinner } from 'react-bootstrap';

function LoadingSpinner({ message = 'Đang tải dữ liệu...', variant = 'primary' }) {
  return (
    <Container className="text-center my-5 py-4">
      <Spinner animation="border" variant={variant} role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
      {message && <p className="mt-3 text-muted">{message}</p>}
    </Container>
  );
}

export default LoadingSpinner;
