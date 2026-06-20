export default function Stepper({ value, onChange, min = 0, compact = false }) {
  const n = Number(value) || 0
  return (
    <div className={`stepper${compact ? ' stepper-compact' : ''}`}>
      <button
        className="stepper-btn"
        onClick={() => onChange(Math.max(min, n - 1))}
        aria-label="decrease"
      >
        −
      </button>
      <span className="stepper-val">{n}</span>
      <button
        className="stepper-btn"
        onClick={() => onChange(n + 1)}
        aria-label="increase"
      >
        +
      </button>
    </div>
  )
}
