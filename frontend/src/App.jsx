import { useState } from 'react'
import { analyzeFood } from './api'
import { getTimeContext } from './utils'
import ResultCard from './components/ResultCard'
import AnalyzeButton from './components/AnalyzeButton'

const INITIAL_FORM = {
  goal: 'weight loss',
  health_condition: 'none',
  habit: '',
  food: '',
}

export default function App() {
  const [form, setForm] = useState(INITIAL_FORM)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const timeCtx = getTimeContext()

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (error) setError(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    // Client-side validation
    if (!form.food.trim()) return setError('Please describe the food you want to analyze.')
    if (!form.habit.trim()) return setError('Please describe your eating habit.')

    setLoading(true)
    setResult(null)

    try {
      const data = await analyzeFood({
        food: form.food.trim(),
        goal: form.goal,
        health_condition: form.health_condition,
        habit: form.habit.trim(),
      })
      setResult(data)
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        'Something went wrong. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const isFormReady = form.food.trim() && form.habit.trim()

  return (
    <div className="app-wrapper">
      <main className="main-card" role="main">

        {/* ── Header ── */}
        <header className="app-header">
          <div className="logo-row">
            <div className="logo-icon" aria-hidden="true">🥗</div>
            <h1 className="app-title">NutriWise AI</h1>
          </div>
          <p className="app-subtitle">Context-aware food decision engine powered by Google Gemini</p>
          <div className="time-badge" aria-label={`Current time period: ${timeCtx.label}`}>
            <span aria-hidden="true">{timeCtx.emoji}</span>
            <span>{timeCtx.label} — decisions tailored to right now</span>
          </div>
        </header>

        {/* ── Form ── */}
        <form className="form-section" onSubmit={handleSubmit} noValidate>

          {/* Goal + Health Condition */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="goal">Your Goal</label>
              <select
                id="goal"
                name="goal"
                className="form-select"
                value={form.goal}
                onChange={handleChange}
              >
                <option value="weight loss">⬇️ Weight Loss</option>
                <option value="muscle gain">💪 Muscle Gain</option>
                <option value="maintenance">⚖️ Maintenance</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="health_condition">Health Condition</label>
              <select
                id="health_condition"
                name="health_condition"
                className="form-select"
                value={form.health_condition}
                onChange={handleChange}
              >
                <option value="none">✅ None</option>
                <option value="diabetes">🩺 Diabetes</option>
              </select>
            </div>
          </div>

          {/* Habit */}
          <div className="form-group">
            <label className="form-label" htmlFor="habit">Your Eating Habit</label>
            <input
              id="habit"
              name="habit"
              type="text"
              className="form-input"
              placeholder="e.g. I overeat at night, skip breakfast, snack when stressed…"
              value={form.habit}
              onChange={handleChange}
              maxLength={200}
              autoComplete="off"
            />
          </div>

          <div className="divider" role="separator" />

          {/* Food Input */}
          <div className="form-group">
            <label className="form-label" htmlFor="food">What are you about to eat?</label>
            <div className="food-input-wrapper">
              <input
                id="food"
                name="food"
                type="text"
                className="form-input"
                placeholder="e.g. 2 slices of pepperoni pizza, bowl of white rice…"
                value={form.food}
                onChange={handleChange}
                maxLength={300}
                autoComplete="off"
              />
              <span className="food-icon" aria-hidden="true">🍴</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="error-banner" role="alert" aria-live="assertive">
              <span aria-hidden="true">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <AnalyzeButton loading={loading} disabled={!isFormReady} />
        </form>

        {/* ── Result ── */}
        {result && <ResultCard result={result} />}

      </main>
    </div>
  )
}
