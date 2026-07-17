import { useEffect, useState } from 'react';
import { Alert, Button, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { updateUser } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get('/users/me')
      .then((res) => {
        setForm({
          firstName: res.data.firstName || '',
          lastName: res.data.lastName || '',
          phone: res.data.phone || '',
          email: res.data.email || '',
        });
      })
      .catch((err) => setError(err.response?.data?.message || 'プロフィールの読み込みに失敗しました'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const { data } = await api.put('/users/me', {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
      });
      updateUser({ firstName: data.firstName, lastName: data.lastName });
      setMessage('プロフィールを更新しました');
    } catch (err) {
      setError(err.response?.data?.message || '更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={6}>
          <div className="summary-panel p-4">
            <h1 className="h4 mb-3">マイプロフィール</h1>
            {message && <Alert variant="success">{message}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>メールアドレス</Form.Label>
                <Form.Control value={form.email} disabled />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>名</Form.Label>
                <Form.Control
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>姓</Form.Label>
                <Form.Control
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label>電話番号</Form.Label>
                <Form.Control
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </Form.Group>
              <Button type="submit" className="btn-sakura" disabled={saving}>
                {saving ? '保存中...' : '変更を保存'}
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
