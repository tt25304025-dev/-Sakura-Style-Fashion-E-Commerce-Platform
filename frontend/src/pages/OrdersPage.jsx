import { useEffect, useState } from 'react';
import { Alert, Badge, Container, Spinner, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { formatYen } from '../utils/format';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/orders', { params: { page: 0, size: 20, sort: 'createdAt,desc' } })
      .then((res) => setOrders(res.data.content || []))
      .catch((err) => setError(err.response?.data?.message || '注文の読み込みに失敗しました'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="h3 mb-4">注文履歴</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      {!orders.length ? (
        <Alert variant="light" className="border">
          まだ注文がありません。 <Link to="/products">買い物を始める</Link>
        </Alert>
      ) : (
        <Table responsive hover className="align-middle">
          <thead>
            <tr>
              <th>注文</th>
              <th>日時</th>
              <th>ステータス</th>
              <th>支払い</th>
              <th>合計</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{new Date(order.createdAt).toLocaleString('ja-JP')}</td>
                <td>
                  <Badge bg="dark">{order.status}</Badge>
                </td>
                <td>
                  <Badge bg={order.paymentStatus === 'PAID' ? 'success' : 'secondary'}>
                    {order.paymentStatus}
                  </Badge>
                </td>
                <td>{formatYen(order.totalAmount)}</td>
                <td>
                  <Link to={`/orders/${order.id}`}>詳細</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}
