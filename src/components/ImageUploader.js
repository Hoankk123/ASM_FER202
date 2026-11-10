import React, { useState, useEffect } from 'react';
import { Form, Image, Button } from 'react-bootstrap';

function ImageUploader({ value, onChange, label = 'Hình ảnh sản phẩm' }) {
  const [preview, setPreview] = useState(value || '');
  const [isUrlMode, setIsUrlMode] = useState(true);

  useEffect(() => {
    if (typeof value === 'string') {
      setPreview(value);
    }
  }, [value]);

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        if (onChange) {
          onChange(reader.result, file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setPreview(url);
    if (onChange) {
      onChange(url);
    }
  };

  return (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      <div className="d-flex gap-2 mb-2">
        <Button
          size="sm"
          variant={isUrlMode ? 'primary' : 'outline-secondary'}
          onClick={() => setIsUrlMode(true)}
          type="button"
        >
          Nhập URL ảnh
        </Button>
        <Button
          size="sm"
          variant={!isUrlMode ? 'primary' : 'outline-secondary'}
          onClick={() => setIsUrlMode(false)}
          type="button"
        >
          Tải file ảnh
        </Button>
      </div>

      {isUrlMode ? (
        <Form.Control
          type="url"
          placeholder="https://images.unsplash.com/..."
          value={typeof value === 'string' ? value : ''}
          onChange={handleUrlChange}
        />
      ) : (
        <Form.Control
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
      )}

      {preview && (
        <div className="mt-3 text-center">
          <p className="text-muted small mb-1">Xem trước hình ảnh:</p>
          <Image
            src={preview}
            alt="Xem trước hình ảnh"
            thumbnail
            style={{ maxHeight: '180px', objectFit: 'cover' }}
          />
        </div>
      )}
    </Form.Group>
  );
}

export default ImageUploader;
