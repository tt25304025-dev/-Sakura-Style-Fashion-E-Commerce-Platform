import { useEffect, useState } from 'react';
import { Alert, Col, Row, Spinner } from 'react-bootstrap';
import api from '../../api/axios';
import { formatYen } from '../../utils/format';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.message || 'ダッシュボードの読み込みに失敗しました'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  const cards = [
    { label: '商品数', value: stats.totalProducts },
    { label: 'ユーザー数', value: stats.totalUsers },
    { label: '注文数', value: stats.totalOrders },
    { label: '売上合計', value: formatYen(stats.totalSales) },
  ];

  return (
    <div>
      <h1 className="h3 mb-4">ダッシュボード</h1>
      <Row className="g-3">
        {cards.map((card) => (
          <Col key={card.label} sm={6} xl={3}>
            <div className="stat-tile p-4">
              <p className="text-muted small mb-1">{card.label}</p>
              <p className="h3 mb-0">{card.value}</p>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
}
