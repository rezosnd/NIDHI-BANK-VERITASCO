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
      width: '100%',
      backgroundColor: '#1e293b',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      padding: '8px 16px',
      overflow: 'hidden',
      position: 'relative',
      zIndex: 10,
      borderBottom: '2px solid #0ea5e9'
    }}>
      <div style={{
        backgroundColor: '#ef4444',
        color: 'white',
        fontWeight: '800',
        fontSize: '0.75rem',
        padding: '4px 12px',
        borderRadius: '4px',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginRight: '16px',
        flexShrink: 0,
        zIndex: 2,
        boxShadow: '0 2px 4px rgba(239,68,68,0.3)'
      }}>
        Latest News
      </div>
      
      <div style={{
        flex: 1,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        position: 'relative'
      }}>
        <div style={{
          display: 'inline-block',
          animation: 'scrollNews 30s linear infinite',
          paddingLeft: '100%'
        }}>
          <style>
            {`
              @keyframes scrollNews {
                0% { transform: translateX(0); }
                100% { transform: translateX(-100%); }
              }
              .news-item:hover {
                color: #38bdf8;
                cursor: pointer;
              }
            `}
          </style>
          {news.map((n, i) => (
            <span key={n.id} style={{ marginRight: '60px', fontSize: '0.85rem', fontWeight: '500', display: 'inline-flex', alignItems: 'center' }}>
              <span style={{ color: '#0ea5e9', marginRight: '8px', fontSize: '1.2rem' }}>•</span>
              <span className="news-item">
                <strong style={{ color: '#bae6fd', marginRight: '6px' }}>{n.title}:</strong>
                {n.content}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
