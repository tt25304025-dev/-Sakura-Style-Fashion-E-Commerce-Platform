import { useState } from 'react';
import { Alert, Button, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { formatYen } from '../utils/format';
import { useCart } from '../context/CartContext';

export default function CheckoutPage() {
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '日本',
    isDefault: true,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/orders/checkout', { shippingAddress: form });
      await refreshCart();
      navigate(`/orders/${data.id}`, { state: { success: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'チェックアウトに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (!cart.items?.length) {
    return (
      <Container className="py-5">
        <Alert variant="warning">カートは空です。</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="h3 mb-4">チェックアウト</h1>
      <Row className="g-4">
        <Col md={7}>
          <div className="summary-panel p-4">
            <h2 className="h5 mb-3">お届け先住所</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>番地・建物名</Form.Label>
                <Form.Control name="street" required value={form.street} onChange={handleChange} />
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>市区町村</Form.Label>
                    <Form.Control name="city" required value={form.city} onChange={handleChange} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>都道府県</Form.Label>
                    <Form.Control name="state" required value={form.state} onChange={handleChange} />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>郵便番号</Form.Label>
                    <Form.Control name="zipCode" required value={form.zipCode} onChange={handleChange} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>国</Form.Label>
                    <Form.Control name="country" required value={form.country} onChange={handleChange} />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Check
                className="mb-3"
                type="checkbox"
                name="isDefault"
                label="デフォルトの住所として保存する"
                checked={form.isDefault}
                onChange={handleChange}
              />
              <Alert variant="light" className="border small">
                お支払いはシミュレーションです。「注文を確定」すると支払い済みになります。
              </Alert>
              <Button type="submit" className="btn-sakura" disabled={loading}>
                {loading ? <Spinner size="sm" /> : `注文を確定 · ${formatYen(cart.totalAmount)}`}
              </Button>
            </Form>
          </div>
        </Col>
        <Col md={5}>
          <div className="summary-panel p-4">
            <h2 className="h5 mb-3">商品（{cart.totalItems}点）</h2>
            {cart.items.map((item) => (
              <div key={item.id} className="d-flex justify-content-between mb-2 small">
                <span>
                  {item.productName} × {item.quantity}
                </span>
                <span>{formatYen(item.subtotal)}</span>
              </div>
            ))}
            <hr />
            <div className="d-flex justify-content-between fw-semibold">
              <span>合計</span>
              <span>{formatYen(cart.totalAmount)}</span>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
