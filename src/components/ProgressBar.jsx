export default function ProgressBar({ percentual }) {
  const pct = Math.max(0, Math.min(1, percentual))
  let cls = 'ok'
  if (percentual > 1) cls = 'over'
  else if (percentual >= 0.8) cls = 'warn'

  return (
    <div className="progress-track">
      <div className={`progress-fill ${cls}`} style={{ width: `${pct * 100}%` }} />
    </div>
  )
}
