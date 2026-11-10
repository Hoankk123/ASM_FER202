import React, { useEffect, useState } from 'react';
import {
  Container,
  Table,
  Badge,
  Button,
  Spinner,
  Alert,
  Card,
  Modal,
  Form,
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getOrderHistory, cancelOrderUser, updateOrderInfoUser } from '../services/api';

function parseOrderShipping(order) {
  let customerName = order.customerName || '';
  let phone = order.phone || '';
  let address = order.address || '';
  let note = order.note || '';

  if (!customerName || !phone || !address) {
    const raw = order.shippingAddress || '';
    const parts = raw.split('|').map((s) => s.trim());
    parts.forEach((part) => {
      if (part.startsWith('SĐT:')) {
        phone = phone || part.replace('SĐT:', '').trim();
      } else if (part.startsWith('Đ/C:')) {
        address = address || part.replace('Đ/C:', '').trim();
      } else if (part.startsWith('Ghi chú:')) {
        note = note || part.replace('Ghi chú:', '').trim();
      } else if (!part.startsWith('Phương thức:') && !customerName) {
        customerName = part;
      }
    });
  }
  return { customerName, phone, address, note };
}

function OrderHistory() {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Edit order info modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editFormData, setEditFormData] = useState({
    customerName: '',
    phone: '',
    address: '',
    note: '',
  });
  const [updatingInfo, setUpdatingInfo] = useState(false);

  // Cancel order modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Tôi muốn thay đổi thông tin/địa chỉ nhận hàng');
  const [cancelling, setCancelling] = useState(false);

  // If logged in as admin, automatically redirect to admin order management
  useEffect(() => {
    if (isAdmin) {
      navigate('/admin/orders', { replace: true });
    }
  }, [isAdmin, navigate]);

  // Format currency in VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  // Helper for 5 status badges
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <Badge bg="warning" text="dark">Đang xử lý</Badge>;
      case 'Processing':
        return <Badge bg="info">Đang lên đơn</Badge>;
      case 'Shipping':
        return <Badge bg="primary">Đang giao</Badge>;
      case 'Completed':
        return <Badge bg="success">Đã nhận hàng</Badge>;
      case 'Cancelled':
        return <Badge bg="danger">Đã hủy</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getOrderHistory(user?.username);
      setOrders(res.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Không thể tải lịch sử đơn hàng. Vui lòng thử lại sau.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
    }

    const handleOrdersChange = () => {
      fetchOrders();
    };

    window.addEventListener('ordersUpdated', handleOrdersChange);
    window.addEventListener('storage', handleOrdersChange);
    return () => {
      window.removeEventListener('ordersUpdated', handleOrdersChange);
      window.removeEventListener('storage', handleOrdersChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.username]);

  // Handle Re-order ("Mua lại")
  const handleReorder = (order) => {
    if (!order.items || order.items.length === 0) {
      setError('Đơn hàng không có sản phẩm để mua lại.');
      return;
    }
    try {
      // Add items to cart in localStorage
      localStorage.setItem('cart', JSON.stringify(order.items));
      window.dispatchEvent(new Event('cartUpdated'));
      window.dispatchEvent(new Event('storage'));

      const parsed = parseOrderShipping(order);
      // Navigate to checkout with prefilled information
      navigate('/checkout', {
        state: {
          reorderShipping: {
            fullName: parsed.customerName,
            phone: parsed.phone,
            address: parsed.address,
            note: parsed.note,
            paymentMethod: order.paymentMethod || 'COD',
          },
          fromReorder: true,
          reorderOrderId: order.orderId,
        },
      });
    } catch (e) {
      console.error('Lỗi khi mua lại đơn hàng:', e);
      setError('Có lỗi xảy ra khi thực hiện mua lại đơn hàng.');
    }
  };

  // Handle opening Edit Modal
  const handleOpenEdit = (order) => {
    setEditingOrder(order);
    const parsed = parseOrderShipping(order);
    setEditFormData({
      customerName: parsed.customerName,
      phone: parsed.phone,
      address: parsed.address,
      note: parsed.note,
    });
    setShowEditModal(true);
  };

  // Handle submitting Edit
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!editingOrder) return;
    if (!editFormData.customerName.trim() || !editFormData.phone.trim() || !editFormData.address.trim()) {
      setError('Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ nhận hàng.');
      return;
    }

    setUpdatingInfo(true);
    try {
      await updateOrderInfoUser(editingOrder.orderId, editFormData);
      setSuccessMsg(`Đã cập nhật thông tin giao hàng cho đơn hàng #${editingOrder.orderId} thành công!`);
      setShowEditModal(false);
      setEditingOrder(null);
      fetchOrders();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật thông tin đơn hàng.');
    } finally {
      setUpdatingInfo(false);
    }
  };

  // Handle opening Cancel Modal
  const handleOpenCancel = (order) => {
    setCancellingOrder(order);
    setShowCancelModal(true);
  };

  // Handle submitting Cancel
  const handleSubmitCancel = async () => {
    if (!cancellingOrder) return;
    setCancelling(true);
    try {
      await cancelOrderUser(cancellingOrder.orderId, cancelReason);
      setSuccessMsg(`Đã hủy đơn hàng #${cancellingOrder.orderId} thành công.`);
      setShowCancelModal(false);
      setCancellingOrder(null);
      fetchOrders();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể hủy đơn hàng.');
    } finally {
      setCancelling(false);
    }
  };

  // If not logged in
  if (!isAuthenticated) {
    return (
      <Container className="py-5 text-center" style={{ maxWidth: '600px' }}>
        <Alert variant="warning" className="p-4 shadow-sm">
          <h4 className="mb-3">🔐 Yêu cầu đăng nhập</h4>
          <p>Vui lòng đăng nhập để xem lịch sử đơn hàng của bạn.</p>
          <Button as={Link} to="/login" variant="primary">
            Đăng nhập ngay
          </Button>
        </Alert>
      </Container>
    );
  }

  // Loading spinner
  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" role="status" />
        <p className="mt-3 text-muted">Đang tải lịch sử đơn hàng...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="mb-1">📦 Lịch sử đơn hàng của bạn</h2>
          <p className="text-muted mb-0">Theo dõi, chỉnh sửa thông tin hoặc mua lại các đơn hàng đã đặt</p>
        </div>
        <Button as={Link} to="/products" variant="outline-primary" size="sm">
          Tiếp tục mua hàng
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
          {error}
        </Alert>
      )}

      {successMsg && (
        <Alert variant="success" dismissible onClose={() => setSuccessMsg(null)} className="mb-4">
          {successMsg}
        </Alert>
      )}

      {orders.length === 0 ? (
        <Alert variant="info" className="py-5 text-center shadow-sm">
          <div className="fs-1 mb-3">🧾</div>
          <h4>Chưa có đơn hàng nào</h4>
          <p className="text-muted mb-4">
            Bạn chưa đặt bất kỳ đơn hàng nào tại Flower Shop. Hãy chọn những bó hoa tươi xinh để gửi tặng người thương nhé!
          </p>
          <Button as={Link} to="/products" variant="primary">
            Duyệt sản phẩm ngay
          </Button>
        </Alert>
      ) : (
        <Card className="shadow-sm border-0">
          <Card.Body className="p-0">
            <Table responsive hover className="align-middle mb-0 text-center">
              <thead className="table-light">
                <tr>
                  <th className="py-3">Mã đơn hàng</th>
                  <th className="py-3">Ngày đặt</th>
                  <th className="py-3 text-start">Sản phẩm</th>
                  <th className="py-3 text-end">Tổng tiền</th>
                  <th className="py-3">Trạng thái</th>
                  <th className="py-3" style={{ minWidth: '260px' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const canEditOrCancel = order.status === 'Pending' || order.status === 'Processing';
                  return (
                    <tr key={order.orderId}>
                      <td className="fw-bold text-primary">#{order.orderId}</td>
                      <td className="text-muted small">{order.createdAt || 'N/A'}</td>
                      <td className="text-start small" style={{ maxWidth: '220px' }}>
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="text-truncate">
                            • {item.productName} <span className="text-muted">x{item.quantity}</span>
                          </div>
                        ))}
                      </td>
                      <td className="text-end fw-bold text-danger">
                        {formatPrice(order.total)}
                      </td>
                      <td>{renderStatusBadge(order.status)}</td>
                      <td>
                        <div className="d-flex justify-content-center flex-wrap gap-1">
                          <Button
                            as={Link}
                            to={`/orders/${order.orderId}`}
                            variant="outline-secondary"
                            size="sm"
                            title="Xem chi tiết đơn hàng"
                          >
                            👁️ Chi tiết
                          </Button>

                          {canEditOrCancel && (
                            <>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleOpenEdit(order)}
                                title="Chỉnh sửa thông tin người nhận (chỉ khi đang xử lý hoặc đang lên đơn)"
                              >
                                ✏️ Sửa TT
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleOpenCancel(order)}
                                title="Hủy đơn hàng (chỉ khi đang xử lý hoặc đang lên đơn)"
                              >
                                ❌ Hủy đơn
                              </Button>
                            </>
                          )}

                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleReorder(order)}
                            title="Mua lại đơn hàng này với thông tin đã lưu (có thể chỉnh sửa)"
                          >
                            🔄 Mua lại
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Edit Order Info Modal (Customer) */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>✏️ Chỉnh sửa thông tin nhận hàng</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitEdit}>
          <Modal.Body>
            <p className="small text-muted mb-3">
              Đơn hàng: <strong>#{editingOrder?.orderId}</strong> — Trạng thái:{' '}
              {renderStatusBadge(editingOrder?.status)}
            </p>
            <Alert variant="info" className="py-2 small mb-3">
              💡 Bạn chỉ có thể sửa đổi thông tin khi đơn hàng đang ở mức <strong>Đang xử lý</strong> hoặc <strong>Đang lên đơn</strong>.
            </Alert>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Họ và tên người nhận <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                value={editFormData.customerName}
                onChange={(e) => setEditFormData({ ...editFormData, customerName: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Số điện thoại <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="tel"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Địa chỉ giao hàng <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={editFormData.address}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold">Ghi chú cho shipper</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={editFormData.note}
                onChange={(e) => setEditFormData({ ...editFormData, note: e.target.value })}
                placeholder="Ví dụ: Giao buổi chiều, gọi trước khi đến..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)} disabled={updatingInfo}>
              Đóng
            </Button>
            <Button variant="primary" type="submit" disabled={updatingInfo}>
              {updatingInfo ? <Spinner size="sm" animation="border" /> : 'Lưu thay đổi'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Cancel Order Modal (Customer) */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>⚠️ Xác nhận hủy đơn hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Bạn có chắc chắn muốn hủy đơn hàng <strong>#{cancellingOrder?.orderId}</strong> không?
          </p>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Lý do hủy đơn:</Form.Label>
            <Form.Select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            >
              <option value="Tôi muốn thay đổi thông tin/địa chỉ nhận hàng">Tôi muốn thay đổi thông tin/địa chỉ nhận hàng</option>
              <option value="Tôi muốn thêm bớt sản phẩm khác">Tôi muốn thêm bớt sản phẩm khác</option>
              <option value="Tôi tìm thấy sản phẩm giá tốt hơn">Tôi tìm thấy sản phẩm giá tốt hơn</option>
              <option value="Tôi không có nhu cầu mua nữa">Tôi không có nhu cầu mua nữa</option>
              <option value="Lý do khác">Lý do khác</option>
            </Form.Select>
          </Form.Group>
          <Alert variant="warning" className="py-2 small mb-0">
            ⚠️ Lưu ý: Sau khi hủy, bạn vẫn có thể bấm nút <strong>🔄 Mua lại</strong> bất cứ lúc nào để tạo đơn hàng mới!
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)} disabled={cancelling}>
            Giữ lại đơn hàng
          </Button>
          <Button variant="danger" onClick={handleSubmitCancel} disabled={cancelling}>
            {cancelling ? <Spinner size="sm" animation="border" /> : 'Xác nhận hủy đơn'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default OrderHistory;
