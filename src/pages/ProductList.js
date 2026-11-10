import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Form,
  InputGroup,
  Badge,
  Pagination,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getProducts, getCategories } from '../services/api';
import CartToast from '../components/CartToast';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search & Sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('');

  // Pagination state (6 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Notification for add to cart
  const [toastInfo, setToastInfo] = useState({ show: false, message: '' });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([getProducts(), getCategories()]);
        setProducts(prodRes.data || []);
        setCategories(catRes.data || []);
      } catch (err) {
        setError('Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();

    const handleProductsChange = () => {
      fetchData();
    };

    window.addEventListener('productsUpdated', handleProductsChange);
    window.addEventListener('storage', handleProductsChange);
    return () => {
      window.removeEventListener('productsUpdated', handleProductsChange);
      window.removeEventListener('storage', handleProductsChange);
    };
  }, []);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortBy]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory =
          !selectedCategory || p.categoryId === Number(selectedCategory);
        const searchLower = searchTerm.trim().toLowerCase();
        const matchesSearch =
          !searchLower ||
          p.productName.toLowerCase().includes(searchLower) ||
          (p.description && p.description.toLowerCase().includes(searchLower));
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        const priceA = a.discount > 0 ? a.price * (1 - a.discount / 100) : a.price;
        const priceB = b.discount > 0 ? b.price * (1 - b.discount / 100) : b.price;

        if (sortBy === 'price-asc') return priceA - priceB;
        if (sortBy === 'price-desc') return priceB - priceA;
        if (sortBy === 'name') return a.productName.localeCompare(b.productName, 'vi');
        if (sortBy === 'best-selling') return (b.sold || 0) - (a.sold || 0);
        return 0;
      });
  }, [products, selectedCategory, searchTerm, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const handleAddToCart = (product) => {
    try {
      const raw = localStorage.getItem('cart');
      const cart = raw ? JSON.parse(raw) : [];
      const index = cart.findIndex((item) => item.productId === product.productId);

      if (index > -1) {
        cart[index].quantity = (Number(cart[index].quantity) || 1) + 1;
      } else {
        cart.push({
          productId: product.productId,
          productName: product.productName,
          price: product.price,
          discount: product.discount || 0,
          quantity: 1,
          image: product.image,
        });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));
      setToastInfo({
        show: true,
        message: `Đã thêm "${product.productName}" vào giỏ hàng!`,
      });
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  return (
    <Container className="my-4 position-relative">
      {/* Toast Alert for Cart có thanh đếm ngược 5s tự tụt hết (Góc trên bên trái) */}
      <CartToast
        show={toastInfo.show}
        message={toastInfo.message}
        onClose={() => setToastInfo((prev) => ({ ...prev, show: false }))}
        duration={5000}
      />

      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2 className="fw-bold mb-0 text-success">🌸 Danh Sách Hoa Tươi</h2>
        <Badge bg="secondary" pill className="fs-6">
          {filteredProducts.length} sản phẩm
        </Badge>
      </div>

      {/* Filter and Search Controls */}
      <Card className="border-0 shadow-sm p-3 mb-4 bg-light">
        <Row className="g-3">
          {/* Search bar */}
          <Col md={5} sm={12}>
            <Form.Group controlId="searchBar">
              <Form.Label className="small fw-bold text-muted mb-1">Tìm kiếm</Form.Label>
              <InputGroup>
                <InputGroup.Text>🔍</InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Tìm theo tên hoặc mô tả hoa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
                    ✕
                  </Button>
                )}
              </InputGroup>
            </Form.Group>
          </Col>

          {/* Filter by Category */}
          <Col md={4} sm={6}>
            <Form.Group controlId="categoryFilter">
              <Form.Label className="small fw-bold text-muted mb-1">Danh mục</Form.Label>
              <Form.Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((cat) => (
                  <option key={cat.cid} value={cat.cid}>
                    {cat.cname}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          {/* Sort dropdown */}
          <Col md={3} sm={6}>
            <Form.Group controlId="sortFilter">
              <Form.Label className="small fw-bold text-muted mb-1">Sắp xếp theo</Form.Label>
              <Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="">Mặc định</option>
                <option value="price-asc">Price Low-High (Giá tăng dần)</option>
                <option value="price-desc">Price High-Low (Giá giảm dần)</option>
                <option value="name">Name A-Z (Tên A-Z)</option>
                <option value="best-selling">Best Selling (Bán chạy nhất)</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </Card>

      {/* Loading & Error States */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="success" />
          <p className="mt-2 text-muted">Đang tải danh sách sản phẩm...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : filteredProducts.length === 0 ? (
        <Alert variant="info" className="text-center py-4">
          🌸 Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại.
        </Alert>
      ) : (
        <>
          {/* Responsive Product Grid */}
          <Row className="g-4">
            {paginatedProducts.map((product) => {
              const hasDiscount = product.discount > 0;
              const discountedPrice = hasDiscount
                ? product.price * (1 - product.discount / 100)
                : product.price;

              return (
                <Col
                  key={product.productId}
                  xs={12}
                  sm={12}
                  md={6}
                  lg={4}
                  xl={3}
                >
                  <Card className="h-100 border-0 shadow-sm product-card">
                    <div className="position-relative">
                      <Card.Img
                        variant="top"
                        src={product.image}
                        alt={product.productName}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      {hasDiscount && (
                        <Badge
                          bg="danger"
                          className="position-absolute top-0 end-0 m-2 px-2 py-1"
                        >
                          -{product.discount}%
                        </Badge>
                      )}
                    </div>
                    <Card.Body className="d-flex flex-column">
                      <Card.Title
                        className="fs-6 fw-bold mb-2 text-truncate"
                        title={product.productName}
                      >
                        {product.productName}
                      </Card.Title>

                      <div className="mb-2">
                        {product.stock > 0 ? (
                          <Badge bg="success" className="me-2">
                            Còn hàng: {product.stock}
                          </Badge>
                        ) : (
                          <Badge bg="danger" className="me-2">
                            Hết hàng
                          </Badge>
                        )}
                        {product.sold > 0 && (
                          <small className="text-muted">Đã bán: {product.sold}</small>
                        )}
                      </div>

                      <div className="mb-3">
                        {hasDiscount ? (
                          <div>
                            <span className="text-muted text-decoration-line-through small me-2">
                              {formatPrice(product.price)}
                            </span>
                            <span className="text-danger fw-bold fs-5">
                              {formatPrice(discountedPrice)}
                            </span>
                          </div>
                        ) : (
                          <div className="text-success fw-bold fs-5">
                            {formatPrice(product.price)}
                          </div>
                        )}
                      </div>

                      <div className="mt-auto d-flex gap-2">
                        <Button
                          variant="success"
                          size="sm"
                          className="flex-grow-1"
                          disabled={product.stock === 0}
                          onClick={() => handleAddToCart(product)}
                        >
                          🛒 Add to Cart
                        </Button>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          as={Link}
                          to={`/products/${product.productId}`}
                        >
                          View Details
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>

          {/* Pagination at bottom (6 items per page) */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-5">
              <Pagination>
                <Pagination.Prev
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                />
                {[...Array(totalPages)].map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <Pagination.Item
                      key={pageNum}
                      active={pageNum === currentPage}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Pagination.Item>
                  );
                })}
                <Pagination.Next
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                />
              </Pagination>
            </div>
          )}
        </>
      )}
    </Container>
  );
}

export default ProductList;
