import {useState} from 'react';
import {useAuth} from "../context/AuthContext";
import {NavLink, Link} from 'react-router-dom';
import './Header.css';
import useOutsideClick from "../context/useOutsideClickHook";


function Header() {
    const {isLoggedIn, user, logout} = useAuth();
    const [isNavMenuVisible, setIsNavMenuVisible] = useState(false);

    const closeNavMenu = () => setIsNavMenuVisible(false);
    const navMenuRef = useOutsideClick(closeNavMenu);

    return (
        <header className="header">
            <div className="logo">
                <NavLink to="/"><img src="PlaceholderLogoCollectiveSynthesis.jpg" alt="Your Logo"/></NavLink>
            </div>
            <div ref={navMenuRef}>
                <button className="nav-toggle" onClick={() => setIsNavMenuVisible(!isNavMenuVisible)}>
                    <span>☰</span>
                </button>
                <nav className={`navigation ${isNavMenuVisible ? 'displayed' : ''}`}>
                    <NavLink to="/" onClick={closeNavMenu} className={({isActive}) => isActive ? 'active' : undefined}>Home</NavLink>
                    <NavLink to="/section3" onClick={closeNavMenu} className={({isActive}) => isActive ? 'active' : undefined}>Problem Space</NavLink>
                    <NavLink to="/solutions" onClick={closeNavMenu} className={({isActive}) => isActive ? 'active' : undefined}>Solutions</NavLink>
                    <NavLink to="/discussionSpace" onClick={closeNavMenu} className={({isActive}) => isActive ? 'active' : undefined}>Discussion Space</NavLink>
                    <NavLink to="/section5" onClick={closeNavMenu} className={({isActive}) => isActive ? 'active' : undefined}>Considerations</NavLink>
                </nav>
            </div>
            <div className="user-section">
                {isLoggedIn ? (
                    <div>
                        <span>{user ? "Logged in as " + user.username : "Loading..."}</span>
                        <button onClick={logout} className="logout-button">Logout</button>
                    </div>
                ) : (
                    <Link to="/login" className="login-button">Login</Link>
                )}
            </div>
        </header>
    );
}

export default Header;