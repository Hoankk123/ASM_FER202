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
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProduct, updateProduct, getCategories } from '../../services/api';
import ImageUploader from '../../components/ImageUploader';
import AlertMessage from '../../components/AlertMessage';

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    productName: '',
    description: '',
    price: '',
    discount: '',
    stock: '',
    categoryId: '',
    image: '',
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Load product and categories on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setErrorMessage(null);

        const [productRes, categoriesRes] = await Promise.all([
          getProduct(id),
          getCategories(),
        ]);

        const prod = productRes.data;
        if (prod) {
          setForm({
            productName: prod.productName || '',
            description: prod.description || '',
            price: prod.price ?? '',
            discount: prod.discount ?? 0,
            stock: prod.stock ?? '',
            categoryId: prod.categoryId ?? '',
            image: prod.image || '',
          });
        }
        setCategories(categoriesRes.data || []);
      } catch (err) {
        setErrorMessage(
          err.response?.data?.message || 'Không thể tải thông tin sản phẩm cần chỉnh sửa.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  // Handle standard input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle image upload / url change
  const handleImageChange = (imageVal) => {
    setForm((prev) => ({
      ...prev,
      image: imageVal,
    }));
  };

  // Submit edit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
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
        image: form.image,
      };

      await updateProduct(id, data);
      setSuccessMessage('Cập nhật thông tin sản phẩm thành công! 🎉');
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật sản phẩm. Vui lòng thử lại.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" role="status" />
        <p className="mt-3 text-muted">Đang tải thông tin sản phẩm #{id}...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4" style={{ maxWidth: '800px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">✏️ Chỉnh sửa sản phẩm #{id}</h2>
          <p className="text-muted mb-0">Cập nhật thông tin, giá bán và hình ảnh của sản phẩm</p>
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
            <Form.Group className="mb-3" controlId="editProductName">
              <Form.Label className="fw-semibold">
                Tên sản phẩm <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="productName"
                value={form.productName}
                onChange={handleChange}
                placeholder="Ví dụ: Bó Hoa Hồng Đỏ"
                required
              />
            </Form.Group>

            {/* Description */}
            <Form.Group className="mb-3" controlId="editDescription">
              <Form.Label className="fw-semibold">
                Mô tả sản phẩm <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Mô tả thông tin chi tiết của bó hoa..."
                required
              />
            </Form.Group>

            {/* Price & Discount */}
            <Row className="g-3 mb-3">
              <Col md={6}>
                <Form.Group controlId="editPrice">
                  <Form.Label className="fw-semibold">
                    Đơn giá (VNĐ) <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    min="0"
                    step="1000"
                    placeholder="Ví dụ: 350000"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="editDiscount">
                  <Form.Label className="fw-semibold">
                    Giảm giá (%) <span className="text-muted fw-normal">(tùy chọn)</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="discount"
                    value={form.discount}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    placeholder="Ví dụ: 10"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Stock & Category */}
            <Row className="g-3 mb-3">
              <Col md={6}>
                <Form.Group controlId="editStock">
                  <Form.Label className="fw-semibold">
                    Số lượng tồn kho <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    min="0"
                    placeholder="Ví dụ: 50"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="editCategoryId">
                  <Form.Label className="fw-semibold">
                    Danh mục hoa <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleChange}
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

            {/* Actions: Cancel & Save */}
            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => navigate(-1)}
                disabled={submitting}
              >
                Hủy bỏ
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
                    Đang lưu...
                  </>
                ) : (
                  'Lưu thay đổi'
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default EditProduct;
