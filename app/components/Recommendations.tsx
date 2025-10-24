'use client';

interface Recommendation {
  title: string;
  description: string;
}

interface Props {
  items: Recommendation[];
}

export function Recommendations({ items }: Props) {
  if (!items.length) {
    return (
      <div className="card" style={{ background: 'rgba(15, 23, 42, 0.85)' }}>
        <h3>Personalised Recommendations</h3>
        <p className="muted">Run a calculation to unlock targeted reduction strategies.</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ background: 'rgba(15, 23, 42, 0.85)' }}>
      <h3>Personalised Recommendations</h3>
      <div className="list">
        {items.map((item) => (
          <div key={item.title} className="list-item">
            <span>→</span>
            <div>
              <strong>{item.title}</strong>
              <p className="muted" style={{ marginTop: 4 }}>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
