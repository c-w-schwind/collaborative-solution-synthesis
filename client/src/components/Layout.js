import "./Layout.css";
import {useEffect} from "react";
import {Outlet} from "react-router-dom";
import {useFormData} from "../context/FormDataContext";
import Header from "./Header";

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