import { useState } from 'react'

const API = '/api'

const initial = {
  name: '',
  age: '',
  monthly_savings: '',
  income: '',
  loss_reaction: 2,
  goal: 'Long-term wealth',
  horizon: '5+ years',
  experience: 'Beginner',
}

export default function Onboarding({ onComplete, token }) {
  const [form, setForm] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) return setError('Please enter your name.')
    if (!form.age || !form.monthly_savings || !form.income) return setError('Please fill all required numeric fields.')

    const payload = {
      age: Number(form.age),
      monthly_savings: Number(form.monthly_savings),
      income: Number(form.income),
      loss_reaction: Number(form.loss_reaction),
      goal: form.goal,
      horizon: form.horizon,
      experience: form.experience,
    }

    setLoading(true)
    try {
      const riskRes = await fetch(`${API}/user/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      const riskData = await riskRes.json()
      if (!riskRes.ok) throw new Error(riskData.detail || 'Failed to save profile')

      await fetch(`${API}/user/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: form.goal,
          target_amount: Number(form.monthly_savings) * 60,
          target_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 5).toISOString().slice(0, 10),
          monthly_contribution: Number(form.monthly_savings),
        }),
      })

      onComplete()
    } catch (err) {
      setError(`Could not create your profile: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '3rem 2rem' }}>
      <div className="card page-enter">
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, marginBottom: 6 }}>New User Setup</h1>
        <p style={{ color: 'var(--text2)', marginBottom: '1.5rem' }}>
          Answer a few questions and we will build your personal investment dashboard.
        </p>

        <form onSubmit={submit} style={{ display: 'grid', gap: '1rem' }}>
          <label>
            <p style={{ marginBottom: 6, fontSize: 14, color: 'var(--text2)' }}>What should we call you?</p>
            <input className="input" value={form.name} onChange={e => setField('name', e.target.value)} placeholder="Your name" />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <label>
              <p style={{ marginBottom: 6, fontSize: 14, color: 'var(--text2)' }}>Age</p>
              <input className="input" type="number" min="16" value={form.age} onChange={e => setField('age', e.target.value)} />
            </label>
            <label>
              <p style={{ marginBottom: 6, fontSize: 14, color: 'var(--text2)' }}>Monthly savings (INR)</p>
              <input className="input" type="number" min="0" value={form.monthly_savings} onChange={e => setField('monthly_savings', e.target.value)} />
            </label>
            <label>
              <p style={{ marginBottom: 6, fontSize: 14, color: 'var(--text2)' }}>Monthly income (INR)</p>
              <input className="input" type="number" min="0" value={form.income} onChange={e => setField('income', e.target.value)} />
            </label>
          </div>

          <label>
            <p style={{ marginBottom: 6, fontSize: 14, color: 'var(--text2)' }}>If your portfolio falls 20%, what do you do?</p>
            <select className="input" value={form.loss_reaction} onChange={e => setField('loss_reaction', e.target.value)}>
              <option value={1}>Sell immediately</option>
              <option value={2}>Wait and watch</option>
              <option value={3}>Invest more</option>
            </select>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <label>
              <p style={{ marginBottom: 6, fontSize: 14, color: 'var(--text2)' }}>Main goal</p>
              <select className="input" value={form.goal} onChange={e => setField('goal', e.target.value)}>
                <option>Long-term wealth</option>
                <option>Short-term gains</option>
                <option>Emergency safety</option>
              </select>
            </label>
            <label>
              <p style={{ marginBottom: 6, fontSize: 14, color: 'var(--text2)' }}>Investment horizon</p>
              <select className="input" value={form.horizon} onChange={e => setField('horizon', e.target.value)}>
                <option>&lt; 1 year</option>
                <option>1-3 years</option>
                <option>5+ years</option>
              </select>
            </label>
            <label>
              <p style={{ marginBottom: 6, fontSize: 14, color: 'var(--text2)' }}>Experience level</p>
              <select className="input" value={form.experience} onChange={e => setField('experience', e.target.value)}>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </label>
          </div>

          {error && <p style={{ color: 'var(--danger)', margin: 0 }}>{error}</p>}

          <button className="btn btn-primary" disabled={loading} style={{ justifyContent: 'center', marginTop: 6, opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Creating your dashboard...' : 'Create My Portfolio'}
          </button>
        </form>
      </div>
    </div>
  )
}

