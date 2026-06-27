import { useState } from 'react'
import { useApp } from '../context/AppContext'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function PurchaseEntry({ entry, itemId }) {
  const { dispatch } = useApp()
  return (
    <div className="ph-entry">
      <div className="ph-entry-main">
        <span className="ph-store">{entry.store}</span>
        {entry.price !== '' && entry.price !== undefined && (
          <span className="ph-price"> &middot; ${Number(entry.price).toFixed(2)}</span>
        )}
        {entry.date && <span className="ph-date"> &middot; {formatDate(entry.date)}</span>}
        {entry.note && <div className="ph-note">{entry.note}</div>}
      </div>
      <button
        className="btn-icon"
        onClick={() => dispatch({ type: 'REMOVE_PURCHASE_ENTRY', itemId, entryId: entry.id })}
        title="Remove entry"
      >
        &#x2715;
      </button>
    </div>
  )
}

function PriceCard({ item }) {
  const { dispatch } = useApp()
  const [expanded, setExpanded] = useState(false)
  const [adding, setAdding] = useState(false)
  const [store, setStore] = useState('')
  const [price, setPrice] = useState('')
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')

  const history = item.purchaseHistory || []

  function submitEntry() {
    if (!store.trim() && !price) return
    dispatch({
      type: 'ADD_PURCHASE_ENTRY',
      itemId: item.id,
      entry: {
        store: store.trim(),
        price: price !== '' ? Number(price) : '',
        date,
        note: note.trim(),
      },
    })
    setStore('')
    setPrice('')
    setDate('')
    setNote('')
    setAdding(false)
  }

  return (
    <div className="shopping-card">
      <button className="shopping-card-header" onClick={() => setExpanded(e => !e)}>
        <div className="shopping-card-main">
          <span className="shopping-item-name">{item.name}</span>
          {item.unit && (
            <div className="shopping-item-qty" style={{ color: 'var(--text-secondary)' }}>
              {item.unit}
            </div>
          )}
        </div>
        <span className="ph-count">
          {history.length > 0
            ? `${history.length} price${history.length !== 1 ? 's' : ''}`
            : 'No prices'}
        </span>
        <span className="chevron">{expanded ? '▼' : '▶'}</span>
      </button>

      {expanded && (
        <div className="ph-section">
          <div className="ph-title">Purchase History</div>
          {history.length === 0 ? (
            <p className="empty-hint">No purchase records yet.</p>
          ) : (
            history.map(entry => (
              <PurchaseEntry key={entry.id} entry={entry} itemId={item.id} />
            ))
          )}

          {adding ? (
            <div className="add-ph-form">
              <div className="add-ph-row">
                <input
                  placeholder="Store (e.g. Costco)"
                  value={store}
                  onChange={e => setStore(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Price"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  style={{ flex: '0 0 88px' }}
                />
              </div>
              <div className="add-ph-row">
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  style={{ flex: '0 0 150px' }}
                />
                <input
                  placeholder="Note (optional)"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />
              </div>
              <div className="add-ph-row">
                <button
                  className="btn-primary btn-sm"
                  onClick={submitEntry}
                  disabled={!store.trim() && !price}
                >
                  Save
                </button>
                <button className="btn-ghost btn-sm" onClick={() => setAdding(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button className="btn-add-ph" onClick={() => setAdding(true)}>
              + Add Price Record
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function PricesView() {
  const { state } = useApp()
  const [sortMode, setSortMode] = useState('alpha')

  const items = state.items || []
  const sections = state.storeSections || []

  if (items.length === 0) {
    return (
      <div className="shopping-empty">
        <h2>No items yet</h2>
        <p>Add items in the Manage tab to track prices.</p>
      </div>
    )
  }

  let content
  if (sortMode === 'alpha') {
    const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name))
    content = sorted.map(item => <PriceCard key={item.id} item={item} />)
  } else {
    const grouped = sections
      .map(section => ({
        section,
        items: items.filter(item => item.storeSectionId === section.id),
      }))
      .filter(g => g.items.length > 0)
    const untagged = items.filter(
      item => !item.storeSectionId || !sections.some(s => s.id === item.storeSectionId)
    )
    content = (
      <>
        {grouped.map(group => (
          <div key={group.section.id} className="shopping-section">
            <div className="shopping-section-header">{group.section.name}</div>
            {group.items.map(item => <PriceCard key={item.id} item={item} />)}
          </div>
        ))}
        {untagged.length > 0 && (
          <div className="shopping-section">
            <div className="shopping-section-header">Untagged</div>
            {untagged.map(item => <PriceCard key={item.id} item={item} />)}
          </div>
        )}
      </>
    )
  }

  return (
    <div className="view">
      <div className="prices-toolbar">
        <span className="section-count">
          {items.length} item{items.length !== 1 ? 's' : ''}
        </span>
        <div className="sort-toggle">
          <button
            className={sortMode === 'alpha' ? 'active' : ''}
            onClick={() => setSortMode('alpha')}
          >
            A–Z
          </button>
          <button
            className={sortMode === 'section' ? 'active' : ''}
            onClick={() => setSortMode('section')}
          >
            By Section
          </button>
        </div>
      </div>
      {content}
    </div>
  )
}
