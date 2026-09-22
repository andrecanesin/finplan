import { STATUS_LABEL } from '../lib/calculations.js'

export default function StatusBadge({ status }) {
  return <span className={`badge ${status}`}>{STATUS_LABEL[status]}</span>
}
