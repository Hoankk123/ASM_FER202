import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Form,
  InputGroup,
  Modal,
  Nav,
  Tab,
  Spinner,
  Alert,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAllUsers, getAllOrdersAdmin, getAllReviews } from '../../services/api';

function AdminCustomers() {
  const { isAdmin, isAuthenticated } = useAuth();
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [orderFilter, setOrderFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  // Detail Modal state
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <Badge bg="success">Đã nhận hàng</Badge>;
      case 'Shipping':
        return <Badge bg="info">Đang giao</Badge>;
      case 'Processing':
        return <Badge bg="warning" text="dark">Đang lên đơn</Badge>;
      case 'Pending':
        return <Badge bg="secondary">Đang xử lý</Badge>;
      case 'Cancelled':
        return <Badge bg="danger">Đã hủy</Badge>;
      default:
        return <Badge bg="light" text="dark">{status}</Badge>;
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const num = Math.max(1, Math.min(5, Number(rating) || 5));
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= num ? '#ffc107' : '#e4e5e9', fontSize: '1.1rem' }}>
          ★
        </span>
      );
    }
    return stars;
  };

  // Fetch users, orders, and reviews
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersRes, ordersRes, reviewsRes] = await Promise.all([
        getAllUsers(),
        getAllOrdersAdmin(),
        getAllReviews(),
      ]);
      setUsers(usersRes.data || []);
      setOrders(ordersRes.data || []);
      setReviews(reviewsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu khách hàng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    } else {
      setLoading(false);
    }

    const handleUpdate = () => {
      fetchData();
    };

    window.addEventListener('usersUpdated', handleUpdate);
    window.addEventListener('ordersUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('usersUpdated', handleUpdate);
      window.removeEventListener('ordersUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [isAdmin]);

  // Aggregate user statistics
  const userStatsList = useMemo(() => {
    return users.map((user) => {
      const uName = (user.username || '').trim().toLowerCase();
      const userOrders = orders.filter(
        (o) => (o.username || '').trim().toLowerCase() === uName
      );
      const completedOrders = userOrders.filter((o) => o.status === 'Completed');
      const totalSpent = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      const userReviews = reviews.filter(
        (r) => (r.username || '').trim().toLowerCase() === uName
      );
      const customerName = userOrders[0]?.customerName || '';

      return {
        ...user,
        fullName: customerName,
        orders: userOrders,
        completedOrders,
        totalOrdersCount: userOrders.length,
        totalSpent,
        reviews: userReviews,
        totalReviewsCount: userReviews.length,
      };
    });
  }, [users, orders, reviews]);

  // Filtered & sorted users
  const filteredUsers = useMemo(() => {
    return userStatsList
      .filter((u) => {
        const s = searchTerm.trim().toLowerCase();
        const matchesSearch =
          !s ||
          (u.username && u.username.toLowerCase().includes(s)) ||
          (u.fullName && u.fullName.toLowerCase().includes(s)) ||
          (u.phone && u.phone.includes(s)) ||
          (u.email && u.email.toLowerCase().includes(s)) ||
          (u.address && u.address.toLowerCase().includes(s));

        const matchesRole =
          roleFilter === 'all' ||
          (roleFilter === 'customer' && u.role !== 'admin') ||
          (roleFilter === 'admin' && u.role === 'admin');

        const matchesOrder =
          orderFilter === 'all' ||
          (orderFilter === 'has_orders' && u.totalOrdersCount > 0) ||
          (orderFilter === 'no_orders' && u.totalOrdersCount === 0);

        return matchesSearch && matchesRole && matchesOrder;
      })
      .sort((a, b) => {
        if (sortBy === 'spent-desc') return b.totalSpent - a.totalSpent;
        if (sortBy === 'orders-desc') return b.totalOrdersCount - a.totalOrdersCount;
        if (sortBy === 'reviews-desc') return b.totalReviewsCount - a.totalReviewsCount;
        if (sortBy === 'name-asc') return (a.username || '').localeCompare(b.username || '');
        return 0;
      });
  }, [userStatsList, searchTerm, roleFilter, orderFilter, sortBy]);

  // Summary counts
  const totalCustomersCount = users.filter((u) => u.role !== 'admin').length;
  const customersWithOrdersCount = userStatsList.filter(
    (u) => u.role !== 'admin' && u.totalOrdersCount > 0
  ).length;
  const totalCustomerOrdersCount = orders.length;
  const totalCustomerReviewsCount = reviews.length;

  const handleOpenDetail = (userItem) => {
    setSelectedCustomer(userItem);
    setActiveTab('info');
    setShowDetailModal(true);
  };

  // Auth & Admin check
  if (!isAuthenticated || !isAdmin) {
    return (
      <Container className="py-5 text-center" style={{ maxWidth: '600px' }}>
        <Alert variant="danger" className="p-4 shadow-sm">
          <h4 className="mb-3">🚫 Truy cập bị từ chối</h4>
          <p>Bạn cần đăng nhập với tài khoản Quản trị viên (Admin) để truy cập trang này.</p>
          <div className="d-flex justify-content-center gap-2 mt-3">
            <Button as={Link} to="/login" variant="primary">
              Đăng nhập tài khoản Admin
            </Button>
            <Button as={Link} to="/" variant="outline-secondary">
              Về trang chủ
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" role="status" />
        <p className="mt-3 text-muted">Đang tải danh sách khách hàng...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Title & Quick Actions */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="mb-1">👥 Quản lý Khách hàng</h2>
          <p className="text-muted mb-0">
            Xem thông tin chi tiết, lịch sử mua hàng và tất cả đánh giá của khách hàng
          </p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <Button as={Link} to="/admin/dashboard" variant="outline-primary" className="fw-semibold">
            📊 Dashboard
          </Button>
          <Button as={Link} to="/admin/orders" variant="outline-secondary" className="fw-semibold">
            📋 Quản lý đơn hàng
          </Button>
          <Button as={Link} to="/admin/products" variant="outline-secondary" className="fw-semibold">
            🌷 Quản lý sản phẩm
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
          {error}
        </Alert>
      )}

      {/* 4 Stat Cards */}
      <Row className="g-3 mb-4">
        <Col sm={6} lg={3}>
          <Card className="shadow-sm border-0 h-100 bg-primary text-white">
            <Card.Body className="d-flex align-items-center">
              <div className="fs-1 me-3">👥</div>
              <div>
                <div className="text-white-50 small fw-bold text-uppercase">
                  Tổng khách hàng
                </div>
                <div className="fs-3 fw-bold">{totalCustomersCount} tài khoản</div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={6} lg={3}>
          <Card className="shadow-sm border-0 h-100 bg-success text-white">
            <Card.Body className="d-flex align-items-center">
              <div className="fs-1 me-3">🛍️</div>
              <div>
                <div className="text-white-50 small fw-bold text-uppercase">
                  Khách đã mua hàng
                </div>
                <div className="fs-3 fw-bold">{customersWithOrdersCount} người</div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={6} lg={3}>
          <Card className="shadow-sm border-0 h-100 bg-info text-white">
            <Card.Body className="d-flex align-items-center">
              <div className="fs-1 me-3">📦</div>
              <div>
                <div className="text-white-50 small fw-bold text-uppercase">
                  Tổng đơn đặt
                </div>
                <div className="fs-3 fw-bold">{totalCustomerOrdersCount} đơn</div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={6} lg={3}>
          <Card className="shadow-sm border-0 h-100 bg-warning text-dark">
            <Card.Body className="d-flex align-items-center">
              <div className="fs-1 me-3">💬</div>
              <div>
                <div className="text-muted small fw-bold text-uppercase">
                  Tổng đánh giá
                </div>
                <div className="fs-3 fw-bold">{totalCustomerReviewsCount} nhận xét</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters Card */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body className="p-3">
          <Row className="g-2 align-items-center">
            {/* Search Input */}
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text className="bg-light border-end-0">🔍</InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Tìm theo username, tên, SĐT, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-start-0"
                />
                {searchTerm && (
                  <Button
                    variant="outline-secondary"
                    className="border-start-0"
                    onClick={() => setSearchTerm('')}
                  >
                    ✕
                  </Button>
                )}
              </InputGroup>
            </Col>

            {/* Role Filter */}
            <Col sm={6} md={2}>
              <Form.Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">Tất cả vai trò</option>
                <option value="customer">Khách hàng</option>
                <option value="admin">Quản trị viên</option>
              </Form.Select>
            </Col>

            {/* Order Filter */}
            <Col sm={6} md={3}>
              <Form.Select
                value={orderFilter}
                onChange={(e) => setOrderFilter(e.target.value)}
              >
                <option value="all">Tất cả lịch sử đơn</option>
                <option value="has_orders">Đã từng mua hàng</option>
                <option value="no_orders">Chưa từng mua hàng</option>
              </Form.Select>
            </Col>

            {/* Sort Filter */}
            <Col sm={12} md={3}>
              <Form.Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Sắp xếp mặc định</option>
                <option value="spent-desc">Chi tiêu nhiều nhất</option>
                <option value="orders-desc">Số đơn hàng nhiều nhất</option>
                <option value="reviews-desc">Đánh giá nhiều nhất</option>
                <option value="name-asc">Tên tài khoản (A-Z)</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Customers Table */}
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold">📋 Danh sách Khách hàng ({filteredUsers.length})</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="py-3 ps-3">Tài khoản & Tên</th>
                <th className="py-3">Thông tin liên hệ</th>
                <th className="py-3">Địa chỉ giao hàng</th>
                <th className="py-3 text-center" style={{ width: '100px' }}>
                  Đơn hàng
                </th>
                <th className="py-3 text-end" style={{ width: '150px' }}>
                  Tổng chi tiêu
                </th>
                <th className="py-3 text-center" style={{ width: '110px' }}>
                  Đánh giá
                </th>
                <th className="py-3 text-center" style={{ width: '130px' }}>
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers && filteredUsers.length > 0 ? (
                filteredUsers.map((u) => {
                  const isAdminUser = u.role === 'admin';
                  return (
                    <tr key={u.userId || u.username}>
                      {/* Username & Full Name */}
                      <td className="ps-3">
                        <div className="d-flex align-items-center">
                          <div
                            className={`rounded-circle d-flex align-items-center justify-content-center text-white fw-bold me-2 ${
                              isAdminUser ? 'bg-danger' : 'bg-primary'
                            }`}
                            style={{ width: '38px', height: '38px', fontSize: '1rem', flexShrink: 0 }}
                          >
                            {isAdminUser ? '👑' : (u.username?.[0] || 'U').toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-bold d-flex align-items-center gap-1">
                              {u.username}
                              {isAdminUser && (
                                <Badge bg="danger" style={{ fontSize: '0.65rem' }}>
                                  Admin
                                </Badge>
                              )}
                            </div>
                            <small className="text-muted">
                              {u.fullName || (isAdminUser ? 'Quản trị viên' : 'Khách hàng')}
                            </small>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td>
                        <div className="small">
                          <div>📞 {u.phone || <span className="text-muted">Chưa cập nhật</span>}</div>
                          <div className="text-muted">✉️ {u.email || 'Chưa cập nhật'}</div>
                        </div>
                      </td>

                      {/* Address */}
                      <td style={{ maxWidth: '220px' }}>
                        <small className="text-truncate d-block" title={u.address}>
                          📍 {u.address || <span className="text-muted">Chưa cập nhật</span>}
                        </small>
                      </td>

                      {/* Total Orders */}
                      <td className="text-center">
                        <Badge bg={u.totalOrdersCount > 0 ? 'primary' : 'light'} text={u.totalOrdersCount > 0 ? 'white' : 'muted'} pill>
                          {u.totalOrdersCount} đơn
                        </Badge>
                      </td>

                      {/* Total Spent */}
                      <td className="text-end fw-semibold">
                        <span className={u.totalSpent > 0 ? 'text-success' : 'text-muted'}>
                          {formatPrice(u.totalSpent)}
                        </span>
                      </td>

                      {/* Total Reviews */}
                      <td className="text-center">
                        <Badge bg={u.totalReviewsCount > 0 ? 'warning' : 'light'} text={u.totalReviewsCount > 0 ? 'dark' : 'muted'} pill>
                          💬 {u.totalReviewsCount}
                        </Badge>
                      </td>

                      {/* Action Button */}
                      <td className="text-center">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="fw-semibold"
                          onClick={() => handleOpenDetail(u)}
                        >
                          👁️ Chi tiết
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    Không tìm thấy khách hàng nào phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Comprehensive Customer Detail Modal */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="lg"
        centered
      >
        {selectedCustomer && (
          <>
            <Modal.Header closeButton className="bg-light">
              <div className="d-flex align-items-center">
                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center text-white fw-bold me-3 ${
                    selectedCustomer.role === 'admin' ? 'bg-danger' : 'bg-primary'
                  }`}
                  style={{ width: '48px', height: '48px', fontSize: '1.25rem' }}
                >
                  {selectedCustomer.role === 'admin' ? '👑' : (selectedCustomer.username?.[0] || 'U').toUpperCase()}
                </div>
                <div>
                  <Modal.Title className="h5 mb-0 fw-bold d-flex align-items-center gap-2">
                    {selectedCustomer.username}
                    <Badge bg={selectedCustomer.role === 'admin' ? 'danger' : 'primary'}>
                      {selectedCustomer.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                    </Badge>
                  </Modal.Title>
                  <small className="text-muted">
                    {selectedCustomer.fullName ? `${selectedCustomer.fullName} • ` : ''}
                    {selectedCustomer.email || 'Chưa có email'}
                  </small>
                </div>
              </div>
            </Modal.Header>

            <Modal.Body className="p-4">
              <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                <Nav variant="pills" className="mb-3 gap-2">
                  <Nav.Item>
                    <Nav.Link eventKey="info" className="fw-semibold">
                      👤 Thông tin cá nhân
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="orders" className="fw-semibold">
                      🛍️ Lịch sử mua hàng ({selectedCustomer.orders?.length || 0})
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="reviews" className="fw-semibold">
                      💬 Đánh giá & Bình luận ({selectedCustomer.reviews?.length || 0})
                    </Nav.Link>
                  </Nav.Item>
                </Nav>

                <Tab.Content>
                  {/* TAB 1: THÔNG TIN CÁ NHÂN */}
                  <Tab.Pane eventKey="info">
                    <Row className="g-3">
                      <Col md={7}>
                        <Card className="border bg-light h-100">
                          <Card.Body>
                            <h6 className="fw-bold mb-3 text-primary">Thông tin hồ sơ</h6>
                            <Table borderless size="sm" className="mb-0">
                              <tbody>
                                <tr>
                                  <td className="text-muted" style={{ width: '130px' }}>Tên đăng nhập:</td>
                                  <td className="fw-bold">{selectedCustomer.username}</td>
                                </tr>
                                <tr>
                                  <td className="text-muted">Họ và tên:</td>
                                  <td className="fw-semibold">
                                    {selectedCustomer.fullName || (selectedCustomer.role === 'admin' ? 'Quản trị viên hệ thống' : 'Chưa cập nhật')}
                                  </td>
                                </tr>
                                <tr>
                                  <td className="text-muted">Số điện thoại:</td>
                                  <td>{selectedCustomer.phone || 'Chưa cập nhật'}</td>
                                </tr>
                                <tr>
                                  <td className="text-muted">Email:</td>
                                  <td>{selectedCustomer.email || 'Chưa cập nhật'}</td>
                                </tr>
                                <tr>
                                  <td className="text-muted">Địa chỉ nhận hàng:</td>
                                  <td>{selectedCustomer.address || 'Chưa cập nhật'}</td>
                                </tr>
                                <tr>
                                  <td className="text-muted">Câu hỏi bảo mật:</td>
                                  <td className="text-muted fst-italic">
                                    {selectedCustomer.securityQuestion ? `"${selectedCustomer.securityQuestion}"` : 'Đã thiết lập'}
                                  </td>
                                </tr>
                              </tbody>
                            </Table>
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col md={5}>
                        <Card className="border bg-light h-100">
                          <Card.Body>
                            <h6 className="fw-bold mb-3 text-success">Thống kê hoạt động</h6>
                            <div className="d-flex justify-content-between mb-2 pb-1 border-bottom">
                              <span className="text-muted">Tổng số đơn đặt:</span>
                              <Badge bg="primary" pill>{selectedCustomer.totalOrdersCount} đơn</Badge>
                            </div>
                            <div className="d-flex justify-content-between mb-2 pb-1 border-bottom">
                              <span className="text-muted">Đơn hoàn thành:</span>
                              <Badge bg="success" pill>{selectedCustomer.completedOrders?.length || 0} đơn</Badge>
                            </div>
                            <div className="d-flex justify-content-between mb-2 pb-1 border-bottom">
                              <span className="text-muted">Tổng chi tiêu:</span>
                              <span className="fw-bold text-success">{formatPrice(selectedCustomer.totalSpent)}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                              <span className="text-muted">Số bài đánh giá:</span>
                              <Badge bg="warning" text="dark" pill>{selectedCustomer.totalReviewsCount} nhận xét</Badge>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Tab.Pane>

                  {/* TAB 2: LỊCH SỬ MUA HÀNG */}
                  <Tab.Pane eventKey="orders">
                    {selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
                      <div className="table-responsive">
                        <Table hover className="align-middle border">
                          <thead className="table-light">
                            <tr>
                              <th>Mã đơn</th>
                              <th>Ngày đặt</th>
                              <th>Sản phẩm</th>
                              <th className="text-end">Tổng tiền</th>
                              <th className="text-center">Trạng thái</th>
                              <th className="text-center">Chi tiết</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedCustomer.orders.map((o) => (
                              <tr key={o.orderId}>
                                <td className="fw-bold">#{o.orderId}</td>
                                <td className="small text-muted">{o.createdAt}</td>
                                <td>
                                  <div className="small" style={{ maxWidth: '240px' }}>
                                    {o.items?.map((item, idx) => (
                                      <div key={idx} className="text-truncate">
                                        • {item.productName} <b>x{item.quantity}</b>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                                <td className="text-end fw-bold text-primary">
                                  {formatPrice(o.total)}
                                </td>
                                <td className="text-center">{statusBadge(o.status)}</td>
                                <td className="text-center">
                                  <Button
                                    as={Link}
                                    to={`/orders/${o.orderId}`}
                                    variant="outline-info"
                                    size="sm"
                                  >
                                    Xem
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    ) : (
                      <Alert variant="info" className="text-center py-4">
                        Khách hàng này chưa có đơn hàng nào trong hệ thống.
                      </Alert>
                    )}
                  </Tab.Pane>

                  {/* TAB 3: ĐÁNH GIÁ & BÌNH LUẬN */}
                  <Tab.Pane eventKey="reviews">
                    {selectedCustomer.reviews && selectedCustomer.reviews.length > 0 ? (
                      <div className="d-flex flex-column gap-3">
                        {selectedCustomer.reviews.map((rev) => (
                          <Card key={rev.reviewId} className="border shadow-none">
                            <Card.Body className="p-3">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <div className="d-flex align-items-center gap-2">
                                  {rev.productImage && (
                                    <img
                                      src={rev.productImage}
                                      alt={rev.productName}
                                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }}
                                    />
                                  )}
                                  <div>
                                    <Link
                                      to={`/products/${rev.productId}`}
                                      className="fw-bold text-decoration-none text-dark"
                                      target="_blank"
                                    >
                                      {rev.productName}
                                    </Link>
                                    <div className="d-flex align-items-center gap-1">
                                      {renderStars(rev.rating)}
                                      <small className="text-muted ms-1">({rev.rating}/5)</small>
                                    </div>
                                  </div>
                                </div>
                                <small className="text-muted">{rev.createdAt}</small>
                              </div>
                              <div className="p-2 bg-light rounded text-secondary fst-italic">
                                "{rev.comment}"
                              </div>
                            </Card.Body>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Alert variant="info" className="text-center py-4">
                        Khách hàng này chưa viết bình luận hoặc đánh giá nào.
                      </Alert>
                    )}
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Modal.Body>

            <Modal.Footer className="bg-light">
              <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                Đóng
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </Container>
  );
}

export default AdminCustomers;
