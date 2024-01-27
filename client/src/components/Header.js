import {useAuth} from "../context/AuthContext";
import { Link } from 'react-router-dom';
import './Header.css';

function Header () {
    const { isLoggedIn, user, logout } = useAuth();

    return (
        <header className="header">
            <div className="logo">
                <Link to="../public/favicon.ico">Your Logo</Link>
                {/* <Link to="/">
                    <img src="path-to-your-logo.png" alt="Your Logo" />
                </Link> */}
            </div>
            <nav className="navigation">
                <Link to="/">Home</Link>
                <Link to="/section3">Problem Space</Link>
                <Link to="/section4">Solution Space</Link>
                <Link to="/discussionSpace">Discussion Space</Link>
                <Link to="/section5">Considerations</Link>
                {/* <div className="nav-item"><Link to="/discussionSpace">Discussion Space</Link></div> */}
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