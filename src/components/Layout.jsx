import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from './Navbar.jsx'
import Sidebar from './Sidebar.jsx'
import BottomNav from './BottomNav.jsx'

const Layout=()=>{
    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col">
            <Navbar/>
            <div className="flex flex-1">
                <Sidebar/>
                <main className="flex-1 min-w-0 p-4 md:p-6 pb-20 md:pb-6">
                    <Outlet/>
                </main>
            </div>
            <BottomNav/>
        </div>
    )
}
export default Layout;
