import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import {ToastProvider} from "./context/ToastContext";

import LoginPage from './pages/LoginPage';
import DiscussionSpacePage from "./pages/DiscussionSpacePage";

import './App.css';
import Layout from "./components/Layout";
import PublicRoute from "./routes/PublicRoute";
import SolutionsPage from "./pages/SolutionsPage";
import SolutionDetailsPage from "./pages/SolutionDetailsPage";

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
                                <Route path="discussionSpace" element={<DiscussionSpacePage/>}/>
                                <Route path="solutions" element={<SolutionsPage/>}/>
                                <Route path="solutions/:solutionNumber" element={<SolutionDetailsPage/>}/>
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
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '80vh',
        }}>
            <img src="http://localhost:3000/PlaceholderPictureCollectiveSynthesis.jpg" alt="Your Logo"
                 style={{maxHeight: '500px', margin: 'auto', borderRadius: '10%'}}/>
            <h1>Collective Solution Synthesis</h1>
        </div>
    );
}

export default App;