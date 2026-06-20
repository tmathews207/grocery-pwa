import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function InventoryView() {
  const { state, dispatch } = useApp()
  const [collapsed, setCollapsed] = useState({})

  const toggle = id => setCollapsed(c => ({ ...c, [id]: !c[id] }))

  function hasShortfallForLI(item, li) {
    const allLIs = state.locationItems.filter(x => x.itemId === item.id)
    const total = allLIs.reduce((s, x) => s + (Number(x.onHand) || 0), 0)
    return (
      total < (Number(item.globalRequired) || 0) ||
      (Number(li.onHand) || 0) < (Number(li.locationRequired) || 0)
    )
  }

  if (state.locations.length === 0) {
    return <div className="empty-state">No locations yet. Add some in Manage.</div>
  }

  return (
    <div className="view">
      {state.locations.map(loc => {
        const locItems = state.locationItems
          .filter(li => li.locationId === loc.id)
          .map(li => ({ li, item: state.items.find(i => i.id === li.itemId) }))
          .filter(x => x.item)

        const hasShortfall = locItems.some(({ li, item }) => hasShortfallForLI(item, li))

        return (
          <div key={loc.id} className={`location-card${hasShortfall ? ' has-shortfall' : ''}`}>
            <button className="location-header" onClick={() => toggle(loc.id)}>
              <span className="location-name">{loc.name}</span>
              <span className="location-meta">
                {locItems.length} item{locItems.length !== 1 ? 's' : ''}
                {hasShortfall && <span className="shortfall-dot" />}
              </span>
              <span className="chevron">{collapsed[loc.id] ? '▶' : '▼'}</span>
            </button>

            {!collapsed[loc.id] && (
              <div className="location-body">
                {locItems.length === 0 ? (
                  <p className="empty-hint">No items tracked here. Add in Manage.</p>
                ) : (
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th className="col-qty">On Hand</th>
                        <th className="col-qty">Req&apos;d</th>
                      </tr>
                    </thead>
                    <tbody>
                      {locItems.map(({ li, item }) => {
                        const low = (Number(li.onHand) || 0) < (Number(li.locationRequired) || 0)
                        return (
                          <tr key={item.id} className={low ? 'row-low' : ''}>
                            <td>
                              <span className="item-name">{item.name}</span>
                              {item.unit && <span className="item-unit"> {item.unit}</span>}
                            </td>
                            <td className="col-qty">
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={li.onHand ?? 0}
                                onChange={e =>
                                  dispatch({
                                    type: 'UPDATE_LOCATION_ITEM',
                                    locationId: loc.id,
                                    itemId: item.id,
                                    updates: { onHand: Number(e.target.value) },
                                  })
                                }
                                className="qty-input"
                              />
                            </td>
                            <td className="col-qty req-val">
                              {li.locationRequired || 0}
                              {item.globalRequired > 0 && (
                                <span className="global-req" title={`Global required: ${item.globalRequired}`}>
                                  /{item.globalRequired}
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
