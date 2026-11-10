import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Container, Spinner, Card, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import nenImg from '../images/nen.jpg';
import { getSecurityQuestion, resetPassword } from '../services/api';

function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Enter username, 2: Answer question & set new password
  const [username, setUsername] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [countdown, setCountdown] = useState(5);
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
          username: username.trim(),
          message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.',
        },
      });
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [success, countdown, navigate, username]);

  // Step 1: Find account & get security question
  const handleFindAccount = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Vui lòng nhập tên tài khoản.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await getSecurityQuestion(username.trim());
      setSecurityQuestion(res.data?.securityQuestion || 'Tên con vật nuôi đầu tiên của bạn là gì?');
      setStep(2);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Không tìm thấy tài khoản với tên đăng nhập này. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify answer & reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!securityAnswer.trim()) {
      setError('Vui lòng nhập câu trả lời bảo mật.');
      return;
    }

    if (!newPassword) {
      setError('Vui lòng nhập mật khẩu mới.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('Xác nhận mật khẩu mới không khớp.');
      return;
    }

    setLoading(true);

    try {
      const res = await resetPassword(username.trim(), securityAnswer.trim(), newPassword.trim());
      setCountdown(5);
      setSuccess(res.data?.message || 'Đổi mật khẩu thành công!');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Câu trả lời bảo mật không chính xác. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="forgot-password-page py-5"
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
      <Container style={{ maxWidth: '500px' }}>
        <Card className="shadow-lg border-0 my-3">
          <Card.Body className="p-4 p-md-5">
            <div className="text-center mb-4">
              <h2 className="fw-bold mb-1">🔑 Quên Mật Khẩu</h2>
              <p className="text-muted small">
                {step === 1
                  ? 'Nhập tên tài khoản để tìm câu hỏi bảo mật của bạn'
                  : 'Trả lời câu hỏi bảo mật để đặt lại mật khẩu mới'}
              </p>
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
                  <strong className="fs-6">Đặt lại mật khẩu thành công!</strong>
                </div>
                <div className="small text-dark mb-2">
                  Mật khẩu mới cho tài khoản <strong>{username.trim()}</strong> đã được cập nhật thành công. Hệ thống sẽ tự động chuyển đến trang Đăng nhập sau <strong>{countdown} giây</strong>...
                </div>
                <Button
                  as={Link}
                  to="/login"
                  state={{
                    username: username.trim(),
                    message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.',
                  }}
                  variant="success"
                  size="sm"
                  className="fw-bold px-3 shadow-sm"
                >
                  ➜ Đăng Nhập Ngay ({countdown}s)
                </Button>
              </Alert>
            )}

            {!success && step === 1 && (
              <Form onSubmit={handleFindAccount}>
                <Form.Group className="mb-4" controlId="forgotUsername">
                  <Form.Label className="fw-semibold">Tên tài khoản của bạn</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nhập tên đăng nhập (ví dụ: user, customer1)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoFocus
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  className="w-100 py-2 fw-semibold shadow-sm"
                >
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Đang tìm kiếm...
                    </>
                  ) : (
                    'Tiếp Tục ➜'
                  )}
                </Button>
              </Form>
            )}

            {!success && step === 2 && (
              <Form onSubmit={handleResetPassword}>
                <div className="alert alert-light border mb-3 p-3">
                  <div className="text-muted small mb-1">Tài khoản: <strong>{username}</strong></div>
                  <div className="fw-semibold text-primary">
                    🛡️ Câu hỏi bảo mật:
                  </div>
                  <div className="fw-bold mt-1 text-dark">
                    "{securityQuestion}"
                  </div>
                </div>

                <Form.Group className="mb-3" controlId="securityAnswer">
                  <Form.Label className="fw-semibold">
                    Câu trả lời bảo mật <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nhập câu trả lời của bạn"
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    required
                    autoFocus
                  />
                  <Form.Text className="text-muted small">
                    (Không phân biệt chữ hoa, chữ thường)
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" controlId="newPassword">
                  <Form.Label className="fw-semibold">
                    Mật khẩu mới <span className="text-danger">*</span>
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Ít nhất 6 ký tự"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <Button
                      variant="outline-secondary"
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      title={showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      className="d-flex align-items-center"
                    >
                      {showNewPassword ? (
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

                <Form.Group className="mb-4" controlId="confirmNewPassword">
                  <Form.Label className="fw-semibold">
                    Xác nhận mật khẩu mới <span className="text-danger">*</span>
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showConfirmNewPassword ? 'text' : 'password'}
                      placeholder="Nhập lại mật khẩu mới"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                    />
                    <Button
                      variant="outline-secondary"
                      type="button"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      title={showConfirmNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      className="d-flex align-items-center"
                    >
                      {showConfirmNewPassword ? (
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

                <div className="d-flex gap-2">
                  <Button
                    variant="outline-secondary"
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setError(null);
                    }}
                    disabled={loading || !!success}
                  >
                    ← Quay lại
                  </Button>
                  <Button
                    variant="success"
                    type="submit"
                    disabled={loading || !!success}
                    className="flex-grow-1 py-2 fw-semibold shadow-sm"
                  >
                    {loading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" className="me-2" />
                        Đang đặt lại...
                      </>
                    ) : (
                      'Đặt Lại Mật Khẩu'
                    )}
                  </Button>
                </div>
              </Form>
            )}

            <div className="mt-4 pt-3 border-top text-center text-muted small">
              <div>
                <strong>Gợi ý câu trả lời tài khoản mẫu:</strong><br />
                <code>user</code>: <em>mimi</em> | <code>admin</code>: <em>mimi</em> | <code>customer1</code>: <em>nguyen hue</em>
              </div>
              <div className="mt-3">
                <Link to="/login" className="text-decoration-none fw-semibold">
                  ← Quay lại Đăng Nhập
                </Link>
                <span className="mx-2">|</span>
                <Link to="/register" className="text-decoration-none fw-semibold">
                  Đăng Ký Mới
                </Link>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default ForgotPassword;
