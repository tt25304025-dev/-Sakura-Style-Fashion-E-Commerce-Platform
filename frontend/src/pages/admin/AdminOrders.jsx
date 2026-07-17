import { useEffect, useState } from 'react';
import { Alert, Badge, Form, Spinner, Table } from 'react-bootstrap';
import api from '../../api/axios';
import { formatYen } from '../../utils/format';

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const STATUS_LABELS = {
  PENDING: '保留',
  CONFIRMED: '確定',
  SHIPPED: '発送済み',
  DELIVERED: '配達完了',
  CANCELLED: 'キャンセル',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/orders', { params: { page: 0, size: 50, sort: 'createdAt,desc' } });
      setOrders(data.content || []);
    } catch (err) {
      setError(err.response?.data?.message || '注文の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/orders/${id}/status`, { status });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'ステータス更新に失敗しました');
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
    <div>
      <h1 className="h3 mb-3">注文管理</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      <Table responsive hover className="align-middle bg-white">
        <thead>
          <tr>
            <th>ID</th>
            <th>お客様</th>
            <th>合計</th>
            <th>支払い</th>
            <th>ステータス</th>
            <th>日時</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>#{order.id}</td>
              <td>
                <div>{order.customerName}</div>
                <small className="text-muted">{order.customerEmail}</small>
              </td>
              <td>{formatYen(order.totalAmount)}</td>
              <td>
                <Badge bg={order.paymentStatus === 'PAID' ? 'success' : 'secondary'}>
                  {order.paymentStatus}
                </Badge>
              </td>
              <td style={{ minWidth: 160 }}>
                <Form.Select
                  size="sm"
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status] || status}
                    </option>
                  ))}
                </Form.Select>
              </td>
              <td>{new Date(order.createdAt).toLocaleString('ja-JP')}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
