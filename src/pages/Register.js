import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Container, Spinner, Card, Row, Col, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import nenImg from '../images/nen.jpg';
import { register as registerApi } from '../services/api';

const SECURITY_QUESTIONS = [
  'Tên con vật nuôi đầu tiên của bạn là gì?',
  'Tên trường tiểu học đầu tiên của bạn là gì?',
  'Món ăn yêu thích nhất của bạn là gì?',
  'Tên người bạn thân thời thơ ấu của bạn là gì?',
  'Thành phố quê quán của cha mẹ bạn là gì?',
  'Tên cuốn sách hoặc bộ phim yêu thích của bạn là gì?',
];

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
    email: '',
    address: '',
    securityQuestion: SECURITY_QUESTIONS[0],
    securityAnswer: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [registeredUsername, setRegisteredUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let interval = null;
    if (success && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (success && countdown === 0) {
      navigate('/login', {
        state: {
          username: registeredUsername,
          message: 'Đăng ký tài khoản thành công! Vui lòng đăng nhập bằng tài khoản mới.',
        },
      });
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [success, countdown, navigate, registeredUsername]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.username.trim()) {
      setError('Vui lòng nhập tên tài khoản.');
      return;
    }

    if (formData.username.trim().length < 3) {
      setError('Tên tài khoản phải có ít nhất 3 ký tự.');
      return;
    }

    if (!formData.password) {
      setError('Vui lòng nhập mật khẩu.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (!formData.phone.trim()) {
      setError('Vui lòng nhập số điện thoại liên hệ.');
      return;
    }

    if (!formData.securityAnswer.trim()) {
      setError('Vui lòng nhập câu trả lời cho câu hỏi bảo mật để khôi phục mật khẩu khi cần.');
      return;
    }

    setLoading(true);

    try {
      const regUser = formData.username.trim();
      const res = await registerApi({
        username: regUser,
        password: formData.password.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        securityQuestion: formData.securityQuestion,
        securityAnswer: formData.securityAnswer.trim(),
      });

      setRegisteredUsername(regUser);
      setCountdown(5);
      setSuccess(res.data?.message || 'Đăng ký tài khoản thành công!');
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="register-page py-5"
      style={{
        backgroundImage: `url(${nenImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Container style={{ maxWidth: '560px' }}>
        <Card className="shadow-lg border-0 my-3">
          <Card.Body className="p-4 p-md-5">
            <div className="text-center mb-4">
              <h2 className="fw-bold mb-1">🌷 Đăng Ký Tài Khoản</h2>
              <p className="text-muted small">Tạo tài khoản để đặt hoa và theo dõi đơn hàng tiện lợi</p>
            </div>

            {error && (
              <Alert variant="danger" dismissible onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert variant="success" className="py-3 shadow-sm border-0 mb-4">
                <div className="d-flex align-items-center mb-1">
                  <span className="fs-5 me-2">🎉</span>
                  <strong className="fs-6">Đăng ký tài khoản thành công!</strong>
                </div>
                <div className="small text-dark mb-2">
                  Tài khoản <strong>{registeredUsername}</strong> đã sẵn sàng. Hệ thống sẽ tự động chuyển đến trang Đăng nhập sau <strong>{countdown} giây</strong>...
                </div>
                <Button
                  as={Link}
                  to="/login"
                  state={{
                    username: registeredUsername,
                    message: 'Đăng ký tài khoản thành công! Vui lòng đăng nhập bằng tài khoản mới.',
                  }}
                  variant="success"
                  size="sm"
                  className="fw-bold px-3 shadow-sm"
                >
                  ➜ Đăng Nhập Ngay ({countdown}s)
                </Button>
              </Alert>
            )}

            {!success && (
              <Form onSubmit={handleSubmit}>
              {/* Account Credentials */}
              <Form.Group className="mb-3" controlId="registerUsername">
                <Form.Label className="fw-semibold">
                  Tên tài khoản <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  placeholder="Nhập tên tài khoản (viết liền, không dấu)"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Row className="g-2 mb-3">
                <Col md={6}>
                  <Form.Group controlId="registerPassword">
                    <Form.Label className="fw-semibold">
                      Mật khẩu <span className="text-danger">*</span>
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Ít nhất 6 ký tự"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      <Button
                        variant="outline-secondary"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        className="d-flex align-items-center"
                      >
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                            <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
                            <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                            <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                          </svg>
                        )}
                      </Button>
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="registerConfirmPassword">
                    <Form.Label className="fw-semibold">
                      Xác nhận mật khẩu <span className="text-danger">*</span>
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="Nhập lại mật khẩu"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                      <Button
                        variant="outline-secondary"
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        className="d-flex align-items-center"
                      >
                        {showConfirmPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                            <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
                            <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                            <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                          </svg>
                        )}
                      </Button>
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>

              {/* Contact Info */}
              <Row className="g-2 mb-3">
                <Col md={6}>
                  <Form.Group controlId="registerPhone">
                    <Form.Label className="fw-semibold">
                      Số điện thoại <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      placeholder="Ví dụ: 0912345678"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="registerEmail">
                    <Form.Label className="fw-semibold text-muted">
                      Email <span className="small">(không bắt buộc)</span>
                    </Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="ten@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3" controlId="registerAddress">
                <Form.Label className="fw-semibold text-muted">
                  Địa chỉ giao hàng <span className="small">(không bắt buộc)</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="address"
                  placeholder="Nhập địa chỉ của bạn (sẽ tự động điền sẵn khi bạn đặt hàng)"
                  value={formData.address}
                  onChange={handleChange}
                />
                <Form.Text className="text-muted small">
                  💡 Nếu nhập địa chỉ, thông tin này sẽ được tự động lưu vào đơn đặt hàng của bạn.
                </Form.Text>
              </Form.Group>

              {/* Security Question for Password Recovery */}
              <div className="border rounded p-3 bg-light mb-4">
                <div className="fw-bold mb-2 text-primary">
                  🛡️ Câu hỏi bảo mật (dùng khi quên mật khẩu)
                </div>
                <Form.Group className="mb-2" controlId="registerSecurityQuestion">
                  <Form.Label className="small fw-semibold">
                    Chọn câu hỏi bảo mật <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    name="securityQuestion"
                    value={formData.securityQuestion}
                    onChange={handleChange}
                  >
                    {SECURITY_QUESTIONS.map((q, idx) => (
                      <option key={idx} value={q}>
                        {q}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group controlId="registerSecurityAnswer">
                  <Form.Label className="small fw-semibold">
                    Câu trả lời bảo mật <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="securityAnswer"
                    placeholder="Nhập câu trả lời để khôi phục khi quên mật khẩu"
                    value={formData.securityAnswer}
                    onChange={handleChange}
                    required
                  />
                  <Form.Text className="text-muted small">
                    Ghi nhớ câu trả lời này để đặt lại mật khẩu nếu lỡ quên.
                  </Form.Text>
                </Form.Group>
              </div>

              <Button
                variant="primary"
                type="submit"
                disabled={loading || !!success}
                className="w-100 py-2 fw-semibold shadow-sm"
              >
                {loading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    Đang đăng ký...
                  </>
                ) : (
                  'Đăng Ký Tài Khoản'
                )}
              </Button>
            </Form>
            )}

            <div className="mt-4 text-center border-top pt-3">
              <span className="text-muted">Đã có tài khoản? </span>
              <Link to="/login" className="fw-semibold text-decoration-none">
                Đăng nhập ngay
              </Link>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default Register;
