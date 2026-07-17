import { Link } from 'react-router-dom';
import { Button, Container } from 'react-bootstrap';

export default function HomePage() {
  return (
    <section className="hero-section">
      <div className="hero-media" aria-hidden="true" />
      <Container className="hero-content">
        <p className="brand-mark hero-brand mb-3">Sakura Style</p>
        <h1 className="hero-title">毎日に馴染む、やさしいレイヤー</h1>
        <p className="hero-copy">トップスとドレスを中心に、すっきりとした現代的なワードローブをご用意しました。</p>
        <Button as={Link} to="/products" className="btn-sakura px-4">
          コレクションを見る
        </Button>
      </Container>
    </section>
  );
}
