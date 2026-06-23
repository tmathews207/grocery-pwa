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

function ShoppingCard({ item, shortfall }) {
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
          <div className="shopping-item-qty">
            Need <strong>{shortfall}</strong>
            {item.unit && <span className="shopping-item-unit"> {item.unit}</span>}
          </div>
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

export default function ShoppingListView() {
  const { state, getShoppingList } = useApp()
  const list = getShoppingList()

  const sections = state.storeSections || []
  const groupedSections = sections
    .map(section => ({
      section,
      items: list.filter(entry => entry.item.storeSectionId === section.id),
    }))
    .filter(group => group.items.length > 0)

  const untagged = list.filter(
    entry => !entry.item.storeSectionId || !sections.some(s => s.id === entry.item.storeSectionId)
  )

  if (list.length === 0) {
    return (
      <div className="shopping-empty">
        <div className="check-icon">&#x2713;</div>
        <h2>All stocked up!</h2>
        <p>No items below their required quantities.</p>
      </div>
    )
  }

  return (
    <div className="view">
      <p className="section-count">
        {list.length} item{list.length !== 1 ? 's' : ''} needed
      </p>
      {groupedSections.map(group => (
        <div key={group.section.id} className="shopping-section">
          <div className="shopping-section-header">{group.section.name}</div>
          {group.items.map(({ item, shortfall }) => (
            <ShoppingCard key={item.id} item={item} shortfall={shortfall} />
          ))}
        </div>
      ))}
      {untagged.length > 0 && (
        <div className="shopping-section">
          <div className="shopping-section-header">Untagged</div>
          {untagged.map(({ item, shortfall }) => (
            <ShoppingCard key={item.id} item={item} shortfall={shortfall} />
          ))}
        </div>
      )}
    </div>
  )
}
