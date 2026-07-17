import { NavLink, Outlet } from 'react-router-dom';
import { Col, Container, Nav, Row } from 'react-bootstrap';

export default function AdminLayout() {
  return (
    <Container fluid className="py-4 px-4">
      <Row>
        <Col md={3} lg={2} className="mb-4">
          <div className="admin-side p-3">
            <p className="brand-mark mb-3">管理画面</p>
            <Nav className="flex-column gap-1">
              <Nav.Link as={NavLink} to="/admin" end>
                ダッシュボード
              </Nav.Link>
              <Nav.Link as={NavLink} to="/admin/products">
                商品
              </Nav.Link>
              <Nav.Link as={NavLink} to="/admin/categories">
                カテゴリ
              </Nav.Link>
              <Nav.Link as={NavLink} to="/admin/orders">
                注文
              </Nav.Link>
              <Nav.Link as={NavLink} to="/admin/users">
                ユーザー
              </Nav.Link>
            </Nav>
          </div>
        </Col>
        <Col md={9} lg={10}>
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
}
