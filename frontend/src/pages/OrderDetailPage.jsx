import { useEffect, useState } from 'react';
import { Alert, Badge, Col, Container, Row, Spinner, Table } from 'react-bootstrap';
import { useLocation, useParams } from 'react-router-dom';
import api from '../api/axios';
import { formatYen } from '../utils/format';

export default function OrderDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/orders/${id}`)
      .then((res) => setOrder(res.data))
      .catch((err) => setError(err.response?.data?.message || '注文が見つかりません'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!order) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {location.state?.success && (
        <Alert variant="success">ご注文が完了しました。お支払いはシミュレーションで完了しています。</Alert>
      )}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">注文 #{order.id}</h1>
        <div className="d-flex gap-2">
          <Badge bg="dark">{order.status}</Badge>
          <Badge bg="success">{order.paymentStatus}</Badge>
        </div>
      </div>
      <Row className="g-4">
        <Col md={8}>
          <Table responsive className="align-middle">
            <thead>
              <tr>
                <th>商品</th>
                <th>数量</th>
                <th>価格</th>
                <th>小計</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      <img src={item.imageUrl} alt={item.productName} width={56} height={56} className="object-fit-cover rounded" />
                      <div>
                        <div>{item.productName}</div>
                        <small className="text-muted">
                          {item.size} · {item.color}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>{item.quantity}</td>
                  <td>{formatYen(item.price)}</td>
                  <td>{formatYen(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
        <Col md={4}>
          <div className="summary-panel p-4">
            <h2 className="h6">配送先</h2>
            <p className="small mb-3">
              {order.shippingAddress.street}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state}
              <br />
              {order.shippingAddress.zipCode}
              <br />
              {order.shippingAddress.country}
            </p>
            <div className="d-flex justify-content-between fw-semibold">
              <span>合計</span>
              <span>{formatYen(order.totalAmount)}</span>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
