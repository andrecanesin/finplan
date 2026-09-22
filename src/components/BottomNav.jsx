const ITEMS = [
  { id: 'lancar', label: 'Lançar', icon: '＋' },
  { id: 'painel', label: 'Painel', icon: '▤' },
  { id: 'fixas', label: 'Fixas', icon: '☰' },
]

export default function BottomNav({ screen, onChange }) {
  return (
    <nav className="bottom-nav">
      {ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          className={screen === item.id ? 'active' : ''}
          onClick={() => onChange(item.id)}
        >
          <span aria-hidden="true">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  )
}
