import { useState } from 'react'
import { useApp } from '../context/AppContext'

function ItemPickerSheet({ locationId, onClose }) {
  const { state, dispatch } = useApp()
  const assignedIds = new Set(
    state.locationItems.filter(li => li.locationId === locationId).map(li => li.itemId)
  )
  const available = state.items.filter(i => !assignedIds.has(i.id))

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-header">
          <span className="sheet-title">Add Item to Location</span>
          <button className="sheet-close" onClick={onClose}>&#x2715;</button>
        </div>
        <div className="sheet-body">
          {state.items.length === 0 ? (
            <p className="empty-hint" style={{ padding: '20px' }}>
              No items yet. Create items in the Items tab first.
            </p>
          ) : available.length === 0 ? (
            <p className="empty-hint" style={{ padding: '20px' }}>
              All items are already at this location.
            </p>
          ) : (
            available.map(item => (
              <button
                key={item.id}
                className="sheet-item"
                onClick={() => {
                  dispatch({ type: 'ADD_ITEM_TO_LOCATION', locationId, itemId: item.id })
                  onClose()
                }}
              >
                <span className="sheet-item-name">{item.name}</span>
                {item.unit && <span className="sheet-item-meta">{item.unit}</span>}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function LocationCard({ loc }) {
  const { state, dispatch } = useApp()
  const [expanded, setExpanded] = useState(false)
  const [name, setName] = useState(loc.name)
  const [showPicker, setShowPicker] = useState(false)

  const locItems = state.locationItems
    .filter(li => li.locationId === loc.id)
    .map(li => ({ li, item: state.items.find(i => i.id === li.itemId) }))
    .filter(x => x.item)

  function saveName() {
    const trimmed = name.trim()
    if (trimmed && trimmed !== loc.name) {
      dispatch({ type: 'UPDATE_LOCATION', id: loc.id, name: trimmed })
    } else {
      setName(loc.name)
    }
  }

  function removeLocation() {
    if (window.confirm(`Delete "${loc.name}"? All items tracked here will be removed.`)) {
      dispatch({ type: 'REMOVE_LOCATION', id: loc.id })
    }
  }

  return (
    <div className="manage-loc-card">
      <div className="manage-loc-header">
        <button className="expand-btn" onClick={() => setExpanded(e => !e)}>
          {expanded ? '▼' : '▶'}
        </button>
        <input
          className="loc-name-input"
          value={name}
          onChange={e => setName(e.target.value)}
          onBlur={saveName}
          onKeyDown={e => e.key === 'Enter' && e.target.blur()}
        />
        <button className="btn-icon danger" onClick={removeLocation} title="Delete location">
          &#x2715;
        </button>
      </div>

      {expanded && (
        <div className="manage-loc-body">
          {locItems.map(({ li, item }) => (
            <div key={item.id} className="manage-item-row">
              <div className="manage-item-info">
                <span className="manage-item-name">{item.name}</span>
                {item.unit && <span className="manage-item-unit"> {item.unit}</span>}
              </div>
              <div className="qty-col">
                <span className="qty-label">On Hand</span>
                <input
                  type="number"
                  min="0"
                  value={li.onHand ?? 0}
                  onChange={e =>
                    dispatch({
                      type: 'UPDATE_LOCATION_ITEM',
                      locationId: loc.id,
                      itemId: item.id,
                      updates: { onHand: Number(e.target.value) },
                    })
                  }
                />
              </div>
              <div className="qty-col">
                <span className="qty-label">Req&apos;d</span>
                <input
                  type="number"
                  min="0"
                  value={li.locationRequired ?? 0}
                  onChange={e =>
                    dispatch({
                      type: 'UPDATE_LOCATION_ITEM',
                      locationId: loc.id,
                      itemId: item.id,
                      updates: { locationRequired: Number(e.target.value) },
                    })
                  }
                />
              </div>
              <button
                className="btn-icon danger"
                onClick={() =>
                  dispatch({ type: 'REMOVE_ITEM_FROM_LOCATION', locationId: loc.id, itemId: item.id })
                }
                title="Remove item from location"
              >
                &#x2715;
              </button>
            </div>
          ))}
          <button className="btn-add-item" onClick={() => setShowPicker(true)}>
            + Add Item
          </button>
        </div>
      )}

      {showPicker && (
        <ItemPickerSheet locationId={loc.id} onClose={() => setShowPicker(false)} />
      )}
    </div>
  )
}

function LocationsTab() {
  const { state, dispatch } = useApp()
  const [newName, setNewName] = useState('')

  function addLocation() {
    const trimmed = newName.trim()
    if (!trimmed) return
    dispatch({ type: 'ADD_LOCATION', name: trimmed })
    setNewName('')
  }

  return (
    <div className="view">
      <div className="add-form">
        <div className="add-form-row">
          <input
            placeholder="New location name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addLocation()}
          />
          <button className="btn-primary" onClick={addLocation} disabled={!newName.trim()}>
            Add
          </button>
        </div>
      </div>
      {state.locations.length === 0 && (
        <div className="empty-state">No locations yet.</div>
      )}
      {state.locations.map(loc => (
        <LocationCard key={loc.id} loc={loc} />
      ))}
    </div>
  )
}

function GlobalItemRow({ item }) {
  const { state, dispatch } = useApp()
  const [name, setName] = useState(item.name)
  const [unit, setUnit] = useState(item.unit)
  const [globalRequired, setGlobalRequired] = useState(item.globalRequired)

  const locCount = state.locationItems.filter(li => li.itemId === item.id).length

  function save() {
    dispatch({
      type: 'UPDATE_ITEM',
      id: item.id,
      updates: {
        name: name.trim() || item.name,
        unit: unit.trim(),
        globalRequired: Number(globalRequired) || 0,
      },
    })
  }

  function removeItem() {
    if (window.confirm(`Delete "${item.name}"? It will be removed from all locations.`)) {
      dispatch({ type: 'REMOVE_ITEM', id: item.id })
    }
  }

  return (
    <div className="global-item-row">
      <div className="global-item-fields">
        <div>
          <div className="field-label">Name</div>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={save}
            onKeyDown={e => e.key === 'Enter' && e.target.blur()}
          />
        </div>
        <div>
          <div className="field-label">Unit</div>
          <input
            value={unit}
            onChange={e => setUnit(e.target.value)}
            onBlur={save}
            placeholder="oz, lbs..."
            onKeyDown={e => e.key === 'Enter' && e.target.blur()}
          />
        </div>
        <div>
          <div className="field-label">Global req&apos;d</div>
          <input
            type="number"
            min="0"
            value={globalRequired}
            onChange={e => setGlobalRequired(e.target.value)}
            onBlur={save}
            onKeyDown={e => e.key === 'Enter' && e.target.blur()}
          />
        </div>
      </div>
      <div className="global-item-meta">
        <span className="loc-count">{locCount} loc{locCount !== 1 ? 's' : ''}</span>
        <button className="btn-icon danger" onClick={removeItem} title="Delete item">
          &#x2715;
        </button>
      </div>
    </div>
  )
}

function ItemsTab() {
  const { state, dispatch } = useApp()
  const [name, setName] = useState('')
  const [unit, setUnit] = useState('')
  const [globalRequired, setGlobalRequired] = useState('')

  function addItem() {
    const trimmed = name.trim()
    if (!trimmed) return
    dispatch({ type: 'ADD_ITEM', name: trimmed, unit: unit.trim(), globalRequired })
    setName('')
    setUnit('')
    setGlobalRequired('')
  }

  return (
    <div className="view">
      <div className="add-form">
        <div className="add-form-row">
          <input
            placeholder="Item name"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            style={{ flex: 2 }}
          />
          <input
            placeholder="Unit"
            value={unit}
            onChange={e => setUnit(e.target.value)}
            style={{ flex: 1 }}
          />
          <input
            type="number"
            placeholder="Global req"
            value={globalRequired}
            onChange={e => setGlobalRequired(e.target.value)}
            min="0"
            style={{ flex: 1 }}
          />
        </div>
        <button className="btn-primary" onClick={addItem} disabled={!name.trim()}>
          Add Item
        </button>
      </div>

      {state.items.length === 0 ? (
        <div className="empty-state">No items yet. Add one above.</div>
      ) : (
        state.items.map(item => <GlobalItemRow key={item.id} item={item} />)
      )}
    </div>
  )
}

export default function ManageView() {
  const [subTab, setSubTab] = useState('locations')

  return (
    <div className="view">
      <div className="subtabs">
        <button
          className={subTab === 'locations' ? 'active' : ''}
          onClick={() => setSubTab('locations')}
        >
          Locations
        </button>
        <button
          className={subTab === 'items' ? 'active' : ''}
          onClick={() => setSubTab('items')}
        >
          Items
        </button>
      </div>
      {subTab === 'locations' ? <LocationsTab /> : <ItemsTab />}
    </div>
  )
}
