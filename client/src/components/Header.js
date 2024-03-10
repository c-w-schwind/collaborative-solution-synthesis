import {useEffect, useRef, useState} from 'react';
import {useAuth} from "../context/AuthContext";
import { NavLink, Link } from 'react-router-dom';
import './Header.css';


function Header() {
    const { isLoggedIn, user, logout } = useAuth();
    const [isNavVisible, setIsNavVisible] = useState(false);

    const navRef = useRef();
    const navToggleRef = useRef();

    const closeNav = () => setIsNavVisible(false);

    useEffect(() => {
        function handleClickOutside(event) {
            if (navRef.current && navToggleRef.current && !navRef.current.contains(event.target) && !navToggleRef.current.contains(event.target)) {
                setIsNavVisible(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [navRef, navToggleRef]);


    return (
        <header className="header">
            <div className="logo">
                <NavLink to="/"><img src="PlaceholderLogoCollectiveSynthesis.jpg" alt="Your Logo"/></NavLink>
            </div>
            <button ref={navToggleRef} className="nav-toggle" onClick={() => setIsNavVisible(!isNavVisible)}>
                <span>☰</span>
            </button>
            <nav ref={navRef} className={`navigation ${isNavVisible ? 'displayed' : ''}`}>
                <NavLink to="/" onClick={closeNav} className={({isActive}) => isActive ? 'active' : undefined}>Home</NavLink>
                <NavLink to="/section3" onClick={closeNav} className={({isActive}) => isActive ? 'active' : undefined}>Problem Space</NavLink>
                <NavLink to="/solutions" onClick={closeNav} className={({isActive}) => isActive ? 'active' : undefined}>Solutions</NavLink>
                <NavLink to="/discussionSpace" onClick={closeNav} className={({isActive}) => isActive ? 'active' : undefined}>Discussion Space</NavLink>
                <NavLink to="/section5" onClick={closeNav} className={({isActive}) => isActive ? 'active' : undefined}>Considerations</NavLink>
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