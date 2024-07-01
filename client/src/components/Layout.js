import Header from "./Header";
import {Outlet} from "react-router-dom";
import "./Layout.css";
import {useFormData} from "../context/FormDataContext";
import {useEffect} from "react";

function Layout () {
    const {handleBrowserNavigation} = useFormData();

    useEffect(() => {
        window.addEventListener('popstate', handleBrowserNavigation);
        return () => {
            window.removeEventListener('popstate', handleBrowserNavigation);
        };
    }, [handleBrowserNavigation]);


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