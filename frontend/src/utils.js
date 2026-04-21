/**
 * Returns a greeting label and emoji based on hour of day.
 */
export function getTimeContext() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) {
    return { label: 'Morning', emoji: '🌅', period: 'morning' }
  } else if (hour >= 12 && hour < 17) {
    return { label: 'Afternoon', emoji: '☀️', period: 'afternoon' }
  } else {
    return { label: 'Evening', emoji: '🌙', period: 'evening' }
  }
}

/**
 * Maps health_score 1-10 to a descriptive label.
 */
export function scoreLabel(score) {
  if (score <= 3) return 'Low – Avoid'
  if (score <= 5) return 'Fair – Caution'
  if (score <= 7) return 'Good – Moderate'
  return 'Excellent – Go for it'
}

/**
 * Returns a progress color for the score ring.
 * Red → Yellow → Green using CSS custom props.
 */
export function scoreColor(score) {
  if (score <= 3) return '#f87171'
  if (score <= 6) return '#f5c842'
  return '#2CDEA9'
}

/**
 * Returns an emoji for the decision.
 */
export function decisionEmoji(decision) {
  const map = { eat: '✅', reduce: '⚠️', replace: '🔄' }
  return map[decision] ?? '❓'
}

/**
 * Returns an emoji for confidence level.
 */
export function confidenceEmoji(confidence) {
  const map = { low: '🤔', medium: '👍', high: '💡' }
  return map[confidence] ?? '•'
}
