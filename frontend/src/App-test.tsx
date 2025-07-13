import React from 'react'

function App() {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f0f0', 
      minHeight: '100vh',
      color: '#333',
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#2196F3' }}>🧪 Test App läuft!</h1>
      <p>Wenn Sie das sehen, funktioniert React perfekt!</p>
      <div style={{ marginTop: '20px', padding: '10px', border: '2px solid #4CAF50', borderRadius: '5px' }}>
        <p>✅ Vite Dev Server aktiv</p>
        <p>✅ React Components werden gerendert</p>
        <p>✅ TypeScript wird kompiliert</p>
      </div>
      <button 
        style={{ 
          marginTop: '10px', 
          padding: '10px 20px', 
          backgroundColor: '#4CAF50', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer'
        }}
        onClick={() => alert('Button funktioniert!')}
      >
        Test Button
      </button>
    </div>
  )
}

export default App
