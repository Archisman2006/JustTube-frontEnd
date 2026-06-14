import react from "react";
import { Outlet } from "react-router-dom";
import Navbar from './Navbar.jsx'
import Sidebar from './Sidebar.jsx'
const Layout=()=>{
    return (
        <div className="min-h-screen bg-zinc-950">
            <Navbar/>
            <div className="flex">
                <Sidebar/>
                <main className="flex-1 min-w-0 p-6">
                    <Outlet/>
                </main>
            </div>
        </div>
    )
}
export default Layout;
