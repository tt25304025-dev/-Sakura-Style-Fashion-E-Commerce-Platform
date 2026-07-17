import { useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message || '会員登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="auth-panel border-0 shadow-sm">
            <Card.Body className="p-4">
              <h2 className="h4 mb-1">会員登録</h2>
              <p className="text-muted mb-4">Sakura Style へようこそ</p>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>名</Form.Label>
                      <Form.Control name="firstName" required value={form.firstName} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>姓</Form.Label>
                      <Form.Control name="lastName" required value={form.lastName} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label>メールアドレス</Form.Label>
                  <Form.Control type="email" name="email" required value={form.email} onChange={handleChange} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>電話番号</Form.Label>
                  <Form.Control name="phone" value={form.phone} onChange={handleChange} />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label>パスワード</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Button type="submit" className="btn-sakura w-100" disabled={loading}>
                  {loading ? <Spinner size="sm" /> : '登録する'}
                </Button>
              </Form>
              <p className="mt-3 mb-0 small text-center">
                すでに登録済みの方は <Link to="/login">ログイン</Link>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
