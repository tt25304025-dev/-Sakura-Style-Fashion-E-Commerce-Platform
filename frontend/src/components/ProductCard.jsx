import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { formatYen } from '../utils/format';

export default function ProductCard({ product }) {
  return (
    <Card className="product-card h-100 border-0">
      <Link to={`/products/${product.id}`} className="text-decoration-none text-dark">
        <div className="product-image-wrap">
          <Card.Img variant="top" src={product.imageUrl} alt={product.name} />
        </div>
        <Card.Body className="px-0">
          <p className="text-muted small mb-1">{product.categoryName}</p>
          <Card.Title className="h6 mb-2">{product.name}</Card.Title>
          <div className="d-flex justify-content-between align-items-center">
            <strong>{formatYen(product.price)}</strong>
            <span className="small text-muted">{product.color}</span>
          </div>
        </Card.Body>
      </Link>
    </Card>
  );
}
