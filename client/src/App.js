import "./App.css";
import "./Tooltips.css";
import {BrowserRouter, Routes, Route} from "react-router-dom";

import {GlobalProvider} from "./context/GlobalContext";
import {ToastProvider} from "./context/ToastContext";
import {LoadingProvider} from "./context/LoadingContext";
import {ConfirmationModalProvider} from "./context/ConfirmationModalContext";
import {AuthProvider} from "./context/AuthContext";
import {FormDataProvider} from "./context/FormDataContext";

import Layout from "./components/Layout";
import PublicRoute from "./routes/PublicRoute";
import IndexPage from "./components/IndexPage/IndexPage";
import ChallengePage from "./components/ChallengeComponents/ChallengePage";
import LoginPage from "./components/AuthenticationComponents/LoginPage";
import SolutionListPage from "./components/SolutionComponents/SolutionListPage";
import DiscussionSpacePage from "./components/DiscussionSpaceComponents/DiscussionSpacePage";
import SolutionDetailsPage from "./components/SolutionComponents/SolutionDetailsPage";
import SolutionElementModal from "./components/SolutionElementComponents/SolutionElementModal";

import {EnhancedSolutionDetailsPage, EnhancedSolutionElementModal} from "./components/HOC/withSidePanel";


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
                                                <Route path="challenge" element={<ChallengePage/>}/>
                                                <Route path="solutions" element={<SolutionListPage/>}/>
                                                <Route path="solutions/:solutionNumber/:solutionVersion?" element={<EnhancedSolutionDetailsPage/>}>
                                                    <Route path="discussionSpace" element={<DiscussionSpacePage/>}/>
                                                    <Route path="comparison/:comparisonEntityNumber" element={<SolutionDetailsPage/>}/>
                                                    <Route path="element/:elementNumber/:elementVersion?" element={<EnhancedSolutionElementModal/>}>
                                                        <Route path="discussionSpace" element={<DiscussionSpacePage/>}/>
                                                        <Route path="comparison/:comparisonEntityNumber" element={<SolutionElementModal/>}/>
                                                    </Route>
                                                </Route>
                                                <Route path="solutions/:solutionNumber/:solutionVersion?/element/:elementNumber/:elementVersion?/discussionSpace/fullscreen" element={<DiscussionSpacePage/>}/>
                                                <Route path="solutions/:solutionNumber/:solutionVersion?/discussionSpace/fullscreen" element={<DiscussionSpacePage/>}/>
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

export default App;