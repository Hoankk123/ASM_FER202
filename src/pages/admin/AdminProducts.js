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
  Image,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getProducts, deleteProduct } from '../../services/api';

function AdminProducts() {
  const { isAdmin, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getProducts();
      setProducts(res.data || []);
    } catch (err) {
      setError('Không thể tải danh sách sản phẩm.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchProducts();
    else setLoading(false);

    const handleProductsChange = () => {
      fetchProducts();
    };

    window.addEventListener('productsUpdated', handleProductsChange);
    window.addEventListener('storage', handleProductsChange);
    return () => {
      window.removeEventListener('productsUpdated', handleProductsChange);
      window.removeEventListener('storage', handleProductsChange);
    };
  }, [isAdmin]);

  const handleDeleteClick = (product) => {
    setDeleteTarget(product);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    if ((deleteTarget.sold || 0) > 0) {
      setError(`Không thể xóa mẫu hoa "${deleteTarget.productName}" vì đã bán được ${deleteTarget.sold} sản phẩm!`);
      setShowDeleteModal(false);
      setDeleteTarget(null);
      return;
    }
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget.productId);
      setProducts((prev) => prev.filter((p) => p.productId !== deleteTarget.productId));
      setSuccessMsg(`Đã xóa sản phẩm "${deleteTarget.productName}" thành công!`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa sản phẩm. Vui lòng thử lại.');
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
          <p>Bạn cần đăng nhập với tài khoản Admin để truy cập trang này.</p>
          <Button as={Link} to="/login" variant="primary">Đăng nhập</Button>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Đang tải danh sách sản phẩm...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="mb-1">🌷 Quản lý sản phẩm</h2>
          <p className="text-muted mb-0">Thêm, sửa, xóa sản phẩm trong cửa hàng</p>
        </div>
        <div className="d-flex gap-2">
          <Button as={Link} to="/admin/add-product" variant="success" className="fw-semibold">
            ➕ Thêm sản phẩm mới
          </Button>
          <Button as={Link} to="/admin/dashboard" variant="outline-secondary">
            📊 Dashboard
          </Button>
        </div>
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

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <Table responsive hover className="align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="py-3 ps-3" style={{ width: '60px' }}>Ảnh</th>
                <th className="py-3">Tên sản phẩm</th>
                <th className="py-3 text-end">Giá gốc</th>
                <th className="py-3 text-center">Giảm giá</th>
                <th className="py-3 text-center">Tồn kho</th>
                <th className="py-3 text-center">Đã bán</th>
                <th className="py-3 text-center" style={{ width: '200px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    Chưa có sản phẩm nào. Hãy thêm sản phẩm mới!
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.productId}>
                    <td className="ps-3">
                      <Image
                        src={product.image}
                        alt={product.productName}
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }}
                      />
                    </td>
                    <td>
                      <Link to={`/products/${product.productId}`} className="text-decoration-none fw-semibold text-dark">
                        {product.productName}
                      </Link>
                    </td>
                    <td className="text-end fw-semibold">{formatPrice(product.price)}</td>
                    <td className="text-center">
                      {product.discount > 0 ? (
                        <Badge bg="danger">-{product.discount}%</Badge>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="text-center">
                      <Badge bg={product.stock < 10 ? 'danger' : product.stock < 30 ? 'warning' : 'success'} text={product.stock < 30 && product.stock >= 10 ? 'dark' : undefined}>
                        {product.stock}
                      </Badge>
                    </td>
                    <td className="text-center">{product.sold || 0}</td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-1">
                        <Button
                          as={Link}
                          to={`/admin/edit-product/${product.productId}`}
                          variant="outline-primary"
                          size="sm"
                        >
                          ✏️ Sửa
                        </Button>
                        {(product.sold || 0) > 0 ? (
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            disabled
                            title={`Sản phẩm đã bán được ${product.sold} đơn, không thể xóa!`}
                          >
                            🔒 Không thể xóa
                          </Button>
                        ) : (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteClick(product)}
                          >
                            🗑️ Xóa
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <div className="text-muted small mt-3 text-end">
        Tổng cộng: <strong>{products.length}</strong> sản phẩm
      </div>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>⚠️ Xác nhận xóa sản phẩm</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn xóa sản phẩm{' '}
          <strong>"{deleteTarget?.productName}"</strong> không?
          <br />
          <span className="text-danger small">Hành động này không thể hoàn tác.</span>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete} disabled={deleting}>
            {deleting ? <Spinner size="sm" animation="border" /> : 'Xóa sản phẩm'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default AdminProducts;
