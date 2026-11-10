import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { addProduct, getCategories } from '../../services/api';
import ImageUploader from '../../components/ImageUploader';
import AlertMessage from '../../components/AlertMessage';

const initialFormState = {
  productName: '',
  description: '',
  price: '',
  discount: '',
  stock: '',
  categoryId: '',
  image: '',
};

function AddProduct() {
  const [form, setForm] = useState(initialFormState);
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Load categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoadingCats(true);
        const res = await getCategories();
        setCategories(res.data || []);
      } catch (err) {
        setErrorMessage(
          err.response?.data?.message || 'Không thể tải danh mục sản phẩm.'
        );
      } finally {
        setLoadingCats(false);
      }
    }
    fetchCategories();
  }, []);

  // Handle standard input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle image changes from ImageUploader
  const handleImageChange = (imageVal) => {
    setForm((prev) => ({
      ...prev,
      image: imageVal,
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Form validation
    if (!form.productName.trim()) {
      setErrorMessage('Vui lòng nhập tên sản phẩm.');
      return;
    }
    if (!form.description.trim()) {
      setErrorMessage('Vui lòng nhập mô tả sản phẩm.');
      return;
    }
    if (form.price === '' || isNaN(form.price) || Number(form.price) < 0) {
      setErrorMessage('Vui lòng nhập đơn giá hợp lệ (>= 0).');
      return;
    }
    if (form.stock === '' || isNaN(form.stock) || Number(form.stock) < 0) {
      setErrorMessage('Vui lòng nhập số lượng tồn kho hợp lệ (>= 0).');
      return;
    }
    if (!form.categoryId) {
      setErrorMessage('Vui lòng chọn danh mục sản phẩm.');
      return;
    }

    setSubmitting(true);

    try {
      const data = {
        productName: form.productName.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        discount: form.discount !== '' ? Number(form.discount) : 0,
        stock: parseInt(form.stock, 10),
        categoryId: Number(form.categoryId),
        image: form.image || 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=400',
      };

      await addProduct(data);
      setSuccessMessage('Thêm sản phẩm mới thành công! 🎉');
      setForm(initialFormState);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Có lỗi xảy ra khi thêm sản phẩm. Vui lòng thử lại.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-4" style={{ maxWidth: '800px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">➕ Thêm sản phẩm mới</h2>
          <p className="text-muted mb-0">Điền thông tin chi tiết để thêm hoa vào danh mục bán hàng</p>
        </div>
        <Button as={Link} to="/admin" variant="outline-secondary" size="sm">
          ← Về Dashboard
        </Button>
      </div>

      <AlertMessage
        variant="success"
        message={successMessage}
        onClose={() => setSuccessMessage(null)}
      />
      <AlertMessage
        variant="danger"
        message={errorMessage}
        onClose={() => setErrorMessage(null)}
      />

      <Card className="shadow-sm border-0">
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            {/* Product Name */}
            <Form.Group className="mb-3" controlId="productName">
              <Form.Label className="fw-semibold">
                Tên sản phẩm <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="productName"
                placeholder="Ví dụ: Bó Hoa Hồng Đỏ Valentine"
                value={form.productName}
                onChange={handleChange}
                required
              />
            </Form.Group>

            {/* Description */}
            <Form.Group className="mb-3" controlId="description">
              <Form.Label className="fw-semibold">
                Mô tả sản phẩm <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                placeholder="Mô tả số lượng bông, ý nghĩa loài hoa, dịp tặng thích hợp..."
                value={form.description}
                onChange={handleChange}
                required
              />
            </Form.Group>

            {/* Price & Discount */}
            <Row className="g-3 mb-3">
              <Col md={6}>
                <Form.Group controlId="price">
                  <Form.Label className="fw-semibold">
                    Đơn giá (VNĐ) <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    placeholder="Ví dụ: 350000"
                    min="0"
                    step="1000"
                    value={form.price}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="discount">
                  <Form.Label className="fw-semibold">
                    Giảm giá (%) <span className="text-muted fw-normal">(tùy chọn)</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="discount"
                    placeholder="Ví dụ: 10"
                    min="0"
                    max="100"
                    value={form.discount}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Stock & Category */}
            <Row className="g-3 mb-3">
              <Col md={6}>
                <Form.Group controlId="stock">
                  <Form.Label className="fw-semibold">
                    Số lượng tồn kho <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="stock"
                    placeholder="Ví dụ: 50"
                    min="0"
                    value={form.stock}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="categoryId">
                  <Form.Label className="fw-semibold">
                    Danh mục hoa <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleChange}
                    disabled={loadingCats}
                    required
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((c) => (
                      <option key={c.cid} value={c.cid}>
                        {c.cname}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* Image Uploader */}
            <ImageUploader
              value={form.image}
              onChange={handleImageChange}
              label="Hình ảnh sản phẩm (tùy chọn)"
            />

            {/* Buttons */}
            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => setForm(initialFormState)}
                disabled={submitting}
              >
                Làm mới form
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
                className="px-4 fw-semibold"
              >
                {submitting ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    Đang thêm...
                  </>
                ) : (
                  'Thêm sản phẩm'
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default AddProduct;
