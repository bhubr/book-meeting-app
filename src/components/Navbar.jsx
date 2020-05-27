import React from 'react';

function Navbar({ onLogout }) {
  return (
    <nav className="navbar" role="navigation" aria-label="main navigation">
    <div className="navbar-brand">
      <a className="navbar-item" href="#">
        <img src="https://upload.wikimedia.org/wikipedia/commons/3/3b/Calendar-Logo-256x256.png" />
      </a>
    </div>

  <div id="navbarBasicExample" className="navbar-menu">
    <div className="navbar-end">
      <div className="navbar-item">
        <div className="buttons">
          <a onClick={onLogout} className="button is-light">
            Déconnexion
          </a>
        </div>
      </div>
    </div>
  </div>
</nav>
  )
}

export default Navbar;