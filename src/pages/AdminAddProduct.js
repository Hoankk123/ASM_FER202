import React, { useState, useEffect } from 'react';
import {
  Form,
  Button,
  Alert,
  Spinner,
  Container,
  Row,
  Col,
} from 'react-bootstrap';
import { addProduct, getCategories } from '../services/api';

function AdminAddProduct() {
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const emptyForm = {
    productName: '',
    description: '',
    price: '',
    discount: '',
    stock: '',
    categoryId: '',
    image: null,
  };
  const [form, setForm] = useState(emptyForm);

  // ---- load categories on mount ----
  useEffect(() => {
    async function fetchCats() {
      try {
        const res = await getCategories();
        setCategories(res.data);
      } catch (err) {
        setError('Failed to load categories.');
      } finally {
        setLoadingCats(false);
      }
    }
    fetchCats();
  }, []);

  // ---- handlers ----
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      let payload;
      let isMultipart = false;

      if (form.image) {
        // Build multipart FormData
        payload = new FormData();
        payload.append('productName', form.productName);
        payload.append('description', form.description);
        payload.append('price', form.price);
        payload.append('discount', form.discount || '0');
        payload.append('stock', form.stock);
        payload.append('categoryId', form.categoryId);
        payload.append('image', form.image);
        isMultipart = true;
      } else {
        payload = {
          productName: form.productName,
          description: form.description,
          price: Number(form.price),
          discount: Number(form.discount || 0),
          stock: Number(form.stock),
          categoryId: Number(form.categoryId),
        };
      }

      await addProduct(payload, isMultipart);
      setSuccess('Product added successfully! 🎉');
      setForm(emptyForm);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Failed to add product.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ---- loading state ----
  if (loadingCats) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading categories…</p>
      </Container>
    );
  }

  return (
    <Container className="my-4" style={{ maxWidth: '650px' }}>
      <h2 className="mb-4">➕ Add New Product</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form onSubmit={handleSubmit}>
        {/* Product Name */}
        <Form.Group className="mb-3" controlId="productName">
          <Form.Label>Product Name</Form.Label>
          <Form.Control
            type="text"
            name="productName"
            value={form.productName}
            onChange={handleChange}
            placeholder="e.g. Red Rose Bouquet"
            required
          />
        </Form.Group>

        {/* Description */}
        <Form.Group className="mb-3" controlId="description">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="description"
            value={form.description}
            onChange={handleChange}
            required
          />
        </Form.Group>

        {/* Price & Discount */}
        <Row className="g-3">
          <Col md={6}>
            <Form.Group className="mb-3" controlId="price">
              <Form.Label>Price ($)</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="discount">
              <Form.Label>Discount (%)</Form.Label>
              <Form.Control
                type="number"
                name="discount"
                value={form.discount}
                onChange={handleChange}
                min="0"
                max="100"
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Stock & Category */}
        <Row className="g-3">
          <Col md={6}>
            <Form.Group className="mb-3" controlId="stock">
              <Form.Label>Stock</Form.Label>
              <Form.Control
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                min="0"
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="categoryId">
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                required
              >
                <option value="">-- Select category --</option>
                {categories.map((c) => (
                  <option key={c.cid} value={c.cid}>
                    {c.cname}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* Image upload */}
        <Form.Group className="mb-3" controlId="image">
          <Form.Label>Product Image (optional)</Form.Label>
          <Form.Control
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
          />
        </Form.Group>

        {/* Submit */}
        <Button variant="primary" type="submit" disabled={submitting} className="w-100">
          {submitting ? (
            <Spinner as="span" animation="border" size="sm" />
          ) : (
            'Add Product'
          )}
        </Button>
      </Form>
    </Container>
  );
}

export default AdminAddProduct;
