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
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAllOrdersAdmin, updateOrderStatus, deleteOrder } from '../../services/api';

function AdminOrders() {
  const { isAdmin, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Status change modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  const statusOptions = ['Pending', 'Processing', 'Shipping', 'Completed', 'Cancelled'];

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return <Badge bg="warning" text="dark">Đang xử lý</Badge>;
      case 'Processing': return <Badge bg="info">Đang lên đơn</Badge>;
      case 'Shipping': return <Badge bg="primary">Đang giao</Badge>;
      case 'Completed': return <Badge bg="success">Đã nhận hàng</Badge>;
      case 'Cancelled': return <Badge bg="danger">Đã hủy</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const statusLabel = (status) => {
    switch (status) {
      case 'Pending': return 'Đang xử lý';
      case 'Processing': return 'Đang lên đơn';
      case 'Shipping': return 'Đang giao';
      case 'Completed': return 'Đã nhận hàng (sẽ trừ tồn kho)';
      case 'Cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAllOrdersAdmin();
      setOrders(res.data || []);
    } catch (err) {
      setError('Không thể tải danh sách đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchOrders();
    else setLoading(false);

    const handleOrdersChange = () => {
      fetchOrders();
    };

    window.addEventListener('ordersUpdated', handleOrdersChange);
    window.addEventListener('storage', handleOrdersChange);
    return () => {
      window.removeEventListener('ordersUpdated', handleOrdersChange);
      window.removeEventListener('storage', handleOrdersChange);
    };
  }, [isAdmin]);

  // Open status change modal
  const handleStatusClick = (order) => {
    setStatusTarget(order);
    setNewStatus(order.status);
    setShowStatusModal(true);
  };

  // Confirm status change
  const handleConfirmStatus = async () => {
    if (!statusTarget || newStatus === statusTarget.status) {
      setShowStatusModal(false);
      return;
    }
    setUpdating(true);
    try {
      await updateOrderStatus(statusTarget.orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === statusTarget.orderId ? { ...o, status: newStatus } : o
        )
      );
      let msg = `Đã cập nhật trạng thái đơn hàng #${statusTarget.orderId} thành "${statusLabel(newStatus)}".`;
      if (newStatus === 'Completed') {
        msg += ' Tồn kho đã được tự động cập nhật.';
      }
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError('Không thể cập nhật trạng thái đơn hàng.');
    } finally {
      setUpdating(false);
      setShowStatusModal(false);
      setStatusTarget(null);
    }
  };

  // Delete order
  const handleDeleteClick = (order) => {
    setDeleteTarget(order);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.status === 'Shipping' || deleteTarget.status === 'Completed') {
      setError(`Không thể xóa đơn hàng #${deleteTarget.orderId} vì đơn hàng đã được xác nhận thanh toán/đang giao/đã nhận hàng!`);
      setShowDeleteModal(false);
      setDeleteTarget(null);
      return;
    }
    setDeleting(true);
    try {
      await deleteOrder(deleteTarget.orderId);
      setOrders((prev) => prev.filter((o) => o.orderId !== deleteTarget.orderId));
      setSuccessMsg(`Đã xóa đơn hàng #${deleteTarget.orderId} thành công!`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa đơn hàng.');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <Container className="py-5 text-center" style={{ maxWidth: '600px' }}>
        <Alert variant="danger" className="p-4 shadow-sm">
          <h4 className="mb-3">🚫 Truy cập bị từ chối</h4>
          <p>Bạn cần đăng nhập với tài khoản Admin.</p>
          <Button as={Link} to="/login" variant="primary">Đăng nhập</Button>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Đang tải danh sách đơn hàng...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="mb-1">📋 Quản lý đơn hàng</h2>
          <p className="text-muted mb-0">Xem, cập nhật trạng thái và quản lý tất cả đơn hàng</p>
        </div>
        <Button as={Link} to="/admin/dashboard" variant="outline-secondary">
          📊 Dashboard
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-3">
          {error}
        </Alert>
      )}
      {successMsg && (
        <Alert variant="success" dismissible onClose={() => setSuccessMsg(null)} className="mb-3">
          {successMsg}
        </Alert>
      )}

      {orders.length === 0 ? (
        <Alert variant="info" className="py-5 text-center">
          <h4>Chưa có đơn hàng nào</h4>
        </Alert>
      ) : (
        <Card className="shadow-sm border-0">
          <Card.Body className="p-0">
            <Table responsive hover className="align-middle mb-0 text-center">
              <thead className="table-light">
                <tr>
                  <th className="py-3">Mã ĐH</th>
                  <th className="py-3">Ngày đặt</th>
                  <th className="py-3">Sản phẩm</th>
                  <th className="py-3 text-end">Tổng tiền</th>
                  <th className="py-3">Địa chỉ</th>
                  <th className="py-3">Trạng thái</th>
                  <th className="py-3" style={{ width: '220px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.orderId}>
                    <td className="fw-bold text-primary">
                      #{order.orderId}
                      {order.customerName ? (
                        <div className="small text-dark fw-normal">
                          👤 {order.customerName}
                          {order.username && order.username !== order.customerName && (
                            <span className="text-muted ms-1">(@{order.username})</span>
                          )}
                        </div>
                      ) : (
                        order.username && (
                          <div className="small text-muted fw-normal">👤 @{order.username}</div>
                        )
                      )}
                    </td>
                    <td className="text-muted small">{order.createdAt || 'N/A'}</td>
                    <td className="small text-start" style={{ maxWidth: '200px' }}>
                      {order.items?.map((item, idx) => (
                        <div key={idx}>
                          {item.productName} x{item.quantity}
                        </div>
                      ))}
                    </td>
                    <td className="text-end fw-bold text-danger">{formatPrice(order.total)}</td>
                    <td className="small text-start" style={{ maxWidth: '180px' }}>
                      <span className="text-truncate d-block" style={{ maxWidth: '180px' }}>
                        {order.shippingAddress || 'N/A'}
                      </span>
                    </td>
                    <td>{renderStatusBadge(order.status)}</td>
                    <td>
                      <div className="d-flex justify-content-center gap-1">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleStatusClick(order)}
                        >
                          ✏️ Sửa TT
                        </Button>
                        {order.status === 'Shipping' || order.status === 'Completed' ? (
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            disabled
                            title="Đơn hàng đã xác nhận thanh toán / đang giao / đã nhận hàng, không thể xóa!"
                          >
                            🔒 Không thể xóa
                          </Button>
                        ) : (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteClick(order)}
                          >
                            🗑️ Xóa
                          </Button>
                        )}
                        <Button
                          as={Link}
                          to={`/orders/${order.orderId}`}
                          state={{ fromAdmin: true }}
                          variant="outline-secondary"
                          size="sm"
                          title="Xem chi tiết đơn hàng"
                        >
                          👁️
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      <div className="text-muted small mt-3 text-end">
        Tổng cộng: <strong>{orders.length}</strong> đơn hàng
      </div>

      {/* Status Change Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>📝 Cập nhật trạng thái đơn hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Đơn hàng: <strong>#{statusTarget?.orderId}</strong></p>
          <p>Trạng thái hiện tại: {renderStatusBadge(statusTarget?.status)}</p>
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
          {newStatus === 'Completed' && statusTarget?.status !== 'Completed' && (
            <Alert variant="info" className="mt-3 mb-0 small">
              ⚠️ Khi chuyển sang <strong>Đã nhận hàng</strong>, số lượng tồn kho của các sản phẩm trong đơn hàng sẽ tự động bị trừ đi.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)} disabled={updating}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleConfirmStatus} disabled={updating || newStatus === statusTarget?.status}>
            {updating ? <Spinner size="sm" animation="border" /> : 'Cập nhật'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>⚠️ Xác nhận xóa đơn hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn xóa đơn hàng <strong>#{deleteTarget?.orderId}</strong> không?
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
    </Container>
  );
}

export default AdminOrders;
