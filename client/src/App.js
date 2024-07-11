import './App.css';
import {BrowserRouter, Routes, Route} from 'react-router-dom';

import {AuthProvider} from './context/AuthContext';
import {ToastProvider} from "./context/ToastContext";
import {FormDataProvider} from "./context/FormDataContext";
import {GlobalProvider} from "./context/GlobalContext";

import Layout from "./components/Layout";
import PublicRoute from "./routes/PublicRoute";
import LoginPage from './pages/LoginPage';
import SolutionListPage from "./pages/SolutionListPage";
import DiscussionSpacePage from "./pages/DiscussionSpacePage";

import {EnhancedSolutionDetailsPage, EnhancedSolutionElementModal} from "./components/HOC/withDiscussionSpace";


function App() {
    return (
        <div className="App">
            <GlobalProvider>
                <ToastProvider>
                    <BrowserRouter>
                        <AuthProvider>
                            <FormDataProvider>
                                <Routes>
                                    <Route path="/" element={<Layout/>}>
                                        <Route index element={<IndexPage/>}/>
                                        <Route path="login" element={<PublicRoute><LoginPage/></PublicRoute>}/>
                                        <Route path="solutions" element={<SolutionListPage/>}/>
                                        <Route path="solutions/:solutionNumber" element={<EnhancedSolutionDetailsPage/>}>
                                            <Route path="discussionSpace" element={<DiscussionSpacePage/>}/>
                                            <Route path="element/:elementNumber" element={<EnhancedSolutionElementModal/>}>
                                                <Route path="discussionSpace" element={<DiscussionSpacePage/>}/>
                                            </Route>
                                        </Route>
                                        <Route path="solutions/:solutionNumber/element/:elementNumber/discussionSpace/fullscreen" element={<DiscussionSpacePage/>}/>
                                        <Route path="solutions/:solutionNumber/discussionSpace/fullscreen" element={<DiscussionSpacePage/>}/>
                                    </Route>
                                </Routes>
                            </FormDataProvider>
                        </AuthProvider>
                    </BrowserRouter>
                </ToastProvider>
            </GlobalProvider>
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