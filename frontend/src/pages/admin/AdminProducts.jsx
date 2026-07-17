import { useEffect, useState } from 'react';
import { Alert, Button, Form, Modal, Spinner, Table } from 'react-bootstrap';
import api from '../../api/axios';
import { formatYen } from '../../utils/format';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  categoryId: '',
  imageUrl: '',
  stockQuantity: 10,
  size: 'M',
  color: '',
  status: 'ACTIVE',
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/admin/products', { params: { page: 0, size: 50, sort: 'createdAt,desc' } }),
        api.get('/categories'),
      ]);
      setProducts(productsRes.data.content || []);
      setCategories(categoriesRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || '商品の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditId(null);
    setForm({ ...emptyForm, categoryId: categories[0]?.id || '' });
    setShow(true);
  };

  const openEdit = (product) => {
    setEditId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      categoryId: product.categoryId,
      imageUrl: product.imageUrl,
      stockQuantity: product.stockQuantity,
      size: product.size || '',
      color: product.color || '',
      status: product.status,
    });
    setShow(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      ...form,
      price: Number(form.price),
      categoryId: Number(form.categoryId),
      stockQuantity: Number(form.stockQuantity),
    };
    try {
      if (editId) {
        await api.put(`/admin/products/${editId}`, payload);
      } else {
        await api.post('/admin/products', payload);
      }
      setShow(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || '保存に失敗しました');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('この商品を削除しますか？')) return;
    await api.delete(`/admin/products/${id}`);
    await load();
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
        <h1 className="h3 mb-0">商品管理</h1>
        <Button className="btn-sakura" onClick={openCreate}>
          商品を追加
        </Button>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      <Table responsive hover className="align-middle bg-white">
        <thead>
          <tr>
            <th>名前</th>
            <th>カテゴリ</th>
            <th>価格</th>
            <th>在庫</th>
            <th>状態</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.categoryName}</td>
              <td>{formatYen(p.price)}</td>
              <td>{p.stockQuantity}</td>
              <td>{p.status}</td>
              <td className="text-end">
                <Button size="sm" variant="outline-secondary" className="me-2" onClick={() => openEdit(p)}>
                  編集
                </Button>
                <Button size="sm" variant="outline-danger" onClick={() => handleDelete(p.id)}>
                  削除
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={show} onHide={() => setShow(false)} size="lg">
        <Form onSubmit={handleSave}>
          <Modal.Header closeButton>
            <Modal.Title>{editId ? '商品を編集' : '商品を追加'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>名前</Form.Label>
              <Form.Control required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>説明</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Form.Group>
            <div className="row g-3">
              <div className="col-md-4">
                <Form.Group>
                  <Form.Label>価格</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group>
                  <Form.Label>カテゴリ</Form.Label>
                  <Form.Select
                    required
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  >
                    <option value="">選択...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group>
                  <Form.Label>在庫</Form.Label>
                  <Form.Control
                    type="number"
                    required
                    value={form.stockQuantity}
                    onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
                  />
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group>
                  <Form.Label>サイズ</Form.Label>
                  <Form.Control value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} />
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group>
                  <Form.Label>カラー</Form.Label>
                  <Form.Control value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group>
                  <Form.Label>状態</Form.Label>
                  <Form.Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="ACTIVE">有効 (ACTIVE)</option>
                    <option value="INACTIVE">無効 (INACTIVE)</option>
                    <option value="OUT_OF_STOCK">在庫切れ (OUT_OF_STOCK)</option>
                  </Form.Select>
                </Form.Group>
              </div>
            </div>
            <Form.Group className="mt-3">
              <Form.Label>画像URL</Form.Label>
              <Form.Control
                required
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
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

