import { useState } from 'react'
import { useApp } from '../context/AppContext'
import Stepper from '../components/Stepper'

export default function InventoryView() {
  const { state, dispatch } = useApp()
  const [collapsed, setCollapsed] = useState({})

  const toggle = id => setCollapsed(c => ({ ...c, [id]: !c[id] }))

  function hasShortfallForLI(item, li) {
    return (Number(li.onHand) || 0) < (Number(li.locationRequired) || 0)
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
                              <Stepper
                                value={li.onHand ?? 0}
                                compact
                                onChange={v =>
                                  dispatch({
                                    type: 'UPDATE_LOCATION_ITEM',
                                    locationId: loc.id,
                                    itemId: item.id,
                                    updates: { onHand: v },
                                  })
                                }
                              />
                            </td>
                            <td className="col-qty">
                              <Stepper
                                value={li.locationRequired ?? 0}
                                compact
                                onChange={v =>
                                  dispatch({
                                    type: 'UPDATE_LOCATION_ITEM',
                                    locationId: loc.id,
                                    itemId: item.id,
                                    updates: { locationRequired: v },
                                  })
                                }
                              />
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
