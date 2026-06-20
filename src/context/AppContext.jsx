import { createContext, useContext, useReducer, useEffect } from 'react'

const STORAGE_KEY = 'grocery-pwa-v1'

function genId() {
  return crypto.randomUUID()
}

const DEFAULT_STATE = {
  locations: [
    { id: 'loc-1', name: 'Kitchen Fridge' },
    { id: 'loc-2', name: 'Garage Fridge' },
    { id: 'loc-3', name: 'Pantry' },
    { id: 'loc-4', name: 'Master Bathroom Closet' },
    { id: 'loc-5', name: 'Master Shower' },
    { id: 'loc-6', name: 'Guest Bathroom' },
  ],
  items: [],
  locationItems: [],
}

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload

    case 'ADD_LOCATION':
      return { ...state, locations: [...state.locations, { id: genId(), name: action.name }] }

    case 'UPDATE_LOCATION':
      return {
        ...state,
        locations: state.locations.map(l => l.id === action.id ? { ...l, name: action.name } : l),
      }

    case 'REMOVE_LOCATION':
      return {
        ...state,
        locations: state.locations.filter(l => l.id !== action.id),
        locationItems: state.locationItems.filter(li => li.locationId !== action.id),
      }

    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, {
          id: genId(),
          name: action.name,
          unit: action.unit || '',
          globalRequired: Number(action.globalRequired) || 0,
          purchaseHistory: [],
        }],
      }

    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(i => i.id === action.id ? { ...i, ...action.updates } : i),
      }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(i => i.id !== action.id),
        locationItems: state.locationItems.filter(li => li.itemId !== action.id),
      }

    case 'ADD_ITEM_TO_LOCATION': {
      const exists = state.locationItems.some(
        li => li.locationId === action.locationId && li.itemId === action.itemId
      )
      if (exists) return state
      return {
        ...state,
        locationItems: [...state.locationItems, {
          locationId: action.locationId,
          itemId: action.itemId,
          onHand: 0,
          locationRequired: 0,
        }],
      }
    }

    case 'REMOVE_ITEM_FROM_LOCATION':
      return {
        ...state,
        locationItems: state.locationItems.filter(
          li => !(li.locationId === action.locationId && li.itemId === action.itemId)
        ),
      }

    case 'UPDATE_LOCATION_ITEM':
      return {
        ...state,
        locationItems: state.locationItems.map(li =>
          li.locationId === action.locationId && li.itemId === action.itemId
            ? { ...li, ...action.updates }
            : li
        ),
      }

    case 'ADD_PURCHASE_ENTRY':
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.itemId
            ? { ...i, purchaseHistory: [{ id: genId(), ...action.entry }, ...(i.purchaseHistory || [])] }
            : i
        ),
      }

    case 'REMOVE_PURCHASE_ENTRY':
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.itemId
            ? { ...i, purchaseHistory: (i.purchaseHistory || []).filter(p => p.id !== action.entryId) }
            : i
        ),
      }

    default:
      return state
  }
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try { dispatch({ type: 'HYDRATE', payload: JSON.parse(saved) }) } catch {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  function getShoppingList() {
    return state.items
      .map(item => {
        const lis = state.locationItems.filter(li => li.itemId === item.id)
        const totalOnHand = lis.reduce((s, li) => s + (Number(li.onHand) || 0), 0)
        const globalShortfall = Math.max(0, (Number(item.globalRequired) || 0) - totalOnHand)
        const perLocShortfall = lis.reduce(
          (s, li) => s + Math.max(0, (Number(li.locationRequired) || 0) - (Number(li.onHand) || 0)),
          0
        )
        const shortfall = Math.max(globalShortfall, perLocShortfall)
        if (shortfall === 0) return null
        return { item, shortfall, totalOnHand }
      })
      .filter(Boolean)
  }

  return (
    <AppContext.Provider value={{ state, dispatch, getShoppingList }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
