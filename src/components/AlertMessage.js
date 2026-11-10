import React from 'react';
import { Alert } from 'react-bootstrap';

function AlertMessage({
  variant = 'danger',
  message,
  children,
  onClose,
  dismissible = false,
  className = '',
}) {
  const content = message || children;
  if (!content) return null;

  return (
    <Alert
      variant={variant}
      onClose={onClose}
      dismissible={dismissible || !!onClose}
      className={`my-3 ${className}`}
    >
      {content}
    </Alert>
  );
}

export default AlertMessage;
