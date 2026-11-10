import React, { useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Spinner,
  Alert,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAdminSummary, getProducts } from '../../services/api';

function AdminDashboard() {
  const { isAdmin, isAuthenticated } = useAuth();
  const [summary, setSummary] = useState(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format currency in VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const [sumRes, prodRes] = await Promise.all([
          getAdminSummary(),
          getProducts(),
        ]);
        setSummary(sumRes.data);
        setTotalProducts(prodRes.data?.length || 0);
      } catch (err) {
        setError(
          err.response?.data?.message || 'Không thể tải dữ liệu quản trị.'
        );
      } finally {
        setLoading(false);
      }
    }

    if (isAdmin) {
      fetchData();
    } else {
      setLoading(false);
    }

    const handleDataChange = () => {
      fetchData();
    };

    window.addEventListener('ordersUpdated', handleDataChange);
    window.addEventListener('productsUpdated', handleDataChange);
    window.addEventListener('storage', handleDataChange);

    return () => {
      window.removeEventListener('ordersUpdated', handleDataChange);
      window.removeEventListener('productsUpdated', handleDataChange);
      window.removeEventListener('storage', handleDataChange);
    };
  }, [isAdmin]);

  // Auth & Admin check
  if (!isAuthenticated || !isAdmin) {
    return (
      <Container className="py-5 text-center" style={{ maxWidth: '600px' }}>
        <Alert variant="danger" className="p-4 shadow-sm">
          <h4 className="mb-3">🚫 Truy cập bị từ chối</h4>
          <p>
            Bạn cần đăng nhập với tài khoản Quản trị viên (Admin) để truy cập trang này.
          </p>
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

  // Loading state
  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" role="status" />
        <p className="mt-3 text-muted">Đang tải thông tin bảng điều khiển quản trị...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Title & Quick Actions */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="mb-1">📊 Bảng điều khiển Quản trị viên</h2>
          <p className="text-muted mb-0">Tổng quan tình hình kinh doanh và quản lý kho hàng Flower Shop</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <Button as={Link} to="/admin/products" variant="primary" className="fw-semibold">
            🌷 Quản lý sản phẩm
          </Button>
          <Button as={Link} to="/admin/add-product" variant="success" className="fw-semibold">
            ➕ Thêm sản phẩm
          </Button>
          <Button as={Link} to="/admin/orders" variant="outline-primary" className="fw-semibold">
            📋 Quản lý đơn hàng
          </Button>
          <Button as={Link} to="/admin/customers" variant="outline-dark" className="fw-semibold">
            👥 Quản lý khách hàng
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
          {error}
        </Alert>
      )}

      {/* 4 Stat Cards in a Row */}
      <Row className="g-3 mb-4">
        {/* Total Orders */}
        <Col sm={6} lg={3}>
          <Card className="shadow-sm border-0 h-100 bg-primary text-white">
            <Card.Body className="d-flex align-items-center">
              <div className="fs-1 me-3">🛍️</div>
              <div>
                <div className="text-white-50 small fw-bold text-uppercase">
                  Tổng đơn hàng
                </div>
                <div className="fs-3 fw-bold">
                  {summary?.totalOrders ?? 0}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Total Revenue */}
        <Col sm={6} lg={3}>
          <Card className="shadow-sm border-0 h-100 bg-success text-white">
            <Card.Body className="d-flex align-items-center">
              <div className="fs-1 me-3">💵</div>
              <div>
                <div className="text-white-50 small fw-bold text-uppercase">
                  Tổng doanh thu
                </div>
                <div className="fs-4 fw-bold">
                  {formatPrice(summary?.totalRevenue ?? 0)}
                </div>
                <div className="text-white-50" style={{ fontSize: '0.75rem' }}>
                  (Đã nhận hàng / thanh toán)
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Total Products */}
        <Col sm={6} lg={3}>
          <Card className="shadow-sm border-0 h-100 bg-info text-white">
            <Card.Body className="d-flex align-items-center">
              <div className="fs-1 me-3">🌷</div>
              <div>
                <div className="text-white-50 small fw-bold text-uppercase">
                  Tổng sản phẩm
                </div>
                <div className="fs-3 fw-bold">
                  {totalProducts}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Low Stock Count */}
        <Col sm={6} lg={3}>
          <Card className="shadow-sm border-0 h-100 bg-warning text-dark">
            <Card.Body className="d-flex align-items-center">
              <div className="fs-1 me-3">⚠️</div>
              <div>
                <div className="text-muted small fw-bold text-uppercase">
                  Sản phẩm sắp hết
                </div>
                <div className="fs-3 fw-bold">
                  {summary?.lowStock?.length ?? 0}
                </div>
                <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                  (Còn dưới 5 sản phẩm)
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tables Row: Top Selling & Low Stock */}
      <Row className="g-4">
        {/* Top Selling Products */}
        <Col lg={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">🔥 Sản phẩm bán chạy nhất</h5>
              <Badge bg="primary" pill>
                Top 5
              </Badge>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="py-2 ps-3">Tên sản phẩm</th>
                    <th className="py-2 text-center" style={{ width: '100px' }}>
                      Đã bán
                    </th>
                    <th className="py-2 text-end pe-3" style={{ width: '130px' }}>
                      Đơn giá
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {summary?.topProducts && summary.topProducts.length > 0 ? (
                    summary.topProducts.map((p) => (
                      <tr key={p.productId}>
                        <td className="ps-3 fw-semibold">
                          <Link
                            to={`/products/${p.productId}`}
                            className="text-decoration-none text-dark"
                          >
                            {p.productName}
                          </Link>
                        </td>
                        <td className="text-center">
                          <Badge bg="success" pill>
                            {p.sold ?? 0}
                          </Badge>
                        </td>
                        <td className="text-end pe-3 text-muted">
                          {formatPrice(p.price)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center py-4 text-muted">
                        Chưa có sản phẩm nào có lượt bán.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Low Stock Alerts */}
        <Col lg={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0 fw-bold text-danger">⚠️ Cảnh báo tồn kho thấp</h5>
                <small className="text-muted">Các sản phẩm có số lượng tồn kho dưới 5</small>
              </div>
              <Badge bg="danger" pill>
                {summary?.lowStock?.length ?? 0} cảnh báo
              </Badge>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="py-2 ps-3">Tên sản phẩm</th>
                    <th className="py-2 text-center" style={{ width: '110px' }}>
                      Tồn kho
                    </th>
                    <th className="py-2 text-center" style={{ width: '120px' }}>
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {summary?.lowStock && summary.lowStock.length > 0 ? (
                    summary.lowStock.map((p) => {
                      const isOutOfStock = (p.stock || 0) <= 0;
                      return (
                        <tr key={p.productId}>
                          <td className="ps-3 fw-semibold">
                            {p.productName}
                          </td>
                          <td className="text-center">
                            <Badge bg={isOutOfStock ? 'danger' : 'warning'} text={isOutOfStock ? 'white' : 'dark'}>
                              {isOutOfStock ? 'Hết hàng (0)' : `${p.stock} sản phẩm`}
                            </Badge>
                          </td>
                          <td className="text-center">
                            <Button
                              as={Link}
                              to={`/admin/edit-product/${p.productId}`}
                              variant="outline-secondary"
                              size="sm"
                            >
                              Nhập thêm
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center py-4 text-muted">
                        Tất cả sản phẩm đều đủ số lượng tồn kho (từ 5 sản phẩm trở lên).
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default AdminDashboard;
