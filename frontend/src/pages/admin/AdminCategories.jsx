import { useEffect, useState } from 'react';
import { Alert, Button, Form, Modal, Spinner, Table } from 'react-bootstrap';
import api from '../../api/axios';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editId, setEditId] = useState(null);
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (err) {
      setError(err.response?.data?.message || 'カテゴリの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditId(null);
    setForm({ name: '', description: '' });
    setShow(true);
  };

  const openEdit = (category) => {
    setEditId(category.id);
    setForm({ name: category.name, description: category.description || '' });
    setShow(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/admin/categories/${editId}`, form);
      } else {
        await api.post('/admin/categories', form);
      }
      setShow(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || '保存に失敗しました');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('このカテゴリを削除しますか？')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || '削除に失敗しました');
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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">カテゴリ管理</h1>
        <Button className="btn-sakura" onClick={openCreate}>
          カテゴリを追加
        </Button>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      <Table responsive hover className="bg-white">
        <thead>
          <tr>
            <th>名前</th>
            <th>説明</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.description}</td>
              <td className="text-end">
                <Button size="sm" variant="outline-secondary" className="me-2" onClick={() => openEdit(c)}>
                  編集
                </Button>
                <Button size="sm" variant="outline-danger" onClick={() => handleDelete(c.id)}>
                  削除
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={show} onHide={() => setShow(false)}>
        <Form onSubmit={handleSave}>
          <Modal.Header closeButton>
            <Modal.Title>{editId ? 'カテゴリを編集' : 'カテゴリを追加'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>名前</Form.Label>
              <Form.Control required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Form.Group>
            <Form.Group>
              <Form.Label>説明</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShow(false)}>
              キャンセル
            </Button>
            <Button type="submit" className="btn-sakura">
              保存
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

