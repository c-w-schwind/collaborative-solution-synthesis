import './App.css';
import './Tooltips.css';
import {BrowserRouter, Routes, Route} from 'react-router-dom';

import {GlobalProvider} from "./context/GlobalContext";
import {ToastProvider} from "./context/ToastContext";
import {LoadingProvider} from "./context/LoadingContext";
import {ConfirmationModalProvider} from "./context/ConfirmationModalContext";
import {AuthProvider} from './context/AuthContext';
import {FormDataProvider} from "./context/FormDataContext";

import Layout from "./components/Layout";
import PublicRoute from "./routes/PublicRoute";
import LoginPage from './components/AuthenticationComponents/LoginPage';
import SolutionListPage from "./components/SolutionComponents/SolutionListPage";
import DiscussionSpacePage from "./components/DiscussionSpaceComponents/DiscussionSpacePage";

import {EnhancedSolutionDetailsPage, EnhancedSolutionElementModal} from "./components/HOC/withSidePanel";
import SolutionDetailsPage from "./components/SolutionComponents/SolutionDetailsPage";
import SolutionElementModal from "./components/SolutionElementComponents/SolutionElementModal";


function App() {
    return (
        <div className="App">
            <GlobalProvider>
                <ToastProvider>
                    <LoadingProvider>
                        <ConfirmationModalProvider>
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
                                                    <Route path="comparison/:comparisonEntityNumber" element={<SolutionDetailsPage/>}/>
                                                    <Route path="element/:elementNumber" element={<EnhancedSolutionElementModal/>}>
                                                        <Route path="discussionSpace" element={<DiscussionSpacePage/>}/>
                                                        <Route path="comparison/:comparisonEntityNumber" element={<SolutionElementModal/>}/>
                                                    </Route>
                                                </Route>
                                                <Route path="solutions/:solutionNumber/element/:elementNumber/discussionSpace/fullscreen" element={<DiscussionSpacePage/>}/>
                                                <Route path="solutions/:solutionNumber/discussionSpace/fullscreen" element={<DiscussionSpacePage/>}/>
                                            </Route>
                                        </Routes>
                                    </FormDataProvider>
                                </AuthProvider>
                            </BrowserRouter>
                        </ConfirmationModalProvider>
                    </LoadingProvider>
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