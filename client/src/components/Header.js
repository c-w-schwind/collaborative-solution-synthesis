import './Header.css';
import {useState} from 'react';
import {NavLink, Link} from 'react-router-dom';
import {useAuth} from "../context/AuthContext";
import {useToasts} from "../context/ToastContext";
import useOutsideClick from "../context/useOutsideClickHook";


function Header() {
    const {addToast} = useToasts();
    const {isLoggedIn, user, logout} = useAuth();
    const [isNavMenuVisible, setIsNavMenuVisible] = useState(false);
    const [isUserMenuVisible, setIsUserMenuVisible] = useState(false);

    const showWIPMessage = () => addToast("Unfortunately, this section has not been built yet.", 5000)

    const closeNavMenu = () => setIsNavMenuVisible(false);
    const navMenuRef = useOutsideClick(closeNavMenu);

    const closeUserMenu = () => setIsUserMenuVisible(false);
    const userMenuRef = useOutsideClick(closeUserMenu);

    return (
        <header className="header">
            <div className="logo">
                <NavLink to="/"><img src="http://localhost:3000/PlaceholderLogoCollectiveSynthesis.jpg" alt="Your Logo"/></NavLink>
            </div>
            <div ref={navMenuRef}>
                <button className={`nav-menu-toggle${isNavMenuVisible ? ' menu-open' : ''}`} onClick={() => setIsNavMenuVisible(!isNavMenuVisible)}>
                    <span>☰</span>
                </button>
                <nav className={`nav-menu${isNavMenuVisible ? ' displayed' : ''}`}>
                    <NavLink to="/" onClick={closeNavMenu} className={({isActive}) => isActive ? 'active' : undefined}>Home</NavLink>
                    <NavLink to="/section3" onClick={closeNavMenu} className={({isActive}) => isActive ? 'active' : undefined}>Problem Space</NavLink>
                    <NavLink to="/solutions" onClick={closeNavMenu} className={({isActive}) => isActive ? 'active' : undefined}>Solutions</NavLink>
                    <NavLink to="/discussionSpace" onClick={closeNavMenu} className={({isActive}) => isActive ? 'active' : undefined}>Discussion Space</NavLink>
                    <NavLink to="/section5" onClick={closeNavMenu} className={({isActive}) => isActive ? 'active' : undefined}>Considerations</NavLink>
                </nav>
            </div>
            <div className="user-section">
                {isLoggedIn ? (
                    <div ref={userMenuRef}>
                        <div className={`user-menu-toggle${isUserMenuVisible ? ' menu-open' : ''}`} onClick={() => setIsUserMenuVisible(!isUserMenuVisible)}>
                            <span>{user.username}</span>
                            {user.profilePicture ? (
                                <img src={user.profilePicture} alt="User Profile"/>
                            ) : (
                                <img src={'https://www.wilsoncenter.org/sites/default/files/media/images/person/james-person-1.jpg'} alt={`${user.username}'s profile pic`}></img>
                            )}

                        </div>
                        <nav className={`user-menu${isUserMenuVisible ? ' displayed' : ''}`}>
                            <NavLink to="#" onClick={showWIPMessage} style={{ fontWeight: 'normal' }}>User Profile</NavLink>
                            <NavLink to="#" onClick={showWIPMessage} style={{fontWeight: 'normal'}}>Settings</NavLink>
                            <NavLink to="#" onClick={showWIPMessage} style={{fontWeight: 'normal'}}>Other Stuff</NavLink>
                            <button onClick={() => {closeUserMenu(); logout();}} className="logout-button">Logout</button>
                        </nav>
                    </div>
                ) : (
                    <Link to="/login" className="login-button">Login</Link>
                )}
            </div>
        </header>
    );
}

export default Header;