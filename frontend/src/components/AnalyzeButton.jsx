import { motion } from 'framer-motion'

export default function AnalyzeButton({ loading, disabled }) {
  return (
    <motion.button
      id="analyze-btn"
      type="submit"
      className="btn-analyze"
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      {loading ? (
        <>
          <span className="spinner" />
          Analyzing...
        </>
      ) : (
        <>
          <span>⚡</span>
          Analyze My Food
        </>
      )}
    </motion.button>
  )
}
