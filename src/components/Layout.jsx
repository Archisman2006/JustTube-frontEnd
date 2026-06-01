import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from './Navbar.jsx'
import Sidebar from './Sidebar.jsx'
const Layout=()=>{
    return (
        <div>
            <Navbar/>
            <div>
                <Sidebar/>
                <main>
                    <Outlet/>
                </main>
            </div>
        </div>
    )
}
export default Layout;