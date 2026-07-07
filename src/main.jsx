import React from "react";
import ReactDom from 'react-dom/client'
import App from "./App.jsx"
import {AuthProvider} from './context/AuthContext.jsx'
import "./index.css"
import { GoogleOAuthProvider } from "@react-oauth/google";
ReactDom.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <AuthProvider>
            <GoogleOAuthProvider clientId={import.meta.env.VITE_CLIENT_ID}>
                <App/>
            </GoogleOAuthProvider>
        </AuthProvider>
    </React.StrictMode>
)