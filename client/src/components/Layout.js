import Header from "./Header";
import {Outlet} from "react-router-dom";
import "./Layout.css";

function Layout () {
    return (
        <div className="layout">
            <Header/>
            <div className="layout-content">
                <Outlet/>
            </div>
        </div>
    );
}

export default Layout;