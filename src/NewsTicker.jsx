import React, { useState, useEffect } from 'react';

export default function NewsTicker({ receiverType }) {
  const [news, setNews] = useState([]);
  
  useEffect(() => {
    const fetchActiveNews = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`/api/news?status=1&receiver=${receiverType}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setNews(data);
        }
      } catch (e) {
        console.error('Failed to load news for ticker', e);
      }
    };
    fetchActiveNews();
  }, [receiverType]);

  if (news.length === 0) return null;

  return (
    <div style={{
      margin: '0.5rem 1.5rem',
      borderRadius: '16px',
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
      backdropFilter: 'blur(32px)',
      WebkitBackdropFilter: 'blur(32px)',
      border: '1px solid rgba(255, 255, 255, 0.4)',
      borderTop: '1px solid rgba(255, 255, 255, 0.9)',
      borderLeft: '1px solid rgba(255, 255, 255, 0.9)',
      boxShadow: '0 8px 32px rgba(31, 38, 135, 0.05)',
      color: '#1e293b',
      display: 'flex',
      alignItems: 'center',
      padding: '8px 12px',
      overflow: 'hidden',
      position: 'relative',
      zIndex: 10,
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
        color: 'white',
        fontWeight: '800',
        fontSize: '0.65rem',
        padding: '4px 10px',
        borderRadius: '10px',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginRight: '16px',
        flexShrink: 0,
        zIndex: 2,
        boxShadow: '0 4px 10px rgba(239,68,68,0.3)'
      }}>
        UPDATE
      </div>
      
      <div style={{
        flex: 1,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        position: 'relative'
      }}>
        <div style={{
          display: 'inline-block',
          animation: 'scrollNews 40s linear infinite',
          paddingLeft: '100%'
        }}>
          <style>
            {`
              @keyframes scrollNews {
                0% { transform: translateX(0); }
                100% { transform: translateX(-100%); }
              }
              .news-item:hover {
                color: #2563eb;
                cursor: pointer;
              }
            `}
          </style>
          {news.map((n, i) => (
            <span key={n.id} style={{ marginRight: '60px', fontSize: '0.85rem', fontWeight: '500', display: 'inline-flex', alignItems: 'center' }}>
              <span style={{ color: '#ef4444', marginRight: '8px', fontSize: '1.2rem' }}>•</span>
              <span className="news-item">
                <strong style={{ color: '#0f172a', marginRight: '6px' }}>{n.title}:</strong>
                <span style={{ color: '#334155' }}>{n.content}</span>
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
