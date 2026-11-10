import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Carousel,
  Badge,
  Spinner,
  Alert,
  Form,
  InputGroup,
  Pagination,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import logo0 from '../images/logo0.png';
import logo1 from '../images/logo1.png';
import logo2 from '../images/logo2.png';
import logo3 from '../images/logo3.png';
import { getProducts, getCategories } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import CartToast from '../components/CartToast';

function Home() {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search & Sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('');

  // Pagination state (8 items per page for home)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Toast notification for add-to-cart
  const [toastInfo, setToastInfo] = useState({ show: false, message: '' });

  // 3 online banner images from Unsplash
  const banners = [
    { id: 1, image: logo0, title: 'Thiên Đường Hoa Tươi Nhập Khẩu', subtitle: 'Tuyển chọn những đóa hoa tuyệt mỹ, gói trọn cảm xúc yêu thương.', cta: 'Khám Phá Ngay' },
    { id: 2, image: logo1, title: 'Bộ Sưu Tập Hoa Hồng & Tulip Mới', subtitle: 'Ưu đãi giảm giá tới 25% cho tất cả đơn hàng hoa sinh nhật và kỷ niệm.', cta: 'Xem Bộ Sưu Tập' },
    { id: 3, image: logo2, title: 'Dịch Vụ Cắm Hoa Nghệ Thuật & Sự Kiện', subtitle: 'Giao nhanh hỏa tốc trong 2 giờ, cam kết tươi mới 100%.', cta: 'Đặt Hoa Hỏa Tốc' },
    { id: 4, image: logo3, title: 'Khuyến Mãi Đặc Biệt', subtitle: 'Mua ngay để nhận quà tặng bất ngờ!', cta: 'Mua Ngay' },
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([getProducts(), getCategories()]);
        setProducts(prodRes.data || []);
        setCategories(catRes.data || []);
      } catch (err) {
        setError('Không thể tải dữ liệu sản phẩm. Vui lòng kiểm tra lại kết nối.');
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
      window.dispatchEvent(new Event('storage'));
      setToastInfo({
        show: true,
        message: `Đã thêm "${product.productName}" vào giỏ hàng!`,
      });
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  return (
    <div>
      {/* Toast Notification có thanh đếm ngược 5s tự tụt hết (Góc trên bên trái) */}
      <CartToast
        show={toastInfo.show}
        message={toastInfo.message}
        onClose={() => setToastInfo((prev) => ({ ...prev, show: false }))}
        duration={5000}
      />

      {/* ==================== 1. IMAGE CAROUSEL SLIDER ==================== */}
      <Carousel className="mb-5 shadow-sm" interval={4000} pause="hover">
        {banners.map((banner) => {
          return (
            <Carousel.Item key={banner.id}>
              <img
                className="d-block w-100"
                src={banner.image}
                alt={banner.title}
                style={{ height: '500px', objectFit: 'cover' }}
              />
              <Carousel.Caption>
                <Badge bg="warning" text="dark" className="px-3 py-2 mb-2 fs-6 rounded-pill">
                  🌸 Flower Shop
                </Badge>
                <h3 className="fw-bold text-white text-shadow">{banner.title}</h3>
                <p className="fs-5 text-light text-shadow">{banner.subtitle}</p>
                <Button
                  variant="success"
                  size="md"
                  className="fw-bold px-4 py-2 rounded-pill shadow"
                  as={Link}
                  to="/products"
                >
                  {banner.cta} →
                </Button>
              </Carousel.Caption>
            </Carousel.Item>
          );
        })}
      </Carousel>

      <Container className="mb-5">
        {/* ==================== 2. FEATURE HIGHLIGHTS ==================== */}
        <Row className="g-4 mb-5 text-center">
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm p-4 bg-white rounded-3">
              <div style={{ fontSize: '3rem' }}>🚚</div>
              <Card.Title className="fw-bold mt-2">Giao Hàng Siêu Tốc</Card.Title>
              <Card.Text className="text-muted">
                Miễn phí vận chuyển cho đơn hàng từ 500.000₫. Đảm bảo hoa tươi trao tận tay trong vòng 2 giờ.
              </Card.Text>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm p-4 bg-white rounded-3">
              <div style={{ fontSize: '3rem' }}>🌹</div>
              <Card.Title className="fw-bold mt-2">Hoa Tươi 100%</Card.Title>
              <Card.Text className="text-muted">
                Hoa tươi cắt cành từ nhà vườn Đà Lạt và nguồn nhập khẩu uy tín chuẩn chất lượng cao nhất.
              </Card.Text>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm p-4 bg-white rounded-3">
              <div style={{ fontSize: '3rem' }}>💬</div>
              <Card.Title className="fw-bold mt-2">Tư Vấn Tận Tâm 24/7</Card.Title>
              <Card.Text className="text-muted">
                Đội ngũ florist chuyên nghiệp hỗ trợ cắm hoa theo yêu cầu, thiết kế thiệp và phục vụ 24/7.
              </Card.Text>
            </Card>
          </Col>
        </Row>

        {/* ==================== 2.5 REGISTRATION BANNER FOR GUESTS ==================== */}
        {!isAuthenticated && (
          <Card
            className="border-0 shadow-sm p-4 mb-5 rounded-3 text-white"
            style={{
              background: 'linear-gradient(135deg, #198754 0%, #20c997 100%)',
            }}
          >
            <Row className="align-items-center">
              <Col md={8}>
                <h4 className="fw-bold mb-1 text-white">🎁 Đăng Ký Thành Viên Nhận Ngay Ưu Đãi Đặc Biệt</h4>
                <p className="mb-0" style={{ color: '#e8f5e9' }}>
                  Tạo tài khoản miễn phí để nhận mã giảm giá, lưu thông tin giao hàng và theo dõi tình trạng đơn hoa của bạn.
                </p>
              </Col>
              <Col md={4} className="text-md-end mt-3 mt-md-0">
                <Button
                  as={Link}
                  to="/register"
                  variant="light"
                  size="lg"
                  className="fw-bold px-4 py-2 shadow-sm rounded-pill text-success"
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#198754',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '1.05rem',
                  }}
                >
                  ✨ Đăng Ký Tài Khoản
                </Button>
              </Col>
            </Row>
          </Card>
        )}

        {/* ==================== 3. ALL PRODUCTS GRID WITH FILTER/SEARCH/SORT ==================== */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h2 className="fw-bold mb-1 text-success">🌸 Tất Cả Sản Phẩm Hoa Tươi</h2>
            <p className="text-muted mb-0">Khám phá và đặt ngay những mẫu hoa đẹp nhất</p>
          </div>
          <Badge bg="secondary" pill className="fs-6 px-3 py-2">
            {filteredProducts.length} sản phẩm
          </Badge>
        </div>

        {/* Search, Filter & Sort Controls */}
        <Card className="border-0 shadow-sm p-3 mb-4 bg-light rounded-3">
          <Row className="g-3">
            {/* Search Bar */}
            <Col md={5} sm={12}>
              <Form.Group controlId="homeSearchBar">
                <Form.Label className="small fw-bold text-muted mb-1">Tìm kiếm sản phẩm</Form.Label>
                <InputGroup>
                  <InputGroup.Text>🔍</InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Tìm theo tên hoa, màu sắc hoặc mô tả..."
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

            {/* Category Filter */}
            <Col md={4} sm={6}>
              <Form.Group controlId="homeCategoryFilter">
                <Form.Label className="small fw-bold text-muted mb-1">Danh mục hoa</Form.Label>
                <Form.Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((c) => (
                    <option key={c.cid} value={c.cid}>
                      {c.cname}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Sort Options */}
            <Col md={3} sm={6}>
              <Form.Group controlId="homeSortFilter">
                <Form.Label className="small fw-bold text-muted mb-1">Sắp xếp theo</Form.Label>
                <Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="">Mặc định</option>
                  <option value="price-asc">Giá: Thấp đến Cao</option>
                  <option value="price-desc">Giá: Cao đến Thấp</option>
                  <option value="name">Tên: A - Z</option>
                  <option value="best-selling">Bán chạy nhất</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Active Filter Badges */}
          {(searchTerm || selectedCategory || sortBy) && (
            <div className="mt-3 pt-2 border-top d-flex align-items-center flex-wrap gap-2">
              <span className="small text-muted">Bộ lọc đang áp dụng:</span>
              {searchTerm && (
                <Badge bg="info" text="dark" className="p-2">
                  Từ khóa: "{searchTerm}"{' '}
                  <span
                    style={{ cursor: 'pointer', fontWeight: 'bold' }}
                    onClick={() => setSearchTerm('')}
                  >
                    ×
                  </span>
                </Badge>
              )}
              {selectedCategory && (
                <Badge bg="info" text="dark" className="p-2">
                  Danh mục:{' '}
                  {categories.find((c) => c.cid === Number(selectedCategory))?.cname ||
                    selectedCategory}{' '}
                  <span
                    style={{ cursor: 'pointer', fontWeight: 'bold' }}
                    onClick={() => setSelectedCategory('')}
                  >
                    ×
                  </span>
                </Badge>
              )}
              {sortBy && (
                <Badge bg="info" text="dark" className="p-2">
                  Sắp xếp: {sortBy}{' '}
                  <span
                    style={{ cursor: 'pointer', fontWeight: 'bold' }}
                    onClick={() => setSortBy('')}
                  >
                    ×
                  </span>
                </Badge>
              )}
              <Button
                variant="link"
                size="sm"
                className="p-0 text-danger text-decoration-none ms-2"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setSortBy('');
                }}
              >
                Xóa tất cả bộ lọc
              </Button>
            </div>
          )}
        </Card>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="success" />
            <p className="mt-3 text-muted">Đang tải danh sách sản phẩm...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : paginatedProducts.length === 0 ? (
          <div className="text-center py-5 bg-light rounded-3">
            <h5 className="text-muted">Không tìm thấy sản phẩm nào phù hợp</h5>
            <p className="text-secondary small">Vui lòng thử thay đổi từ khóa hoặc bộ lọc danh mục.</p>
            <Button
              variant="outline-success"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSortBy('');
              }}
            >
              Xem tất cả sản phẩm
            </Button>
          </div>
        ) : (
          <>
            <Row xs={1} sm={2} md={3} lg={4} className="g-4 mb-4">
              {paginatedProducts.map((product) => {
                const hasDiscount = product.discount > 0;
                const discountedPrice = hasDiscount
                  ? product.price * (1 - product.discount / 100)
                  : product.price;

                return (
                  <Col key={product.productId}>
                    <Card className="h-100 border-0 shadow-sm product-card d-flex flex-column">
                      <div className="position-relative overflow-hidden" style={{ borderRadius: '8px 8px 0 0' }}>
                        <Card.Img
                          variant="top"
                          src={product.image}
                          alt={product.productName}
                          style={{
                            height: '220px',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease',
                          }}
                        />
                        {hasDiscount && (
                          <Badge
                            bg="danger"
                            className="position-absolute top-0 end-0 m-2 px-2 py-1 shadow-sm"
                          >
                            -{product.discount}%
                          </Badge>
                        )}
                        <Badge
                          bg={product.stock > 0 ? 'success' : 'secondary'}
                          className="position-absolute bottom-0 start-0 m-2 px-2 py-1 shadow-sm"
                        >
                          {product.stock > 0 ? `Còn ${product.stock}` : 'Hết hàng'}
                        </Badge>
                      </div>

                      <Card.Body className="d-flex flex-column p-3">
                        <Card.Title
                          className="fs-6 fw-bold mb-2 text-truncate"
                          title={product.productName}
                        >
                          <Link
                            to={`/products/${product.productId}`}
                            className="text-decoration-none text-dark"
                          >
                            {product.productName}
                          </Link>
                        </Card.Title>

                        <Card.Text
                          className="text-muted small mb-3 flex-grow-1"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {product.description}
                        </Card.Text>

                        {/* Price info */}
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
                          {product.sold > 0 && (
                            <div className="text-muted small mt-1">Đã bán: {product.sold}</div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="mt-auto d-grid gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            disabled={product.stock <= 0}
                            onClick={() => handleAddToCart(product)}
                            className="fw-semibold"
                          >
                            🛒 {product.stock > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
                          </Button>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            as={Link}
                            to={`/products/${product.productId}`}
                          >
                            Xem chi tiết
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4">
                <Pagination>
                  <Pagination.First
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(1)}
                  />
                  <Pagination.Prev
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  />

                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNumber) => (
                    <Pagination.Item
                      key={pageNumber}
                      active={pageNumber === currentPage}
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </Pagination.Item>
                  ))}

                  <Pagination.Next
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  />
                  <Pagination.Last
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                  />
                </Pagination>
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
}

export default Home;
