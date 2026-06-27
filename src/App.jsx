import { useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import InventoryView from './views/InventoryView'
import ManageView from './views/ManageView'
import ShoppingListView from './views/ShoppingListView'
import PricesView from './views/PricesView'

function IconList() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
    </svg>
  )
}

function IconSettings() {
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

function IconTag() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
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
          <IconList />
          <span>Inventory</span>
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={activeTab === 'manage' ? 'active' : ''}
        >
          <IconSettings />
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
          <IconTag />
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
