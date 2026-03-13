import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header__container">
        <Link to="/" className="header__logo">
          AMS Derive
        </Link>
        <nav className="header__nav">
          <Link to="/register" className="header__link">
            Register
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
