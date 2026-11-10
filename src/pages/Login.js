import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Container, Spinner, Card, InputGroup } from 'react-bootstrap';
import nenImg from '../images/nen.jpg';
import { login as loginApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';

function Login() {
  const location = useLocation();
  const [username, setUsername] = useState(location.state?.username || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(
    location.state?.message || location.state?.successMsg || null
  );
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    if (location.state?.username) {
      setUsername(location.state.username);
    }
    if (location.state?.message || location.state?.successMsg) {
      setSuccessMsg(location.state.message || location.state.successMsg);
      const timer = setTimeout(() => {
        setSuccessMsg(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await loginApi({ username: username.trim(), password: password.trim() });
      const token = res.data?.token || res.data?.jwt || res.data?.accessToken || '';
      if (!token) {
        throw new Error('Không nhận được token từ server');
      }
      auth.login(token);
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Đăng nhập thất bại. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  return ( <div className="login-page" style={{ backgroundImage: `url(${nenImg})`, backgroundSize: 'cover', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    <Container className="mt-5" style={{ maxWidth: '450px' }}>
      <Card className="shadow">
        <Card.Body className="p-4">
          <h2 className="mb-4 text-center">🔐 Đăng Nhập</h2>
          {successMsg && (
            <Alert variant="success" dismissible onClose={() => setSuccessMsg(null)}>
              {successMsg}
            </Alert>
          )}
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="loginUsername">
              <Form.Label>Tên đăng nhập</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-2" controlId="loginPassword">
              <Form.Label>Mật khẩu</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                      <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
                      <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                      <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                    </svg>
                  )}
                </Button>
              </InputGroup>
            </Form.Group>

            <div className="d-flex justify-content-end mb-3">
              <Link to="/forgot-password" className="small text-decoration-none text-primary">
                Quên mật khẩu?
              </Link>
            </div>

            <Button variant="primary" type="submit" disabled={loading} className="w-100 py-2 fw-semibold">
              {loading ? (
                <Spinner as="span" animation="border" size="sm" />
              ) : (
                'Đăng Nhập'
              )}
            </Button>
          </Form>

          <div className="mt-3 text-center border-top pt-3">
            <span className="text-muted">Chưa có tài khoản? </span>
            <Link to="/register" className="fw-semibold text-decoration-none">
              Đăng ký ngay
            </Link>
          </div>

          <div className="mt-3 text-center text-muted" style={{ fontSize: '0.85rem' }}>
            <strong>Tài khoản test:</strong><br />
            <code>admin / admin123</code> (Quản trị viên)<br />
            <code>user / user123</code> (Khách hàng)
          </div>
        </Card.Body>
      </Card>
    </Container>
    </div>
  );
}

export default Login;
