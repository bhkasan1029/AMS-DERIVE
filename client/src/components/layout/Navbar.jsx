import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <img
        className="navbar__logo"
        src="/ams-logo.jpeg"
        alt="AMS Logo"
      />
      <button className="navbar__notify">Notify Me</button>
    </nav>
  );
}

export default Navbar;
