import './Header.css';
import {useState} from 'react';
import {NavLink, useLocation, useNavigate} from 'react-router-dom';
import {useAuth} from "../context/AuthContext";
import {useToasts} from "../context/ToastContext";
import useOutsideClick from "../hooks/useOutsideClickHook";
import {useFormData} from "../context/FormDataContext";


function Header() {
    const [isNavMenuVisible, setIsNavMenuVisible] = useState(false);
    const [isUserMenuVisible, setIsUserMenuVisible] = useState(false);

    const {addToast} = useToasts();
    const {isLoggedIn, user, logout} = useAuth();
    const {canNavigate} = useFormData();
    const navigate = useNavigate();
    const location = useLocation();

    const showWIPMessage = () => addToast("Unfortunately, this section has not been built yet.", 5000);

    const closeNavMenu = () => setIsNavMenuVisible(false);
    const navMenuRef = useOutsideClick(closeNavMenu);

    const closeUserMenu = () => setIsUserMenuVisible(false);
    const userMenuRef = useOutsideClick(closeUserMenu);

    const handleNavigation = (e, checkForms, path, state = {}) => {
        e.preventDefault();
        if (canNavigate(checkForms)) {
            closeUserMenu();
            closeNavMenu();
            navigate(path, {state});
        }
    };

    return (
        <header className="header">
            <div className="logo">
                <NavLink to="/" onClick={(e) => handleNavigation(e,{checkAll: true}, '/')}><img src="http://localhost:3000/PlaceholderLogoCollectiveSynthesis.jpg" alt="Your Logo"/></NavLink>
            </div>
            <div ref={navMenuRef}>
                <button className={`nav-menu-toggle${isNavMenuVisible ? ' menu-open' : ''}`} onClick={() => setIsNavMenuVisible(!isNavMenuVisible)}>
                    <span>☰</span>
                </button>
                <nav className={`nav-menu${isNavMenuVisible ? ' displayed' : ''}`}>
                    <NavLink to="/" onClick={(e) => handleNavigation(e, {checkAll: true}, '/')} className={({isActive}) => isActive ? 'active' : undefined}>Home</NavLink>
                    <NavLink to="/problemSpace" onClick={(e) => {e.preventDefault(); showWIPMessage();}} className={({isActive}) => isActive ? 'active' : undefined}>Problem Space</NavLink>
                    <NavLink to="/solutions" onClick={(e) => handleNavigation(e, {checkAll: true}, '/solutions')} className={({isActive}) => isActive ? 'active' : undefined}>Solutions</NavLink>
                    {/*<NavLink to="/discussionSpace" onClick={closeNavMenu} className={({isActive}) => isActive ? 'active' : undefined}>Discussion Space</NavLink>
                    <NavLink to="/considerations" onClick={closeNavMenu} className={({isActive}) => isActive ? 'active' : undefined}>Considerations</NavLink>*/}
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
                    <NavLink to="/login" onClick={(e) => handleNavigation(e, {checkAll: true}, '/login', {from: location})} className={({isActive}) => 'login-button'}>Login</NavLink>
                )}
            </div>
        </header>
    );
}

export default Header;