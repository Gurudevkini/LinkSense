import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Toast from '../components/Toast';
import '../App.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function RedirectPage() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const resolveAndRedirect = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/resolve/${slug}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Invalid or expired link');
        }

        // Redirect to the long URL
        window.location.href = data.longUrl;
      } catch (err) {
        setError(err.message || 'Failed to resolve link');
        setShowToast(true);
        setLoading(false);
      }
    };

    resolveAndRedirect();
  }, [slug]);

  return (
    <div className="linksense-layout">
      {/* Dim gold spotlight background */}
      <div className="spotlight" />

      <div className="container">
        <header className="header">
          <h1 className="title">LinkSense</h1>
          <p className="subtitle">Enterprise-grade URL shortening.</p>
        </header>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
          gap: '24px',
          padding: '40px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          marginTop: '20px',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4)'
        }}>
          {loading && (
            <>
              <div style={{
                width: '32px',
                height: '32px',
                border: '2px solid rgba(212, 175, 55, 0.1)',
                borderTop: '2px solid var(--accent-gold)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontFamily: 'var(--font-mono)' }}>
                Resolving secure link...
              </p>
            </>
          )}

          {error && !loading && (
            <div style={{
              textAlign: 'center',
              maxWidth: '320px'
            }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: '500', color: '#ef4444', fontSize: '15px' }}>
                Link Resolution Failed
              </p>
              <p style={{ margin: '0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                {error}
              </p>
            </div>
          )}
        </div>

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>

      <Toast
        message={error}
        show={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}

export default RedirectPage;
