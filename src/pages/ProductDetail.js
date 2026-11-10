import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Button,
  Badge,
  Card,
  Modal,
  Form,
  Spinner,
  InputGroup,
} from 'react-bootstrap';
import { getProduct, getReviews, addReview, getCategories } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import RatingStars from '../components/RatingStars';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import CartToast from '../components/CartToast';

function ProductDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [toastInfo, setToastInfo] = useState({ show: false, message: '' });

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [prodRes, revRes, catRes] = await Promise.all([
        getProduct(id),
        getReviews(id),
        getCategories(),
      ]);

      const prodData = prodRes.data;
      setProduct(prodData);
      setReviews(revRes.data || []);

      const cats = catRes.data || [];
      const currentCat = cats.find((c) => c.cid === prodData.categoryId);
      if (currentCat) {
        setCategoryName(currentCat.cname);
      }
    } catch (err) {
      setError('Không thể tải chi tiết sản phẩm. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
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
  }, [fetchData]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  const handleAddToCart = () => {
    if (!product || product.stock <= 0) return;

    try {
      const raw = localStorage.getItem('cart');
      const cart = raw ? JSON.parse(raw) : [];
      const index = cart.findIndex((item) => item.productId === product.productId);

      if (index > -1) {
        cart[index].quantity = (Number(cart[index].quantity) || 1) + quantity;
      } else {
        cart.push({
          productId: product.productId,
          productName: product.productName,
          price: product.price,
          discount: product.discount || 0,
          quantity: quantity,
          image: product.image,
        });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));
      setToastInfo({
        show: true,
        message: `Đã thêm ${quantity} "${product.productName}" vào giỏ hàng!`,
      });
      setFeedbackMessage({
        type: 'success',
        text: `Đã thêm ${quantity} "${product.productName}" vào giỏ hàng!`,
      });
    } catch (err) {
      setFeedbackMessage({
        type: 'danger',
        text: 'Có lỗi xảy ra khi thêm vào giỏ hàng.',
      });
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setReviewError('Vui lòng nhập nội dung bình luận.');
      return;
    }

    setSubmittingReview(true);
    setReviewError(null);

    try {
      const reviewPayload = {
        productId: Number(id),
        username: user?.username || 'user',
        rating: newRating,
        comment: newComment.trim(),
      };

      const res = await addReview(reviewPayload);
      if (res.data) {
        setReviews((prev) => [res.data, ...prev]);
      } else {
        // Reload reviews if backend response doesn't contain new item
        const updatedReviews = await getReviews(id);
        setReviews(updatedReviews.data || []);
      }

      setShowReviewModal(false);
      setNewComment('');
      setNewRating(5);
      setFeedbackMessage({
        type: 'success',
        text: 'Cảm ơn bạn đã gửi đánh giá cho sản phẩm!',
      });
    } catch (err) {
      setReviewError(
        err.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.'
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Đang tải thông tin hoa tươi..." variant="success" />;
  }

  if (error || !product) {
    return (
      <Container className="my-5">
        <AlertMessage variant="danger" message={error || 'Sản phẩm không tồn tại.'} />
        <Link to="/products" className="btn btn-outline-secondary mt-3">
          ← Quay lại danh sách sản phẩm
        </Link>
      </Container>
    );
  }

  const hasDiscount = product.discount > 0;
  const discountedPrice = hasDiscount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  return (
    <Container className="my-4">
      {/* Toast Alert for Cart có thanh đếm ngược 5s tự tụt hết (Góc trên bên trái) */}
      <CartToast
        show={toastInfo.show}
        message={toastInfo.message}
        onClose={() => setToastInfo((prev) => ({ ...prev, show: false }))}
        duration={5000}
      />

      {/* Back to Products link */}
      <div className="mb-4">
        <Link to="/products" className="btn btn-outline-secondary btn-sm">
          ← Quay lại danh sách sản phẩm (Back to Products)
        </Link>
      </div>

      {feedbackMessage && (
        <AlertMessage
          variant={feedbackMessage.type}
          message={feedbackMessage.text}
          dismissible
          onClose={() => setFeedbackMessage(null)}
        />
      )}

      {/* Product Details Section */}
      <Card className="border-0 shadow-sm p-4 mb-5">
        <Row className="g-4 align-items-center">
          {/* Col-md-6 for Image */}
          <Col md={6}>
            <div className="position-relative overflow-hidden rounded">
              <img
                src={product.image}
                alt={product.productName}
                className="img-fluid rounded shadow-sm w-100"
                style={{
                  maxHeight: '450px',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              {hasDiscount && (
                <Badge
                  bg="danger"
                  className="position-absolute top-0 end-0 m-3 px-3 py-2 fs-6"
                >
                  Giảm {product.discount}%
                </Badge>
              )}
            </div>
          </Col>

          {/* Col-md-6 for Details */}
          <Col md={6}>
            <div className="d-flex align-items-center gap-2 mb-2">
              {categoryName && (
                <Badge bg="info" className="text-white">
                  🌸 {categoryName}
                </Badge>
              )}
              {product.stock > 0 ? (
                <Badge bg="success">Còn hàng ({product.stock})</Badge>
              ) : (
                <Badge bg="danger">Hết hàng</Badge>
              )}
            </div>

            <h2 className="fw-bold mb-3 text-dark">{product.productName}</h2>

            {/* Price display */}
            <div className="mb-3">
              {hasDiscount ? (
                <div>
                  <span className="text-muted text-decoration-line-through fs-5 me-2">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-danger fw-bold fs-3">
                    {formatPrice(discountedPrice)}
                  </span>
                </div>
              ) : (
                <span className="text-success fw-bold fs-3">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-secondary lead mb-4" style={{ fontSize: '1.05rem', lineHeight: '1.7' }}>
              {product.description}
            </p>

            {/* Quantity Selector & Add to Cart */}
            {product.stock > 0 ? (
              <div className="d-flex align-items-center gap-3 mb-4">
                <div style={{ width: '130px' }}>
                  <InputGroup>
                    <Button
                      variant="outline-secondary"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <Form.Control
                      type="number"
                      className="text-center"
                      value={quantity}
                      min={1}
                      max={product.stock}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val >= 1 && val <= product.stock) {
                          setQuantity(val);
                        }
                      }}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      disabled={quantity >= product.stock}
                    >
                      +
                    </Button>
                  </InputGroup>
                </div>
                <Button
                  variant="success"
                  size="lg"
                  className="px-4 fw-bold flex-grow-1"
                  onClick={handleAddToCart}
                >
                  🛒 Add to Cart
                </Button>
              </div>
            ) : (
              <Button variant="secondary" size="lg" disabled className="w-100 mb-4">
                Sản phẩm tạm thời hết hàng
              </Button>
            )}

            <div className="border-top pt-3 text-muted small">
              <div>🚚 Miễn phí vận chuyển nội thành cho đơn hàng từ 500.000₫</div>
              <div className="mt-1">🌿 Hoa tươi cam kết chất lượng 100%, bảo hành tươi mới 3 ngày</div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Reviews Section */}
      <Card className="border-0 shadow-sm p-4">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h3 className="fw-bold mb-1">⭐ Đánh Giá & Bình Luận ({reviews.length})</h3>
            <p className="text-muted small mb-0">Cảm nhận từ những khách hàng đã mua sản phẩm</p>
          </div>
          {isAuthenticated ? (
            <Button
              variant="outline-success"
              className="fw-bold"
              onClick={() => setShowReviewModal(true)}
            >
              ✍️ Add Review
            </Button>
          ) : (
            <div className="text-muted small">
              Vui lòng{' '}
              <Link to="/login" className="text-success fw-bold">
                đăng nhập
              </Link>{' '}
              để gửi đánh giá.
            </div>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-5 text-muted bg-light rounded">
            <p className="mb-2 fs-5">Chưa có đánh giá nào cho sản phẩm này.</p>
            <p className="small mb-0">Hãy là người đầu tiên chia sẻ cảm nhận về bó hoa này nhé!</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {reviews.map((rev) => (
              <Card key={rev.reviewId} className="border-0 bg-light p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <strong className="text-dark">👤 {rev.username}</strong>
                    <RatingStars rating={rev.rating} readOnly={true} />
                  </div>
                  <small className="text-muted">{rev.createdAt}</small>
                </div>
                <p className="mb-0 text-secondary">{rev.comment}</p>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Add Review Modal */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-success">✍️ Đánh Giá Sản Phẩm</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleReviewSubmit}>
          <Modal.Body>
            {reviewError && (
              <AlertMessage variant="danger" message={reviewError} />
            )}

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold d-block">Đánh giá sao:</Form.Label>
              <div className="p-2 bg-light rounded d-inline-block">
                <RatingStars
                  rating={newRating}
                  onChange={setNewRating}
                  readOnly={false}
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Nội dung đánh giá:</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Chia sẻ trải nghiệm của bạn về độ tươi, màu sắc, thời gian giao hoa..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowReviewModal(false)}
              disabled={submittingReview}
            >
              Hủy
            </Button>
            <Button variant="success" type="submit" disabled={submittingReview}>
              {submittingReview ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    className="me-2"
                  />
                  Đang gửi...
                </>
              ) : (
                'Gửi Đánh Giá'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default ProductDetail;
