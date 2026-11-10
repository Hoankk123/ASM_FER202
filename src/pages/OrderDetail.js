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
  Modal,
  Form,
} from 'react-bootstrap';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  getOrderDetail,
  updateOrderStatus,
  deleteOrder,
  cancelOrderUser,
  updateOrderInfoUser,
} from '../services/api';

function parseOrderShipping(order) {
  let customerName = order?.customerName || '';
  let phone = order?.phone || '';
  let address = order?.address || '';
  let note = order?.note || '';

  if (!customerName || !phone || !address) {
    const raw = order?.shippingAddress || '';
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

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Admin action states
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // User action states: Edit Info & Cancel
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    customerName: '',
    phone: '',
    address: '',
    note: '',
  });
  const [updatingInfo, setUpdatingInfo] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Tôi muốn thay đổi thông tin/địa chỉ nhận hàng');
  const [cancelling, setCancelling] = useState(false);

  // Format currency in VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  // 5 Status badges
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <Badge bg="warning" text="dark" className="fs-6">Đang xử lý</Badge>;
      case 'Processing':
        return <Badge bg="info" className="fs-6">Đang lên đơn</Badge>;
      case 'Shipping':
        return <Badge bg="primary" className="fs-6">Đang giao</Badge>;
      case 'Completed':
        return <Badge bg="success" className="fs-6">Đã nhận hàng</Badge>;
      case 'Cancelled':
        return <Badge bg="danger" className="fs-6">Đã hủy</Badge>;
      default:
        return <Badge bg="secondary" className="fs-6">{status}</Badge>;
    }
  };

  const statusOptions = ['Pending', 'Processing', 'Shipping', 'Completed', 'Cancelled'];
  const statusLabel = (s) => {
    switch (s) {
      case 'Pending': return 'Đang xử lý';
      case 'Processing': return 'Đang lên đơn';
      case 'Shipping': return 'Đang giao';
      case 'Completed': return 'Đã nhận hàng (sẽ trừ tồn kho)';
      case 'Cancelled': return 'Đã hủy';
      default: return s;
    }
  };

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getOrderDetail(id);
      setOrder(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Không tìm thấy chi tiết đơn hàng hoặc có lỗi xảy ra.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDetail();
    } else {
      setLoading(false);
    }

    const handleOrderDetailChange = () => {
      fetchDetail();
    };

    window.addEventListener('ordersUpdated', handleOrderDetailChange);
    window.addEventListener('storage', handleOrderDetailChange);
    return () => {
      window.removeEventListener('ordersUpdated', handleOrderDetailChange);
      window.removeEventListener('storage', handleOrderDetailChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAuthenticated]);

  // Auth requirement
  if (!isAuthenticated) {
    return (
      <Container className="py-5 text-center" style={{ maxWidth: '600px' }}>
        <Alert variant="warning" className="p-4 shadow-sm">
          <h4 className="mb-3">🔐 Yêu cầu đăng nhập</h4>
          <p>Vui lòng đăng nhập để xem thông tin chi tiết đơn hàng.</p>
          <Button as={Link} to="/login" variant="primary">
            Đăng nhập ngay
          </Button>
        </Alert>
      </Container>
    );
  }

  // Loading state
  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" role="status" />
        <p className="mt-3 text-muted">Đang tải thông tin đơn hàng #{id}...</p>
      </Container>
    );
  }

  const handleBack = () => {
    if (location.state?.fromAdmin || isAdmin) {
      navigate('/admin/orders');
    } else if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/orders');
    }
  };

  // Error state
  if (error || !order) {
    return (
      <Container className="py-4">
        <Button variant="outline-secondary" className="mb-3" onClick={handleBack}>
          ← {isAdmin ? 'Quay lại Quản lý đơn hàng' : 'Quay lại danh sách đơn hàng'}
        </Button>
        <Alert variant="danger">{error || 'Không tìm thấy đơn hàng'}</Alert>
      </Container>
    );
  }

  // Security check: Customer can only view their own orders
  if (order && !isAdmin && user?.username && order.username) {
    if (order.username.toLowerCase() !== user.username.toLowerCase()) {
      return (
        <Container className="py-5 text-center" style={{ maxWidth: '600px' }}>
          <Alert variant="danger" className="p-4 shadow-sm">
            <h4 className="mb-3">🚫 Truy cập bị từ chối</h4>
            <p>Bạn không có quyền xem thông tin đơn hàng này.</p>
            <Button as={Link} to="/orders" variant="primary">
              Quay lại danh sách đơn hàng
            </Button>
          </Alert>
        </Container>
      );
    }
  }

  // Admin: Update Status
  const handleConfirmStatus = async () => {
    if (!newStatus || newStatus === order.status) {
      setShowStatusModal(false);
      return;
    }
    setUpdatingStatus(true);
    try {
      await updateOrderStatus(order.orderId, newStatus);
      setOrder((prev) => ({ ...prev, status: newStatus }));
      let msg = `Đã cập nhật trạng thái đơn hàng thành "${statusLabel(newStatus)}"!`;
      if (newStatus === 'Completed') {
        msg += ' Tồn kho và lượt bán đã được tự động cập nhật.';
      }
      setActionSuccess(msg);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật trạng thái đơn hàng.');
    } finally {
      setUpdatingStatus(false);
      setShowStatusModal(false);
    }
  };

  // Admin: Delete Order
  const handleConfirmDelete = async () => {
    if (order.status === 'Shipping' || order.status === 'Completed') {
      setError(`Không thể xóa đơn hàng #${order.orderId} vì đã xác nhận thanh toán/đang giao/đã nhận hàng!`);
      setShowDeleteModal(false);
      return;
    }
    setDeleting(true);
    try {
      await deleteOrder(order.orderId);
      navigate(isAdmin ? '/admin/orders' : '/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa đơn hàng.');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Customer: Open Edit Modal
  const handleOpenEdit = () => {
    const parsed = parseOrderShipping(order);
    setEditFormData({
      customerName: parsed.customerName,
      phone: parsed.phone,
      address: parsed.address,
      note: parsed.note,
    });
    setShowEditModal(true);
  };

  // Customer: Submit Edit
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!editFormData.customerName.trim() || !editFormData.phone.trim() || !editFormData.address.trim()) {
      setError('Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ nhận hàng.');
      return;
    }
    setUpdatingInfo(true);
    try {
      await updateOrderInfoUser(order.orderId, editFormData);
      setActionSuccess('Đã cập nhật thông tin giao hàng thành công!');
      setShowEditModal(false);
      fetchDetail();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật thông tin đơn hàng.');
    } finally {
      setUpdatingInfo(false);
    }
  };

  // Customer: Open Cancel Modal
  const handleOpenCancel = () => {
    setShowCancelModal(true);
  };

  // Customer: Submit Cancel
  const handleSubmitCancel = async () => {
    setCancelling(true);
    try {
      await cancelOrderUser(order.orderId, cancelReason);
      setActionSuccess('Đã hủy đơn hàng thành công.');
      setShowCancelModal(false);
      fetchDetail();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể hủy đơn hàng.');
    } finally {
      setCancelling(false);
    }
  };

  // Customer: Re-order ("Mua lại")
  const handleReorder = () => {
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
      // Navigate to checkout with prefilled info
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

  const canEditOrCancel = order.status === 'Pending' || order.status === 'Processing';

  return (
    <Container className="py-4">
      {/* Back button */}
      <div className="mb-4">
        <Button variant="outline-secondary" className="px-3" onClick={handleBack}>
          ← {isAdmin ? 'Quay lại Quản lý đơn hàng' : 'Quay lại danh sách đơn hàng'}
        </Button>
      </div>

      {actionSuccess && (
        <Alert variant="success" dismissible onClose={() => setActionSuccess(null)} className="mb-4">
          {actionSuccess}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
          {error}
        </Alert>
      )}

      {/* Header Info */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body className="p-4">
          <Row className="align-items-center g-3">
            <Col md={7}>
              <h3 className="mb-2">
                Đơn hàng <span className="text-primary">#{order.orderId}</span>
              </h3>
              <p className="text-muted mb-0">
                Ngày đặt: <strong>{order.createdAt || 'N/A'}</strong>
                {order.customerName && (
                  <span className="ms-3">
                    Người nhận: <strong>{order.customerName}</strong>
                  </span>
                )}
                {order.username && (
                  <span className="ms-2 text-muted">
                    (@{order.username})
                  </span>
                )}
              </p>
              {order.cancelReason && (
                <div className="text-danger small mt-2">
                  ⚠️ Lý do hủy: {order.cancelReason} ({order.cancelledAt || 'Đã hủy'})
                </div>
              )}
            </Col>
            <Col md={5} className="text-md-end">
              <div className="mb-2">{renderStatusBadge(order.status)}</div>

              {/* Admin Actions */}
              {isAdmin && (
                <div className="d-flex justify-content-md-end flex-wrap gap-2 mt-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => {
                      setNewStatus(order.status);
                      setShowStatusModal(true);
                    }}
                  >
                    ✏️ Sửa TT
                  </Button>
                  {order.status === 'Shipping' || order.status === 'Completed' ? (
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      disabled
                      title="Đơn hàng đang giao / đã nhận hàng, không thể xóa!"
                    >
                      🔒 Không thể xóa
                    </Button>
                  ) : (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      🗑️ Xóa đơn
                    </Button>
                  )}
                </div>
              )}

              {/* Customer Actions */}
              {!isAdmin && (
                <div className="d-flex justify-content-md-end flex-wrap gap-2 mt-2">
                  {canEditOrCancel && (
                    <>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={handleOpenEdit}
                        title="Chỉnh sửa thông tin giao hàng"
                      >
                        ✏️ Sửa thông tin
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={handleOpenCancel}
                        title="Hủy đơn hàng"
                      >
                        ❌ Hủy đơn hàng
                      </Button>
                    </>
                  )}
                  <Button
                    variant="success"
                    size="sm"
                    onClick={handleReorder}
                    title="Mua lại toàn bộ sản phẩm trong đơn hàng này"
                  >
                    🔄 Mua lại đơn này
                  </Button>
                </div>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Shipping Address */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold">📍 Thông tin giao hàng & người nhận</h5>
          {!isAdmin && canEditOrCancel && (
            <Button variant="link" size="sm" className="p-0 text-decoration-none" onClick={handleOpenEdit}>
              ✏️ Sửa thông tin
            </Button>
          )}
        </Card.Header>
        <Card.Body className="p-4">
          <p className="mb-0 text-dark" style={{ whiteSpace: 'pre-line' }}>
            {order.shippingAddress || 'Không có thông tin địa chỉ.'}
          </p>
        </Card.Body>
      </Card>

      {/* Items Table */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="bg-white py-3 border-bottom">
          <h5 className="mb-0 fw-bold">💐 Danh sách sản phẩm ({order.items?.length || 0} mẫu)</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="py-3 ps-4">Tên sản phẩm</th>
                <th className="py-3 text-center" style={{ width: '130px' }}>
                  Số lượng
                </th>
                <th className="py-3 text-end" style={{ width: '180px' }}>
                  Đơn giá
                </th>
                <th className="py-3 text-end pe-4" style={{ width: '200px' }}>
                  Thành tiền
                </th>
              </tr>
            </thead>
            <tbody>
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => {
                  const subtotal = item.price * item.quantity;
                  return (
                    <tr key={item.productId || index}>
                      <td className="ps-4 fw-semibold">
                        {item.productName}
                      </td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-end text-muted">{formatPrice(item.price)}</td>
                      <td className="text-end pe-4 fw-bold text-primary">
                        {formatPrice(subtotal)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted">
                    Không có thông tin sản phẩm.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Total Card */}
      <Row className="justify-content-between align-items-center g-3">
        <Col md={6}>
          {!isAdmin && (
            <Button
              variant="outline-success"
              className="fw-semibold"
              onClick={handleReorder}
            >
              🔄 Mua lại toàn bộ sản phẩm trong đơn này
            </Button>
          )}
        </Col>
        <Col md={5}>
          <Card className="shadow-sm border-0 bg-light">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center">
                <span className="fs-5 fw-bold">Tổng thanh toán:</span>
                <span className="fs-3 fw-bold text-danger">
                  {formatPrice(order.total)}
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Status Change Modal (Admin) */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>📝 Cập nhật trạng thái đơn hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Đơn hàng: <strong>#{order?.orderId}</strong></p>
          <Form.Group>
            <Form.Label className="fw-semibold">Chọn trạng thái mới:</Form.Label>
            <Form.Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>{statusLabel(s)}</option>
              ))}
            </Form.Select>
          </Form.Group>
          {newStatus === 'Completed' && order?.status !== 'Completed' && (
            <Alert variant="info" className="mt-3 mb-0 small">
              ⚠️ Khi chuyển sang <strong>Đã nhận hàng</strong>, số lượng tồn kho của các sản phẩm trong đơn hàng sẽ tự động bị trừ đi và cập nhật lượt bán.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)} disabled={updatingStatus}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleConfirmStatus} disabled={updatingStatus || newStatus === order?.status}>
            {updatingStatus ? <Spinner size="sm" animation="border" /> : 'Cập nhật'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal (Admin) */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>⚠️ Xác nhận xóa đơn hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn xóa đơn hàng <strong>#{order?.orderId}</strong> không?
          <br />
          <span className="text-danger small">Hành động này không thể hoàn tác.</span>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete} disabled={deleting}>
            {deleting ? <Spinner size="sm" animation="border" /> : 'Xóa đơn hàng'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Order Info Modal (Customer) */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>✏️ Chỉnh sửa thông tin giao hàng</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitEdit}>
          <Modal.Body>
            <p className="small text-muted mb-3">
              Đơn hàng: <strong>#{order?.orderId}</strong> — Trạng thái:{' '}
              {renderStatusBadge(order?.status)}
            </p>
            <Alert variant="info" className="py-2 small mb-3">
              💡 Bạn chỉ có thể sửa thông tin khi đơn hàng đang ở mức <strong>Đang xử lý</strong> hoặc <strong>Đang lên đơn</strong>.
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
            Bạn có chắc chắn muốn hủy đơn hàng <strong>#{order?.orderId}</strong> không?
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
            ⚠️ Lưu ý: Sau khi hủy, bạn vẫn có thể bấm nút <strong>🔄 Mua lại đơn này</strong> bất cứ lúc nào để tạo đơn hàng mới!
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

export default OrderDetail;
