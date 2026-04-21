import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function analyzeFood({ food, goal, health_condition, habit }) {
  const response = await axios.post(`${API_BASE}/analyze`, {
    food,
    goal,
    health_condition,
    habit,
  })
  return response.data
}
