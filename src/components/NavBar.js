import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, NavDropdown, Badge, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import logoImg from '../images/logo.jpg';
import { useAuth } from '../contexts/AuthContext';

function NavBar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  // Update cart count on mount and when localStorage changes
  useEffect(() => {
    const updateCart = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(count);
      } catch (e) {
        setCartCount(0);
      }
    };
    updateCart();
    // Listen for storage changes (e.g. from other tabs or add-to-cart)
    window.addEventListener('storage', updateCart);
    window.addEventListener('cartUpdated', updateCart);
    // Also poll every 2 seconds for same-tab changes
    const interval = setInterval(updateCart, 2000);
    return () => {
      window.removeEventListener('storage', updateCart);
      window.removeEventListener('cartUpdated', updateCart);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm sticky-top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          <img src={logoImg} alt="Logo" style={{ height: '30px' }} />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Trang Chủ</Nav.Link>
            <Nav.Link as={Link} to="/products">Sản Phẩm</Nav.Link>

            {/* Customer menu - only visible when logged in */}
            {isAuthenticated && !isAdmin && (
              <>
                <Nav.Link as={Link} to="/orders">Đơn Hàng</Nav.Link>
              </>
            )}

            {/* Admin menu - only visible for admin */}
            {isAuthenticated && isAdmin && (
              <NavDropdown title="🔧 Quản Trị" id="admin-dropdown">
                <NavDropdown.Item as={Link} to="/admin/dashboard">📊 Dashboard</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="/admin/products">🌷 Quản Lý Sản Phẩm</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/add-product">➕ Thêm Sản Phẩm</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/orders">📋 Quản Lý Đơn Hàng</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/customers">👥 Quản Lý Khách Hàng</NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>

          <Nav className="align-items-center">
            {/* Cart - visible for everyone */}
            <Nav.Link as={Link} to="/cart" className="position-relative me-3">
              🛒 Giỏ Hàng
              {cartCount > 0 && (
                <Badge
                  bg="danger"
                  pill
                  style={{
                    position: 'absolute',
                    top: '0',
                    right: '-5px',
                    fontSize: '0.7rem',
                  }}
                >
                  {cartCount}
                </Badge>
              )}
            </Nav.Link>

            {isAuthenticated ? (
              <NavDropdown
                title={
                  <span>
                    👤 {user?.username || 'User'}
                    {isAdmin && (
                      <Badge bg="warning" text="dark" className="ms-1" style={{ fontSize: '0.65rem' }}>
                        Admin
                      </Badge>
                    )}
                  </span>
                }
                id="user-dropdown"
                align="end"
              >
                {!isAdmin && (
                  <>
                    <NavDropdown.Item as={Link} to="/orders">Lịch Sử Đơn Hàng</NavDropdown.Item>
                    <NavDropdown.Divider />
                  </>
                )}
                <NavDropdown.Item onClick={handleLogout} className="text-danger">
                  Đăng Xuất
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Button
                  as={Link}
                  to="/login"
                  variant="outline-primary"
                  size="sm"
                  className="fw-semibold px-3"
                >
                  Đăng Nhập
                </Button>
                <Button
                  as={Link}
                  to="/register"
                  variant="primary"
                  size="sm"
                  className="fw-bold px-3 text-white shadow-sm"
                  style={{
                    backgroundColor: '#0d6efd',
                    borderColor: '#0d6efd',
                    color: '#ffffff',
                    letterSpacing: '0.3px',
                  }}
                >
                  Đăng Ký
                </Button>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
