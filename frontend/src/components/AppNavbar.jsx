import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Badge, Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { FiShoppingBag, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function AppNavbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar expand="lg" className="sakura-navbar border-bottom sticky-top bg-white">
      <Container>
        <Navbar.Brand as={Link} to="/" className="brand-mark">
          Sakura Style
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/products">
              ショップ
            </Nav.Link>
            {isAdmin && (
              <Nav.Link as={NavLink} to="/admin">
                管理画面
              </Nav.Link>
            )}
          </Nav>
          <Nav className="align-items-lg-center gap-lg-2">
            {isAuthenticated ? (
              <>
                <Nav.Link as={NavLink} to="/cart" className="d-flex align-items-center gap-1">
                  <FiShoppingBag />
                  カート
                  {cart.totalItems > 0 && (
                    <Badge bg="dark" pill>
                      {cart.totalItems}
                    </Badge>
                  )}
                </Nav.Link>
                <NavDropdown
                  title={
                    <span className="d-inline-flex align-items-center gap-1">
                      <FiUser /> {user?.firstName}
                    </span>
                  }
                  align="end"
                >
                  <NavDropdown.Item as={Link} to="/profile">
                    プロフィール
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/orders">
                    注文履歴
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>ログアウト</NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link as={NavLink} to="/login">
                  ログイン
                </Nav.Link>
                <Nav.Link as={NavLink} to="/register" className="btn btn-sakura btn-sm text-white px-3">
                  会員登録
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
