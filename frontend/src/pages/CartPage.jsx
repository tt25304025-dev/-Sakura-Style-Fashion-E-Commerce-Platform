import { Alert, Button, Col, Container, Form, Row, Spinner, Table } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatYen } from '../utils/format';

export default function CartPage() {
  const { cart, loading, updateItem, removeItem } = useCart();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!cart.items?.length) {
    return (
      <Container className="py-5 text-center">
        <h1 className="h3">カートは空です</h1>
        <Button as={Link} to="/products" className="btn-sakura mt-3">
          買い物を続ける
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="h3 mb-4">ショッピングカート</h1>
      <Row className="g-4">
        <Col lg={8}>
          <Table responsive className="align-middle">
            <thead>
              <tr>
                <th>商品</th>
                <th>価格</th>
                <th>数量</th>
                <th>小計</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {cart.items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      <img src={item.imageUrl} alt={item.productName} width={64} height={64} className="object-fit-cover rounded" />
                      <div>
                        <div className="fw-semibold">{item.productName}</div>
                        <small className="text-muted">
                          {item.size} · {item.color}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>{formatYen(item.price)}</td>
                  <td style={{ width: 100 }}>
                    <Form.Control
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, Number(e.target.value), item.productId)}
                    />
                  </td>
                  <td>{formatYen(item.subtotal)}</td>
                  <td>
                    <Button variant="outline-danger" size="sm" onClick={() => removeItem(item.id)}>
                      削除
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
        <Col lg={4}>
          <div className="summary-panel p-4">
            <h2 className="h5">ご注文内容</h2>
            <div className="d-flex justify-content-between mb-3">
              <span>合計</span>
              <strong>{formatYen(cart.totalAmount)}</strong>
            </div>
            <Alert variant="light" className="small border">
              チェックアウト時のお支払いはシミュレーションです。
            </Alert>
            <Button className="btn-sakura w-100" onClick={() => navigate('/checkout')}>
              レジに進む
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
