import { useState, useEffect } from 'react'
// Use Vite dev-server proxy (/api -> http://localhost:8000)
const API = '/api'

const fallbackQuiz = [
  { question: 'What is a mutual fund?', options: ['A single stock investment', 'A pool of investor money managed professionally', 'A type of government bond', 'A savings account'], correct: 1, explanation: 'A mutual fund pools money from multiple investors and invests in a diversified portfolio managed by professionals.' },
  { question: 'What does SIP stand for in investing?', options: ['Stock Investment Plan', 'Systematic Investment Plan', 'Secure Investment Portfolio', 'Simple Index Purchase'], correct: 1, explanation: 'SIP (Systematic Investment Plan) lets you invest a fixed amount at regular intervals, helping build wealth through rupee cost averaging.' },
  { question: 'What is the P/E ratio used for?', options: ['Measuring company debt', 'Valuing a stock relative to earnings', 'Calculating dividend yield', 'Tracking revenue growth'], correct: 1, explanation: 'The Price-to-Earnings ratio compares stock price to earnings per share, helping assess if a stock is over or undervalued.' },
  { question: 'What is an index fund?', options: ['A fund managed by an expert to beat the market', 'A fund that tracks a market index like Nifty 50', 'A fund that only invests in bonds', 'A fund for high-net-worth individuals'], correct: 1, explanation: 'An index fund passively tracks a market index like Nifty 50, offering broad market exposure at very low fees.' },
  { question: 'Which is generally considered lower risk?', options: ['Individual stocks', 'Cryptocurrency', 'Diversified mutual fund', 'Penny stocks'], correct: 2, explanation: 'Diversified mutual funds spread risk across many assets, making them generally safer than individual stocks or crypto.' },
]

export default function Quiz() {
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/quiz`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic: 'finance basics' }) })
      .then(r => r.json()).then(d => setQuestions(d.questions?.length ? d.questions : fallbackQuiz))
      .catch(() => setQuestions(fallbackQuiz)).finally(() => setLoading(false))
  }, [])

  const q = questions[current]

  const handleSelect = (idx) => {
    if (selected !== null) return
    setSelected(idx)
    if (idx === q.correct) setScore(s => s + 1)
  }

  const next = () => {
    if (current + 1 >= questions.length) setDone(true)
    else { setCurrent(c => c + 1); setSelected(null) }
  }

  const restart = () => { setCurrent(0); setSelected(null); setScore(0); setDone(false) }

  if (loading) return <div style={{ maxWidth: 700, margin: '4rem auto', textAlign: 'center' }}><div className="loading-dots"><span/><span/><span/></div></div>

  if (done) return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem' }}>
      <div className="card page-enter" style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: 64, marginBottom: '1rem' }}>{score >= questions.length * 0.8 ? '🏆' : score >= questions.length * 0.5 ? '🎯' : '📚'}</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, letterSpacing: '-0.02em', marginBottom: 8 }}>{score} / {questions.length}</h2>
        <p style={{ color: 'var(--text2)', marginBottom: '2rem' }}>{score >= questions.length * 0.8 ? "Excellent! You're a finance whiz! 🌟" : score >= questions.length * 0.5 ? 'Good job! Keep learning!' : "Keep practicing — you'll get there!"}</p>
        <div style={{ display: 'flex', justifyContent: 'space-around', margin: '1.5rem 0', padding: '1rem', background: 'rgba(255,255,255,0.04)', borderRadius: 14 }}>
          <div><p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: 'var(--success)', margin: 0 }}>{score}</p><p style={{ fontSize: 13, color: 'var(--text3)', margin: 0 }}>Correct</p></div>
          <div><p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: 'var(--danger)', margin: 0 }}>{questions.length - score}</p><p style={{ fontSize: 13, color: 'var(--text3)', margin: 0 }}>Wrong</p></div>
          <div><p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: 'var(--accent)', margin: 0 }}>{Math.round((score / questions.length) * 100)}%</p><p style={{ fontSize: 13, color: 'var(--text3)', margin: 0 }}>Score</p></div>
        </div>
        <button className="btn btn-primary" onClick={restart}>Try Again →</button>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem' }}>
      <div className="page-enter" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, letterSpacing: '-0.02em', marginBottom: 4 }}>Finance Quiz</h1>
        <p style={{ color: 'var(--text2)' }}>Test your financial knowledge 🧠</p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 14, color: 'var(--text2)' }}>Question {current + 1} of {questions.length}</span>
          <span style={{ fontSize: 14, color: 'var(--accent)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>Score: {score}</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, height: 6, overflow: 'hidden' }}>
          <div style={{ width: `${(current / questions.length) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #4f8ef7, #7c3aed)', borderRadius: 10, transition: 'width 0.5s ease' }} />
        </div>
      </div>

      <div className="card page-enter" style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, lineHeight: 1.4 }}>{q.question}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {q.options.map((opt, i) => {
          let bg = 'var(--card)', border = 'var(--card-border)', color = 'var(--text)'
          if (selected !== null) {
            if (i === q.correct) { bg = 'rgba(6,214,160,0.1)'; border = 'rgba(6,214,160,0.4)'; color = 'var(--success)' }
            else if (i === selected) { bg = 'rgba(244,63,94,0.1)'; border = 'rgba(244,63,94,0.4)'; color = 'var(--danger)' }
          }
          return (
            <button key={i} onClick={() => handleSelect(i)} style={{ padding: '16px 20px', borderRadius: 14, border: `1px solid ${border}`, background: bg, color, cursor: selected !== null ? 'default' : 'pointer', textAlign: 'left', fontSize: 15, transition: 'all 0.25s ease', display: 'flex', alignItems: 'center', gap: 12, animation: `fadeInUp 0.4s ease ${i * 0.08}s both` }}
              onMouseEnter={e => { if (selected === null) { e.currentTarget.style.borderColor = 'rgba(79,142,247,0.4)'; e.currentTarget.style.background = 'rgba(79,142,247,0.08)' }}}
              onMouseLeave={e => { if (selected === null) { e.currentTarget.style.borderColor = 'var(--card-border)'; e.currentTarget.style.background = 'var(--card)' }}}
            >
              <div style={{ width: 28, height: 28, borderRadius: '50%', border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontFamily: 'var(--font-display)', fontWeight: 700, flexShrink: 0 }}>{String.fromCharCode(65 + i)}</div>
              {opt}
            </button>
          )
        })}
      </div>

      {selected !== null && (
        <>
          <div className="card" style={{ marginBottom: '1.5rem', background: 'rgba(79,142,247,0.06)', borderColor: 'rgba(79,142,247,0.2)', animation: 'fadeInUp 0.4s ease both' }}>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, margin: 0 }}><strong style={{ color: 'var(--accent)' }}>💡 Explanation: </strong>{q.explanation}</p>
          </div>
          <button className="btn btn-primary" onClick={next} style={{ width: '100%', justifyContent: 'center', animation: 'fadeInUp 0.3s ease both' }}>
            {current + 1 >= questions.length ? 'See Results 🏆' : 'Next Question →'}
          </button>
        </>
      )}
    </div>
  )
}