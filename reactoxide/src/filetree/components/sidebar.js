import React from 'react'

function Sidebar(props) {
  return (
    <aside
      {...props}
      style={{
        display: 'block',
        height: '100vh',
        paddingTop: 3
      }}
    />
  )
}

export default Sidebar
