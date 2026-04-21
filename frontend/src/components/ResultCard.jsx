import { motion } from 'framer-motion'
import { scoreColor, scoreLabel, decisionEmoji, confidenceEmoji } from '../utils'

// SVG ring radius and circumference constants
const RADIUS = 28
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function ScoreRing({ score }) {
  const color = scoreColor(score)
  const progress = score / 10
  const dashOffset = CIRCUMFERENCE * (1 - progress)

  return (
    <div className="score-ring-container">
      <svg className="score-ring-svg" viewBox="0 0 72 72">
        <circle className="score-ring-bg" cx="36" cy="36" r={RADIUS} />
        <circle
          className="score-ring-fill"
          cx="36"
          cy="36"
          r={RADIUS}
          stroke={color}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <div className="score-number">{score}</div>
    </div>
  )
}

export default function ResultCard({ result }) {
  const { food_analysis, health_score, decision, better_alternative,
    habit_suggestion, reasoning, confidence, time_of_day } = result

  const timeLabel = time_of_day
    ? time_of_day.charAt(0).toUpperCase() + time_of_day.slice(1)
    : 'Now'

  return (
    <motion.div
      className="result-card"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <div className="result-header">
        <div className="result-header-title">
          <span>🍽️</span>
          <span>NutriWise Decision</span>
        </div>
        <span className="time-chip">🕐 {timeLabel}</span>
      </div>

      <div className="result-body">

        {/* Health Score */}
        <div className="score-row">
          <ScoreRing score={health_score} />
          <div className="score-meta">
            <div className="score-label">Health Score</div>
            <div className="score-desc">{scoreLabel(health_score)}</div>
            <div className="score-sub">{food_analysis}</div>
          </div>
        </div>

        {/* Decision + Confidence */}
        <div className="decision-row">
          <span className={`decision-badge ${decision}`}>
            {decisionEmoji(decision)} {decision.toUpperCase()}
          </span>
          <span className="confidence-chip">
            {confidenceEmoji(confidence)} Confidence: {confidence}
          </span>
        </div>

        {/* Reasoning */}
        <div className="info-block">
          <div className="info-block-label">
            <span>🧠</span> Reasoning
          </div>
          <div className="info-block-text primary-left">{reasoning}</div>
        </div>

        {/* Better Alternative */}
        {decision !== 'eat' && better_alternative && better_alternative !== 'None needed' && (
          <div className="info-block">
            <div className="info-block-label">
              <span>💡</span> Better Alternative
            </div>
            <div className="info-block-text accent-left">{better_alternative}</div>
          </div>
        )}

        {/* Habit Suggestion */}
        <div className="info-block">
          <div className="info-block-label">
            <span>🔁</span> Habit Suggestion
          </div>
          <div className="info-block-text accent-left">{habit_suggestion}</div>
        </div>

      </div>
    </motion.div>
  )
}
