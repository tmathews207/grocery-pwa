import { createContext, useContext, useReducer, useEffect, useRef, useState } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

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
  storeSections: [
    { id: 'sec-1', name: 'Produce' },
    { id: 'sec-2', name: 'Dairy' },
    { id: 'sec-3', name: 'Meat' },
    { id: 'sec-4', name: 'Bakery' },
    { id: 'sec-5', name: 'Frozen' },
    { id: 'sec-6', name: 'Canned Goods' },
    { id: 'sec-7', name: 'Beverages' },
    { id: 'sec-8', name: 'Snacks' },
    { id: 'sec-9', name: 'Household' },
    { id: 'sec-10', name: 'Personal Care' },
  ],
  items: [],
  locationItems: [],
}

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return { ...DEFAULT_STATE, ...action.payload }

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

    case 'ADD_STORE_SECTION':
      return {
        ...state,
        storeSections: [...state.storeSections, { id: genId(), name: action.name }],
      }

    case 'REMOVE_STORE_SECTION':
      return {
        ...state,
        storeSections: state.storeSections.filter(s => s.id !== action.id),
        items: state.items.map(i =>
          i.storeSectionId === action.id ? { ...i, storeSectionId: '' } : i
        ),
      }

    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, {
          id: genId(),
          name: action.name,
          unit: action.unit || '',
          storeSectionId: action.storeSectionId || '',
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
const STATE_DOC = doc(db, 'inventory', 'state')

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE)
  const [loading, setLoading] = useState(true)
  const readyToWrite = useRef(false)
  const skipNextWrite = useRef(false)

  // Listen for changes from Firestore (real-time sync across devices)
  useEffect(() => {
    const unsub = onSnapshot(
      STATE_DOC,
      snap => {
        if (snap.exists()) {
          skipNextWrite.current = true
          dispatch({ type: 'HYDRATE', payload: snap.data() })
        }
        readyToWrite.current = true
        setLoading(false)
      },
      err => {
        console.error('Firestore sync error:', err)
        readyToWrite.current = true
        setLoading(false)
      }
    )
    return unsub
  }, [])

  // Save local changes to Firestore (debounced 800ms, skips echo from remote updates)
  useEffect(() => {
    if (!readyToWrite.current) return
    if (skipNextWrite.current) {
      skipNextWrite.current = false
      return
    }
    const t = setTimeout(() => {
      setDoc(STATE_DOC, state).catch(console.error)
    }, 800)
    return () => clearTimeout(t)
  }, [state])

  function getShoppingList() {
    return state.items
      .map(item => {
        const lis = state.locationItems.filter(li => li.itemId === item.id)
        const shortfall = lis.reduce(
          (s, li) => s + Math.max(0, (Number(li.locationRequired) || 0) - (Number(li.onHand) || 0)),
          0
        )
        if (shortfall === 0) return null
        const totalOnHand = lis.reduce((s, li) => s + (Number(li.onHand) || 0), 0)
        return { item, shortfall, totalOnHand }
      })
      .filter(Boolean)
  }

  return (
    <AppContext.Provider value={{ state, dispatch, getShoppingList, loading }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
