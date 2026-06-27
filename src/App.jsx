import { useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import InventoryView from './views/InventoryView'
import ManageView from './views/ManageView'
import ShoppingListView from './views/ShoppingListView'
import PricesView from './views/PricesView'

function IconClipboard() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
    </svg>
  )
}

function IconGear() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a7.2 7.2 0 0 0-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.47.47 0 0 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.03-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
    </svg>
  )
}

function IconCart() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zM7.17 14.75l.03-.12.9-1.63H17c.75 0 1.41-.41 1.75-1.03L21.7 6.5A1 1 0 0 0 20.83 5H5.21l-.94-2H1v2h2l3.6 7.59L5.25 15c-.16.28-.25.61-.25.96C5 17.1 6.9 19 9 19h12v-2H9.42c-.14 0-.25-.11-.25-.25z"/>
    </svg>
  )
}

function IconDollar() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16C7.86 5.58 6.3 6.84 6.3 8.77c0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1H6.11c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.49-4.4z"/>
    </svg>
  )
}

function AppContent() {
  const [activeTab, setActiveTab] = useState('inventory')
  const [itemStatuses, setItemStatuses] = useState({})
  const { getShoppingList, loading } = useApp()
  const shoppingCount = getShoppingList().length

  if (loading) {
    return (
      <div className="app">
        <header className="app-header"><h1>Home Inventory</h1></header>
        <main className="app-content loading-screen">
          <div className="loading-spinner" />
          <p>Syncing data&hellip;</p>
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          {activeTab === 'inventory' && 'Inventory'}
          {activeTab === 'manage' && 'Manage'}
          {activeTab === 'shopping' && 'Shopping List'}
          {activeTab === 'prices' && 'Prices'}
        </h1>
      </header>

      <main className="app-content">
        {activeTab === 'inventory' && <InventoryView />}
        {activeTab === 'manage' && <ManageView />}
        {activeTab === 'shopping' && (
          <ShoppingListView
            itemStatuses={itemStatuses}
            setItemStatuses={setItemStatuses}
          />
        )}
        {activeTab === 'prices' && <PricesView />}
      </main>

      <nav className="bottom-nav">
        <button
          onClick={() => setActiveTab('inventory')}
          className={activeTab === 'inventory' ? 'active' : ''}
        >
          <IconClipboard />
          <span>Inventory</span>
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={activeTab === 'manage' ? 'active' : ''}
        >
          <IconGear />
          <span>Manage</span>
        </button>
        <button
          onClick={() => setActiveTab('shopping')}
          className={activeTab === 'shopping' ? 'active' : ''}
        >
          <div className="nav-icon-wrap">
            <IconCart />
            {shoppingCount > 0 && <span className="nav-badge">{shoppingCount}</span>}
          </div>
          <span>Shopping</span>
        </button>
        <button
          onClick={() => setActiveTab('prices')}
          className={activeTab === 'prices' ? 'active' : ''}
        >
          <IconDollar />
          <span>Prices</span>
        </button>
      </nav>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
