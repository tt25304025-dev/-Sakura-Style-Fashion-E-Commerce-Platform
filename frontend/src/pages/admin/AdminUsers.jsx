import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Spinner, Table } from 'react-bootstrap';
import api from '../../api/axios';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users', { params: { page: 0, size: 50, sort: 'createdAt,desc' } });
      setUsers(data.content || []);
    } catch (err) {
      setError(err.response?.data?.message || 'ユーザーの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleStatus = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/toggle-status`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || '更新に失敗しました');
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
      <h1 className="h3 mb-3">ユーザー管理</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      <Table responsive hover className="align-middle bg-white">
        <thead>
          <tr>
            <th>名前</th>
            <th>メール</th>
            <th>ロール</th>
            <th>状態</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                {user.firstName} {user.lastName}
              </td>
              <td>{user.email}</td>
              <td>
                {[...user.roles].map((role) => (
                  <Badge key={role} bg="light" text="dark" className="me-1">
                    {role.replace('ROLE_', '')}
                  </Badge>
                ))}
              </td>
              <td>
                <Badge bg={user.enabled ? 'success' : 'secondary'}>
                  {user.enabled ? '有効' : '無効'}
                </Badge>
              </td>
              <td className="text-end">
                <Button size="sm" variant="outline-secondary" onClick={() => toggleStatus(user.id)}>
                  {user.enabled ? '無効にする' : '有効にする'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
