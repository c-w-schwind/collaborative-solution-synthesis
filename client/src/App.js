import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import {ToastProvider} from "./context/ToastContext";

import LoginPage from './pages/LoginPage';
import DiscussionSpace from "./pages/DiscussionSpace";

import './App.css';
import Layout from "./components/Layout";
import PublicRoute from "./routes/PublicRoute";

function App() {
    return (
        <div className="App">
            <ToastProvider>
                <BrowserRouter>
                    <AuthProvider>
                        <Routes>
                            <Route path="/" element={<Layout/>}>
                                <Route index element={<IndexPage/>}/>
                                <Route path="login" element={<PublicRoute><LoginPage/></PublicRoute>}/>
                                <Route path="discussionSpace" element={<DiscussionSpace/>}/>
                            </Route>
                        </Routes>
                    </AuthProvider>
                </BrowserRouter>
            </ToastProvider>
        </div>
    );
}

function IndexPage () {
    return (
        <>
            <h1 style={{padding : 40}}>Collective Solution Synthesis</h1>
        </>
    );
}

export default App;