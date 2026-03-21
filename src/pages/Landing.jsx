import { useEffect, useState } from 'react'

const tickerData = [
  { sym: 'RELIANCE', price: '₹2,847', change: '+1.4%', up: true },
  { sym: 'TCS', price: '₹3,910', change: '+2.1%', up: true },
  { sym: 'INFY', price: '₹1,523', change: '-0.8%', up: false },
  { sym: 'HDFC BANK', price: '₹1,682', change: '+0.5%', up: true },
  { sym: 'WIPRO', price: '₹456', change: '-1.2%', up: false },
  { sym: 'BAJAJ FIN', price: '₹6,834', change: '+3.1%', up: true },
  { sym: 'ICICI BANK', price: '₹1,124', change: '+0.9%', up: true },
  { sym: 'ADANI', price: '₹2,210', change: '-0.4%', up: false },
]

const features = [
  { icon: '◉', color: '#4f8ef7', title: 'AI Financial Advisor', desc: 'Ask anything about money. Get smart, personalized guidance powered by Groq — instant answers, zero jargon.' },
  { icon: '◈', color: '#7c3aed', title: 'Smart Portfolio', desc: 'Track your investments in real time. Visualize allocation, monitor gains, and get rebalancing suggestions.' },
  { icon: '◎', color: '#06d6a0', title: 'Live Stock Tracker', desc: 'NSE & BSE stocks at your fingertips. Real-time prices, charts, and AI-powered sentiment analysis.' },
  { icon: '◇', color: '#fbbf24', title: 'Finance Quiz', desc: 'Level up your financial literacy with daily quizzes. Learn investing, budgeting, and markets the fun way.' },
]

const stats = [
  { value: '10K+', label: 'Students learning' },
  { value: '₹2Cr+', label: 'Portfolios tracked' },
  { value: '500+', label: 'Quiz questions' },
  { value: '99.9%', label: 'Uptime' },
]

export default function Landing({ navigate }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 50) }, [])

  const items = [...tickerData, ...tickerData]

  return (
    <div className="landing-wrap">

      {/* ── Orbs ── */}
      <div className="orb" style={{ width: 700, height: 700, background: '#4f8ef7', top: -300, left: -200 }} />
      <div className="orb" style={{ width: 600, height: 600, background: '#7c3aed', top: 0, right: -250 }} />
      <div className="orb" style={{ width: 500, height: 500, background: '#06d6a0', top: 600, left: '35%' }} />

      {/* ── Navbar ── */}
      <nav className="landing-content" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '1.25rem 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(2,9,23,0.75)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--card-border)',
        animation: 'fadeIn 0.6s ease both',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(79,142,247,0.5)',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L15.5 5.75V12.25L9 16L2.5 12.25V5.75L9 2Z" stroke="white" strokeWidth="1.5" fill="none"/>
              <circle cx="9" cy="9" r="2.5" fill="white"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>
            FinSight<span style={{ color: 'var(--accent)' }}> AI</span>
          </span>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('dashboard')} style={{ padding: '10px 22px', fontSize: 14 }}>
          Get Started →
        </button>
      </nav>

      {/* ── Hero ── */}
      <section className="landing-content" style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center',
        padding: '8rem 2rem 4rem',
        maxWidth: 1200, margin: '0 auto',
        gap: '4rem', flexWrap: 'wrap',
      }}>
        {/* Left text */}
        <div style={{
          flex: '1 1 480px',
          opacity: visible ? 1 : 0,
          transform: visible ? 'none' : 'translateY(32px)',
          transition: 'all 0.8s cubic-bezier(0.4,0,0.2,1)',
        }}>
          <div className="badge badge-blue" style={{ marginBottom: '1.5rem', fontSize: 13 }}>
            🎓 Built for students
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.8rem, 6vw, 5rem)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            color: 'var(--text)',
            marginBottom: '1.5rem',
          }}>
            Your AI-Powered<br />
            <span style={{
              background: 'linear-gradient(135deg, #4f8ef7, #7c3aed, #06d6a0)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradient-move 4s ease infinite',
            }}>
              Financial Advisor
            </span>
          </h1>

          <p style={{ fontSize: 18, color: 'var(--text2)', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: 480 }}>
            Learn investing, track stocks, manage your portfolio — all powered by AI. Made for students who want to grow their wealth, not just their GPA.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('dashboard')}
              style={{ fontSize: 16, padding: '14px 28px', animation: 'pulse-glow 3s ease-in-out infinite' }}>
              Start Learning Free →
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('chat')}
              style={{ fontSize: 16, padding: '14px 28px' }}>
              Talk to AI Advisor
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '2.5rem', marginTop: '3rem', flexWrap: 'wrap' }}>
            {stats.map((s, i) => (
              <div key={i} style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateY(16px)',
                transition: `all 0.6s ease ${0.2 + i * 0.1}s`,
              }}>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>{s.value}</p>
                <p style={{ fontSize: 13, color: 'var(--text3)', margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — floating card */}
        <div style={{
          flex: '1 1 320px',
          display: 'flex', justifyContent: 'center',
          opacity: visible ? 1 : 0,
          transform: visible ? 'none' : 'translateX(32px)',
          transition: 'all 0.9s cubic-bezier(0.4,0,0.2,1) 0.2s',
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 24, padding: '1.5rem',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            animation: 'float 6s ease-in-out infinite',
            minWidth: 300, maxWidth: 380, width: '100%',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--text)', margin: 0 }}>Portfolio</p>
                <p style={{ fontSize: 13, color: 'var(--text2)', margin: 0 }}>Overall performance</p>
              </div>
              <span className="badge badge-green">+12.4%</span>
            </div>

            {/* Chart */}
            <svg width="100%" height="80" viewBox="0 0 300 80" style={{ marginBottom: 16 }}>
              <defs>
                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f8ef7" stopOpacity="0.4"/>
                  <stop offset="100%" stopColor="#4f8ef7" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path d="M0,60 L30,52 L60,45 L90,48 L120,38 L150,30 L180,25 L210,20 L240,15 L270,10 L300,5"
                stroke="#4f8ef7" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              <path d="M0,60 L30,52 L60,45 L90,48 L120,38 L150,30 L180,25 L210,20 L240,15 L270,10 L300,5 L300,80 L0,80 Z"
                fill="url(#cg)"/>
            </svg>

            {/* Holdings bars */}
            {[
              { name: 'RELIANCE', alloc: 35, color: '#4f8ef7' },
              { name: 'TCS',      alloc: 28, color: '#7c3aed' },
              { name: 'INFY',     alloc: 22, color: '#06d6a0' },
              { name: 'Others',   alloc: 15, color: '#fbbf24' },
            ].map(h => (
              <div key={h.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: h.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--text2)', flex: 1 }}>{h.name}</span>
                <div style={{ flex: 2, background: 'rgba(255,255,255,0.07)', borderRadius: 4, height: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${h.alloc}%`, height: '100%', background: h.color, borderRadius: 4 }} />
                </div>
                <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500, minWidth: 32, textAlign: 'right' }}>{h.alloc}%</span>
              </div>
            ))}

            {/* AI bubble */}
            <div style={{
              marginTop: '1rem', padding: '12px 14px',
              background: 'rgba(79,142,247,0.12)',
              border: '1px solid rgba(79,142,247,0.25)',
              borderRadius: 14, borderTopLeftRadius: 4,
            }}>
              <p style={{ fontSize: 13, color: 'var(--text)', margin: 0, lineHeight: 1.5 }}>
                💡 <strong>FinSight AI:</strong> Your RELIANCE holding is up 18% this month. Consider taking partial profits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ticker ── */}
      <div className="ticker-wrap">
        <div className="ticker-inner">
          {items.map((item, i) => (
            <div key={i} className="ticker-item">
              <span style={{ fontWeight: 700, color: 'var(--text)', marginRight: 8 }}>{item.sym}</span>
              <span style={{ marginRight: 6 }}>{item.price}</span>
              <span className={item.up ? 'tick-up' : 'tick-down'}>{item.change}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section className="landing-content" style={{ padding: '6rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <p style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '0.1em', fontSize: 13, marginBottom: 12, textTransform: 'uppercase' }}>
            Everything you need
          </p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.03em', marginBottom: 16 }}>
            Finance, simplified for students
          </h2>
          <p style={{ color: 'var(--text2)', fontSize: 18, maxWidth: 560, margin: '0 auto' }}>
            Four powerful tools in one platform. No experience needed.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {features.map((f, i) => (
            <div key={i} className="card"
              style={{ cursor: 'pointer', animation: `fadeInUp 0.6s ease ${i * 0.1}s both`, transition: 'all 0.3s ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = f.color + '55' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--card-border)' }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: f.color + '20', border: `1px solid ${f.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, marginBottom: '1rem', color: f.color,
              }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 8, color: 'var(--text)' }}>{f.title}</h3>
              <p style={{ color: 'var(--text2)', lineHeight: 1.6, fontSize: 15 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="landing-content" style={{ padding: '4rem 2rem 8rem', textAlign: 'center' }}>
        <div style={{
          maxWidth: 700, margin: '0 auto',
          background: 'linear-gradient(135deg, rgba(79,142,247,0.1), rgba(124,58,237,0.1))',
          border: '1px solid rgba(79,142,247,0.2)',
          borderRadius: 32, padding: '4rem 3rem',
          position: 'relative', overflow: 'hidden',
        }}>
          <div className="orb" style={{ width: 300, height: 300, background: '#4f8ef7', top: -100, left: -100, opacity: 0.2 }} />
          <div className="orb" style={{ width: 200, height: 200, background: '#7c3aed', bottom: -80, right: -80, opacity: 0.2 }} />

          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '-0.03em',
            marginBottom: 16, position: 'relative', zIndex: 1,
          }}>
            Ready to get financially smart?
          </h2>
          <p style={{ color: 'var(--text2)', fontSize: 18, marginBottom: '2rem', position: 'relative', zIndex: 1 }}>
            Join thousands of students already investing smarter with FinSight AI.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('dashboard')} style={{
            fontSize: 17, padding: '16px 36px', borderRadius: 14,
            boxShadow: '0 12px 32px rgba(79,142,247,0.4)',
            position: 'relative', zIndex: 1,
          }}>
            Launch Dashboard →
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-content" style={{
        borderTop: '1px solid var(--card-border)',
        padding: '2rem', textAlign: 'center',
        color: 'var(--text3)', fontSize: 14,
        fontFamily: 'var(--font-display)',
      }}>
        © 2025 FinSight AI — Built for students, by students 🎓
      </footer>

    </div>
  )
}