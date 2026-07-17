import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { formatYen } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch((err) => setError(err.response?.data?.message || '商品が見つかりません'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setAdding(true);
    setMessage('');
    setError('');
    try {
      await addToCart(product.id, quantity, product.size);
      setMessage('カートに追加しました');
    } catch (err) {
      setError(err.response?.data?.message || 'カートに追加できませんでした');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!product) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error || '商品が見つかりません'}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="g-4">
        <Col md={6}>
          <div className="detail-image-wrap">
            <img src={product.imageUrl} alt={product.name} className="img-fluid w-100" />
          </div>
        </Col>
        <Col md={6}>
          <p className="text-muted mb-1">{product.categoryName}</p>
          <h1 className="h3 mb-3">{product.name}</h1>
          <p className="fs-4 fw-semibold mb-3">{formatYen(product.price)}</p>
          <p className="mb-3">{product.description}</p>
          <div className="d-flex gap-2 mb-3">
            {product.size && <Badge bg="light" text="dark">サイズ: {product.size}</Badge>}
            {product.color && <Badge bg="light" text="dark">カラー: {product.color}</Badge>}
            <Badge bg={product.stockQuantity > 0 ? 'success' : 'secondary'}>
              {product.stockQuantity > 0 ? `在庫 ${product.stockQuantity}` : '在庫切れ'}
            </Badge>
          </div>
          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          <div className="d-flex gap-2 align-items-end">
            <Form.Group style={{ width: 100 }}>
              <Form.Label>数量</Form.Label>
              <Form.Control
                type="number"
                min={1}
                max={product.stockQuantity}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </Form.Group>
            <Button
              className="btn-sakura"
              disabled={adding || product.stockQuantity < 1}
              onClick={handleAdd}
            >
              {adding ? '追加中...' : 'カートに入れる'}
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
