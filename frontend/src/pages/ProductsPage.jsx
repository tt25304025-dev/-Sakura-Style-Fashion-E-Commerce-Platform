import { useEffect, useState } from 'react';
import { Alert, Col, Container, Form, Pagination, Row, Spinner } from 'react-bootstrap';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sort, setSort] = useState('createdAt,desc');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const [sortField, sortDir] = sort.split(',');
        const { data } = await api.get('/products', {
          params: {
            keyword: keyword || undefined,
            categoryId: categoryId || undefined,
            page,
            size: 12,
            sort: `${sortField},${sortDir}`,
          },
        });
        setProducts(data.content || []);
        setTotalPages(data.page?.totalPages ?? data.totalPages ?? 0);
      } catch (err) {
        setError(err.response?.data?.message || '商品の読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [keyword, categoryId, sort, page]);

  return (
    <Container className="py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">ショップ</h1>
          <p className="text-muted mb-0">検索・絞り込み・並び替えができます。</p>
        </div>
        <Row className="g-2 w-100 w-md-auto" style={{ maxWidth: 640 }}>
          <Col sm={4}>
            <Form.Control
              placeholder="検索..."
              value={keyword}
              onChange={(e) => {
                setPage(0);
                setKeyword(e.target.value);
              }}
            />
          </Col>
          <Col sm={4}>
            <Form.Select
              value={categoryId}
              onChange={(e) => {
                setPage(0);
                setCategoryId(e.target.value);
              }}
            >
              <option value="">すべてのカテゴリ</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col sm={4}>
            <Form.Select
              value={sort}
              onChange={(e) => {
                setPage(0);
                setSort(e.target.value);
              }}
            >
              <option value="createdAt,desc">新着順</option>
              <option value="price,asc">価格が安い順</option>
              <option value="price,desc">価格が高い順</option>
              <option value="name,asc">名前順</option>
            </Form.Select>
          </Col>
        </Row>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : products.length === 0 ? (
        <Alert variant="light" className="border">
          商品が見つかりませんでした。
        </Alert>
      ) : (
        <>
          <Row className="g-4">
            {products.map((product) => (
              <Col key={product.id} xs={12} sm={6} md={4} lg={3}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                {[...Array(totalPages)].map((_, i) => (
                  <Pagination.Item key={i} active={i === page} onClick={() => setPage(i)}>
                    {i + 1}
                  </Pagination.Item>
                ))}
              </Pagination>
            </div>
          )}
        </>
      )}
    </Container>
  );
}
