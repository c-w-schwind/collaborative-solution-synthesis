import {useAuth} from "../context/AuthContext";
import { NavLink, Link } from 'react-router-dom';
import './Header.css';

function Header () {
    const { isLoggedIn, user, logout } = useAuth();

    return (
        <header className="header">
            <div className="logo">
                <NavLink to="/"><img src="PlaceholderLogoCollectiveSynthesis2.jpg" alt="Your Logo"/></NavLink>
            </div>
            <nav className="navigation">
                <NavLink to="/" className={({ isActive }) => isActive ? 'active' : undefined}>Home</NavLink>
                <NavLink to="/section3" className={({ isActive }) => isActive ? 'active' : undefined}>Problem Space</NavLink>
                <NavLink to="/solutions" className={({ isActive }) => isActive ? 'active' : undefined}>Solutions</NavLink>
                <NavLink to="/discussionSpace" className={({ isActive }) => isActive ? 'active' : undefined}>Discussion Space</NavLink>
                <NavLink to="/section5" className={({ isActive }) => isActive ? 'active' : undefined}>Considerations</NavLink>
            </nav>
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