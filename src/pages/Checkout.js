import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Table,
  InputGroup,
  Image,
} from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createOrder, applyCoupon, getUserProfile } from '../services/api';
import qrCodeImg from '../images/thanhtoan.jpg';

function Checkout() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Cart state
  const [cart, setCart] = useState([]);
  
  // Shipping form state
  const [shippingData, setShippingData] = useState({
    fullName: '',
    phone: '',
    address: '',
    note: '',
  });

  // Re-order notice state
  const [reorderNotice, setReorderNotice] = useState(false);

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState('COD');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState(null);
  const [couponError, setCouponError] = useState(null);

  // Order submission state
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState(null);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    } catch (err) {
      console.error('Lỗi khi tải giỏ hàng:', err);
      setCart([]);
    }
  }, []);

  // Pre-fill user shipping info from reorder state or profile
  useEffect(() => {
    if (location.state?.reorderShipping) {
      const rs = location.state.reorderShipping;
      setShippingData({
        fullName: rs.fullName || '',
        phone: rs.phone || '',
        address: rs.address || '',
        note: rs.note || '',
      });
      if (rs.paymentMethod) {
        setPaymentMethod(rs.paymentMethod);
      }
      setReorderNotice(true);
    } else if (user?.username) {
      getUserProfile(user.username)
        .then((res) => {
          const profile = res.data;
          setShippingData((prev) => ({
            ...prev,
            fullName: prev.fullName || profile.username || '',
            phone: prev.phone || profile.phone || '',
            address: prev.address || profile.address || '',
          }));
        })
        .catch(() => {
          setShippingData((prev) => ({
            ...prev,
            fullName: prev.fullName || user.username,
          }));
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, location.state]);

  // Format currency in VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  const getUnitPrice = (item) => {
    if (item.discount && item.discount > 0) {
      return item.price * (1 - item.discount / 100);
    }
    return item.price;
  };

  const subtotal = cart.reduce((sum, item) => {
    return sum + getUnitPrice(item) * item.quantity;
  }, 0);

  const discountRate = appliedCoupon?.discount || 0;
  const discountAmount = Math.round((subtotal * discountRate) / 100);
  const finalTotal = Math.max(0, subtotal - discountAmount);

  // Handle shipping field changes
  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingData((prev) => ({ ...prev, [name]: value }));
  };

  // Apply Coupon handler
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError(null);
    setCouponMessage(null);

    try {
      const res = await applyCoupon(couponCode.trim());
      setAppliedCoupon(res.data);
      setCouponMessage(`Áp dụng thành công! Giảm ${res.data.discount}% trên tổng giá trị đơn hàng.`);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(
        err.response?.data?.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn.'
      );
    } finally {
      setCouponLoading(false);
    }
  };

  // Place Order handler
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!shippingData.fullName.trim() || !shippingData.phone.trim() || !shippingData.address.trim()) {
      setOrderError('Vui lòng điền đầy đủ Họ và tên, Số điện thoại và Địa chỉ giao hàng.');
      return;
    }

    if (cart.length === 0) {
      setOrderError('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi thanh toán.');
      return;
    }

    setSubmitting(true);
    setOrderError(null);

    try {
      const formattedItems = cart.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        price: getUnitPrice(item),
        quantity: item.quantity,
      }));

      const fullShippingAddress = `${shippingData.fullName} | SĐT: ${shippingData.phone} | Đ/C: ${shippingData.address}${
        shippingData.note ? ` | Ghi chú: ${shippingData.note}` : ''
      } | Phương thức: ${paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng'}`;

      const payload = {
        items: formattedItems,
        total: finalTotal,
        shippingAddress: fullShippingAddress,
        customerName: shippingData.fullName,
        username: user?.username || 'user',
        phone: shippingData.phone,
        paymentMethod: paymentMethod === 'COD' ? 'COD' : 'BANK_TRANSFER',
      };

      await createOrder(payload);

      // Clear cart
      localStorage.removeItem('cart');
      setCart([]);
      window.dispatchEvent(new Event('cartUpdated'));
      window.dispatchEvent(new Event('storage'));
      setOrderSuccess(true);

      // Navigate to orders after short delay
      setTimeout(() => {
        navigate('/orders');
      }, 1500);
    } catch (err) {
      setOrderError(
        err.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.'
      );
      setSubmitting(false);
    }
  };

  // If user is not authenticated
  if (!isAuthenticated) {
    return (
      <Container className="py-5 text-center" style={{ maxWidth: '600px' }}>
        <Alert variant="warning" className="p-4 shadow-sm">
          <h4 className="mb-3">🔐 Yêu cầu đăng nhập</h4>
          <p>Bạn cần đăng nhập tài khoản để thực hiện thanh toán đơn hàng.</p>
          <div className="d-flex justify-content-center gap-3 mt-3">
            <Button
              as={Link}
              to="/login"
              state={{ from: { pathname: '/checkout' } }}
              variant="primary"
            >
              Đăng nhập ngay
            </Button>
            <Button as={Link} to="/cart" variant="outline-secondary">
              Quay lại giỏ hàng
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  // If cart is empty and order wasn't just submitted
  if (cart.length === 0 && !orderSuccess) {
    return (
      <Container className="py-5 text-center" style={{ maxWidth: '600px' }}>
        <Alert variant="info" className="p-4 shadow-sm">
          <h4 className="mb-3">🛒 Giỏ hàng trống</h4>
          <p>Không có sản phẩm nào trong giỏ hàng để thanh toán.</p>
          <Button as={Link} to="/products" variant="primary">
            Quay lại mua sắm
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">💳 Thanh toán đơn hàng</h2>

      {orderSuccess && (
        <Alert variant="success" className="py-3 shadow-sm mb-4">
          <Alert.Heading>🎉 Đặt hàng thành công!</Alert.Heading>
          <p className="mb-0">
            Cảm ơn bạn đã mua hàng. Đơn hàng đang được xử lý. Đang chuyển hướng đến trang đơn hàng của bạn...
          </p>
        </Alert>
      )}

      {orderError && (
        <Alert variant="danger" dismissible onClose={() => setOrderError(null)} className="mb-4">
          {orderError}
        </Alert>
      )}

      {reorderNotice && (
        <Alert
          variant="info"
          dismissible
          onClose={() => setReorderNotice(false)}
          className="shadow-sm mb-4"
        >
          <div className="fw-bold">🔄 Bạn đang thực hiện mua lại đơn hàng!</div>
          Toàn bộ sản phẩm và thông tin người nhận từ đơn hàng trước đã được tự động điền sẵn. Bạn có thể kiểm tra và tùy ý chỉnh sửa lại họ tên, số điện thoại, địa chỉ hoặc ghi chú bên dưới trước khi xác nhận đặt hàng.
        </Alert>
      )}

      <Form onSubmit={handlePlaceOrder}>
        <Row className="g-4">
          {/* Left Column: Shipping & Payment */}
          <Col lg={7}>
            {/* Shipping Info Card */}
            <Card className="shadow-sm border-0 mb-4">
              <Card.Header className="bg-white py-3 border-bottom">
                <h5 className="mb-0 fw-bold">📦 Thông tin giao hàng</h5>
              </Card.Header>
              <Card.Body className="p-4">
                <Form.Group className="mb-3" controlId="fullName">
                  <Form.Label>
                    Họ và tên người nhận <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="fullName"
                    value={shippingData.fullName}
                    onChange={handleShippingChange}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="phone">
                  <Form.Label>
                    Số điện thoại liên hệ <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={shippingData.phone}
                    onChange={handleShippingChange}
                    placeholder="Ví dụ: 0912345678"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="address">
                  <Form.Label>
                    Địa chỉ chi tiết <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="address"
                    value={shippingData.address}
                    onChange={handleShippingChange}
                    placeholder="Số nhà, ngõ/ngách, tên đường, phường/xã, quận/huyện, tỉnh/TP"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-0" controlId="note">
                  <Form.Label>Ghi chú đơn hàng (tùy chọn)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="note"
                    value={shippingData.note}
                    onChange={handleShippingChange}
                    placeholder="Ví dụ: Giao giờ hành chính, lời nhắn chúc mừng đính kèm..."
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Payment Method Card */}
            <Card className="shadow-sm border-0 mb-4">
              <Card.Header className="bg-white py-3 border-bottom">
                <h5 className="mb-0 fw-bold">💰 Phương thức thanh toán</h5>
              </Card.Header>
              <Card.Body className="p-4">
                <Form.Check
                  type="radio"
                  id="payment-cod"
                  name="paymentMethod"
                  label="Thanh toán khi nhận hàng (COD)"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mb-3"
                />
                <Form.Check
                  type="radio"
                  id="payment-bank"
                  name="paymentMethod"
                  label="Chuyển khoản ngân hàng (QR Code / Internet Banking)"
                  value="BANK_TRANSFER"
                  checked={paymentMethod === 'BANK_TRANSFER'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />

                {paymentMethod === 'BANK_TRANSFER' && (
                  <div className="mt-3 text-center">
                    <Alert variant="secondary" className="mb-3 small text-start">
                      <strong>Thông tin chuyển khoản:</strong>
                      <br />
                      Ngân hàng: Vietcombank - CN TP.HCM
                      <br />
                      Số tài khoản: 9876543210
                      <br />
                      Chủ tài khoản: CỬA HÀNG HOA TƯƠI FLOWER SHOP
                      <br />
                      Nội dung CK: [Họ tên] [Số điện thoại]
                    </Alert>
                    <div className="border rounded p-3 bg-white shadow-sm">
                      <p className="fw-bold mb-2">📱 Quét mã QR để thanh toán:</p>
                      <img
                        src={qrCodeImg}
                        alt="QR Code Thanh Toán"
                        style={{ maxWidth: '250px', width: '100%', borderRadius: '8px' }}
                      />
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Right Column: Order Summary & Coupon */}
          <Col lg={5}>
            <Card className="shadow-sm border-0 mb-4">
              <Card.Header className="bg-white py-3 border-bottom">
                <h5 className="mb-0 fw-bold">🧾 Tóm tắt đơn hàng ({cart.length} món)</h5>
              </Card.Header>
              <Card.Body className="p-3">
                <Table borderless size="sm" className="align-middle mb-0">
                  <tbody>
                    {cart.map((item) => {
                      const unitPrice = getUnitPrice(item);
                      return (
                        <tr key={item.productId} className="border-bottom">
                          <td style={{ width: '50px' }}>
                            <Image
                              src={item.image || 'https://via.placeholder.com/50'}
                              alt={item.productName}
                              style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '4px' }}
                            />
                          </td>
                          <td>
                            <div className="fw-semibold text-truncate" style={{ maxWidth: '180px' }}>
                              {item.productName}
                            </div>
                            <small className="text-muted">
                              {item.quantity} x {formatPrice(unitPrice)}
                            </small>
                          </td>
                          <td className="text-end fw-semibold">
                            {formatPrice(unitPrice * item.quantity)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>

                {/* Coupon Code Input */}
                <div className="mt-4 pt-3 border-top">
                  <Form.Label className="fw-semibold small">Mã giảm giá (Coupon)</Form.Label>
                  <InputGroup className="mb-2">
                    <Form.Control
                      type="text"
                      placeholder="Nhập mã (FLOWER10, WELCOME...)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      disabled={couponLoading || !!appliedCoupon}
                    />
                    {appliedCoupon ? (
                      <Button
                        variant="outline-danger"
                        onClick={() => {
                          setAppliedCoupon(null);
                          setCouponCode('');
                          setCouponMessage(null);
                        }}
                      >
                        Hủy mã
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                      >
                        {couponLoading ? <Spinner size="sm" animation="border" /> : 'Áp dụng'}
                      </Button>
                    )}
                  </InputGroup>

                  {couponMessage && (
                    <Alert variant="success" className="py-2 small mb-2">
                      {couponMessage}
                    </Alert>
                  )}
                  {couponError && (
                    <Alert variant="danger" className="py-2 small mb-2">
                      {couponError}
                    </Alert>
                  )}
                </div>

                {/* Pricing Summary */}
                <div className="mt-4 pt-3 border-top">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Tạm tính:</span>
                    <span className="fw-semibold">{formatPrice(subtotal)}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="d-flex justify-content-between mb-2 text-success">
                      <span>
                        Giảm giá ({appliedCoupon.code} - {appliedCoupon.discount}%):
                      </span>
                      <span className="fw-semibold">-{formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Phí vận chuyển:</span>
                    <span className="text-success fw-semibold">Miễn phí</span>
                  </div>

                  <div className="d-flex justify-content-between pt-3 border-top fs-5">
                    <span className="fw-bold">Tổng thanh toán:</span>
                    <span className="fw-bold text-danger">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                {/* Place Order Button */}
                <Button
                  type="submit"
                  variant="success"
                  size="lg"
                  className="w-100 fw-bold mt-4 py-3 shadow-sm"
                  disabled={submitting || cart.length === 0}
                >
                  {submitting ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Đang xử lý đặt hàng...
                    </>
                  ) : (
                    'Xác nhận đặt hàng'
                  )}
                </Button>

                <div className="text-center mt-3">
                  <Link to="/cart" className="text-muted small text-decoration-none">
                    ← Quay lại chỉnh sửa giỏ hàng
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
}

export default Checkout;
