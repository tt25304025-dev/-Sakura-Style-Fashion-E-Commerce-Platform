import { useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      navigate(data.roles?.includes('ROLE_ADMIN') ? '/admin' : '/products');
    } catch (err) {
      setError(err.response?.data?.message || 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={5}>
          <Card className="auth-panel border-0 shadow-sm">
            <Card.Body className="p-4">
              <h2 className="h4 mb-1">おかえりなさい</h2>
              <p className="text-muted mb-4">Sakura Style にログイン</p>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>メールアドレス</Form.Label>
                  <Form.Control
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label>パスワード</Form.Label>
                  <Form.Control
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </Form.Group>
                <Button type="submit" className="btn-sakura w-100" disabled={loading}>
                  {loading ? <Spinner size="sm" /> : 'ログイン'}
                </Button>
              </Form>
              <p className="mt-3 mb-0 small text-center">
                アカウントをお持ちでない方は <Link to="/register">会員登録</Link>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
