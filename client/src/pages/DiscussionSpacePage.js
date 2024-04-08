import './DiscussionSpacePage.css';
import {useCallback, useEffect, useState} from "react";
import PostCard from "../components/DiscussionSpaceComponents/PostCard";
import PostInput from "../components/DiscussionSpaceComponents/PostInput";
import {useToasts} from "../context/ToastContext";
import {formatToGermanTimezone} from '../utils/utils';
import {useLocation, useNavigate, useParams} from "react-router-dom";


function DiscussionSpacePage() {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState(null);
    const [isInputFilled, setIsInputFilled] = useState(false);
    const [hasPostsLoadedOnce, setHasPostsLoadedOnce] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const {addToast} = useToasts();
    const location = useLocation();
    const navigate = useNavigate();
    const limit = 20;
    const { solutionNumber, elementNumber } = useParams();
    const parentType = elementNumber ? "SolutionElement" : "Solution";
    const parentNumber = elementNumber || solutionNumber;

    const displayToastWarning = useCallback(() => {
        if (isInputFilled) addToast("Warning: To prevent losing your message, please copy and save it before refreshing the page.", 30000);
    }, [isInputFilled, addToast]);

    const fetchPosts = useCallback(async () => {
        const queryParams = new URLSearchParams({page, limit, parentType, parentNumber}).toString();
        try {
            const response = await fetch(`http://localhost:5555/discussionSpace?${queryParams}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            setError(null);
            const data = await response.json();
            setPosts(data.posts.reverse());
            setTotalPages(data.totalPages);
            setHasPostsLoadedOnce(true);
        } catch (err) {
            console.error('Failed to fetch posts:', err);
            setError('Failed to load current posts. Please try again later.');
            displayToastWarning();
        }
    }, [page, limit, parentType, parentNumber, displayToastWarning]);

    function nextPage() {
        if (page > 1) setPage(page - 1);
    }

    function previousPage() {
        if (page < totalPages) setPage(page + 1);
    }

    useEffect(() => {
        if (!parentType || !parentNumber) {
            setError("Error: Required information is missing. Please refresh the page.");
            return;
        }
        fetchPosts();
        const interval = setInterval(fetchPosts, 30000); // Polling every 30 seconds

        return () => clearInterval(interval);
    }, [fetchPosts, page, limit, parentType, parentNumber]);

    useEffect(() => {
        const pathSegments = location.pathname.split('/');
        const isFullscreenPath = pathSegments.includes('fullscreen');
        setIsFullscreen(isFullscreenPath);
    }, [location.pathname]);

    return (
        <div style={{margin: isFullscreen ? '30px 50px' : '0'}}>
            {isFullscreen && <div className={"discussion-space-full-screen-button-area"}>
                <button onClick={() => navigate(-1)}>Close Full Screen Mode</button>
            </div>}
            {posts.map(post => (
                <PostCard
                    key={post._id}
                    title={post.title}
                    content={post.content}
                    author={post.author.username}
                    createdAt={formatToGermanTimezone(post.createdAt)}
                    authorPictureUrl={post.authorPictureUrl}
                />
            ))}
            {error &&
                <div className="errorBlock">
                    <div className="error">{error}</div>
                    <button onClick={fetchPosts}>Retry</button>
                </div>}
            {hasPostsLoadedOnce && <PostInput onPostSuccess={fetchPosts}
                                              onPostError={displayToastWarning}
                                              onInputChange={(isFilled) => setIsInputFilled(isFilled)}
                                              parentType={parentType}
                                              parentNumber={parentNumber}
            />}
            {hasPostsLoadedOnce && <section className="pagination">
                <button onClick={previousPage} disabled={page === totalPages || page > totalPages}>Previous</button>
                <span>You're on page {page} of {totalPages}.</span>
                <button onClick={nextPage} disabled={page === 1}>Next</button>
            </section>}
        </div>
    );
}

export default DiscussionSpacePage;