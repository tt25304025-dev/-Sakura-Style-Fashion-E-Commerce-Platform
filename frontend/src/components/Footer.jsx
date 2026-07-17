import { Container } from 'react-bootstrap';

export default function Footer() {
  return (
    <footer className="sakura-footer mt-auto py-4">
      <Container className="d-flex flex-column flex-md-row justify-content-between gap-2">
        <div>
          <strong className="brand-mark">Sakura Style</strong>
          <p className="mb-0 text-muted small">Spring Boot・React・PostgreSQL を使用し、JWT認証や管理画面を実装したフルスタックECサイトです。</p>
        </div>
        <p className="mb-0 text-muted small align-self-md-end">お支払いはシミュレーションです。 &copy; {new Date().getFullYear()}</p>
      </Container>
    </footer>
  );
}
