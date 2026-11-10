import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Form, Row, Col, Card, Alert, Image } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

function Cart() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    } catch (err) {
      console.error('Lỗi khi đọc giỏ hàng từ localStorage:', err);
      setCart([]);
    }
  }, []);

  // Format currency in VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  // Calculate unit price after discount
  const getUnitPrice = (item) => {
    if (item.discount && item.discount > 0) {
      return item.price * (1 - item.discount / 100);
    }
    return item.price;
  };

  // Update item quantity
  const handleQuantityChange = (productId, val) => {
    const newQty = parseInt(val, 10);
    if (isNaN(newQty) || newQty < 1) return;

    const updatedCart = cart.map((item) =>
      item.productId === productId ? { ...item, quantity: newQty } : item
    );
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  // Remove single item from cart
  const handleRemoveItem = (productId) => {
    const updatedCart = cart.filter((item) => item.productId !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  // Clear all items
  const handleClearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  // Calculate grand total
  const totalAmount = cart.reduce((sum, item) => {
    return sum + getUnitPrice(item) * item.quantity;
  }, 0);

  // If cart is empty
  if (cart.length === 0) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="info" className="py-5 shadow-sm rounded">
          <div className="mb-3 fs-1">🛒</div>
          <h3 className="mb-3">Giỏ hàng của bạn đang trống</h3>
          <p className="text-muted mb-4">
            Bạn chưa chọn bó hoa nào. Hãy duyệt qua danh mục hoa tươi tuyệt đẹp của chúng tôi và chọn những mẫu hoa ưng ý nhất nhé!
          </p>
          <Button as={Link} to="/products" variant="primary" size="lg" className="px-4">
            Khám phá sản phẩm
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>🌸 Giỏ hàng của bạn ({cart.length} sản phẩm)</h2>
        <Button variant="outline-danger" size="sm" onClick={handleClearCart}>
          Xóa toàn bộ giỏ hàng
        </Button>
      </div>

      <Card className="shadow-sm border-0 mb-4">
        <Card.Body className="p-0">
          <Table responsive hover className="align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: '80px' }} className="text-center">Hình ảnh</th>
                <th>Tên sản phẩm</th>
                <th className="text-end">Đơn giá</th>
                <th style={{ width: '120px' }} className="text-center">Số lượng</th>
                <th className="text-end">Thành tiền</th>
                <th style={{ width: '100px' }} className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => {
                const unitPrice = getUnitPrice(item);
                const subtotal = unitPrice * item.quantity;

                return (
                  <tr key={item.productId}>
                    <td className="text-center">
                      <Image
                        src={item.image || 'https://via.placeholder.com/60x60?text=Hoa'}
                        alt={item.productName}
                        style={{
                          width: '60px',
                          height: '60px',
                          objectFit: 'cover',
                          borderRadius: '6px',
                        }}
                      />
                    </td>
                    <td>
                      <Link
                        to={`/products/${item.productId}`}
                        className="fw-bold text-decoration-none text-dark"
                      >
                        {item.productName}
                      </Link>
                      {item.discount > 0 && (
                        <div>
                          <small className="text-danger fw-semibold">
                            Giảm {item.discount}%
                          </small>
                        </div>
                      )}
                    </td>
                    <td className="text-end">
                      {item.discount > 0 ? (
                        <>
                          <div className="text-muted text-decoration-line-through small">
                            {formatPrice(item.price)}
                          </div>
                          <div className="fw-semibold text-danger">
                            {formatPrice(unitPrice)}
                          </div>
                        </>
                      ) : (
                        <span className="fw-semibold">{formatPrice(item.price)}</span>
                      )}
                    </td>
                    <td className="text-center">
                      <Form.Control
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(item.productId, e.target.value)
                        }
                        className="text-center mx-auto"
                        style={{ width: '75px' }}
                      />
                    </td>
                    <td className="text-end fw-bold text-primary">
                      {formatPrice(subtotal)}
                    </td>
                    <td className="text-center">
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleRemoveItem(item.productId)}
                        title="Xóa sản phẩm"
                      >
                        Xóa
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Row className="g-4 align-items-center">
        <Col md={6}>
          <Button
            as={Link}
            to="/products"
            variant="outline-secondary"
            className="px-4 py-2"
          >
            ← Tiếp tục mua sắm
          </Button>
        </Col>
        <Col md={6}>
          <Card className="border-0 shadow-sm bg-light">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="fs-5 text-muted">Tổng cộng:</span>
                <span className="fs-3 fw-bold text-danger">
                  {formatPrice(totalAmount)}
                </span>
              </div>
              <p className="text-muted small mb-3">
                * Giá đã bao gồm thuế VAT và chưa tính phí vận chuyển / mã giảm giá.
              </p>
              <Button
                variant="success"
                size="lg"
                className="w-100 fw-bold py-2 shadow-sm"
                onClick={() => navigate('/checkout')}
              >
                Tiến hành thanh toán →
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Cart;
