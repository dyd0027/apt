export default function Loading() {
  return (
    <div className="loading-page" role="status" aria-label="시뮬레이터 불러오는 중">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-banner" />
      <div className="skeleton skeleton-hero" />
      <div className="loading-cards">
        {[0, 1, 2, 3].map((i) => (
          <div className="skeleton" key={i} />
        ))}
      </div>
    </div>
  );
}
