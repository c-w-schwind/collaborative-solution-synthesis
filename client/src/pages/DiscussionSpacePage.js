import "./DiscussionSpacePage.css";
import {useCallback, useEffect, useState} from "react";
import PostCard from "../components/DiscussionSpaceComponents/PostCard";
import PostInput from "../components/DiscussionSpaceComponents/PostInput";
import {formatToGermanTimezone} from "../utils/utils";
import {useLocation, useNavigate, useParams} from "react-router-dom";


function DiscussionSpacePage() {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState(null);
    const [hasPostsLoadedOnce, setHasPostsLoadedOnce] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [entityTitle, setEntityTitle] = useState("");

    const location = useLocation();
    const navigate = useNavigate();
    const limit = 20;
    const { solutionNumber, elementNumber } = useParams();
    const parentType = elementNumber ? "SolutionElement" : "Solution";
    const parentNumber = elementNumber || solutionNumber;


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
            console.error("Failed to fetch posts:", err);
            setError("Failed to load current posts. Please try again later.");
        }
    }, [page, limit, parentType, parentNumber]);

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
        const pathSegments = location.pathname.split("/");
        const isFullscreenPath = pathSegments.includes("fullscreen");
        setIsFullscreen(isFullscreenPath);

        if (isFullscreenPath) {
            if (location.state?.entityTitle) {
                setEntityTitle(location.state?.entityTitle);
            } else {
                navigate("..", {relative: "path"});
            }
        }

    }, [location.pathname]);

    return (
        <>
            {isFullscreen && <div className={"discussion-space-full-screen-button-area"}>
                <button className="discussion-space-full-screen-button" onClick={() => navigate(-1)}>Close Full Screen Mode</button>
            </div>}
            <div className={isFullscreen ? "fullscreen-wrapper" : ""}>
                <div className={isFullscreen ? "discussion-space-full-screen-container" : ""}>
                    {isFullscreen && <div className="discussion-space-full-screen-header">
                        <div className="discussion-space-full-screen-title">{entityTitle} ({parentType === "SolutionElement" ? "Solution Element" : parentType})</div>
                    </div>}
                    <div className={isFullscreen ? "discussion-space-full-screen-content" : ""}>
                        {posts.length > 0
                            ? posts.map(post => (
                                <PostCard
                                    key={post._id}
                                    title={post.title}
                                    content={post.content}
                                    author={post.author.username}
                                    createdAt={formatToGermanTimezone(post.createdAt)}
                                    authorPictureUrl={post.authorPictureUrl}
                                />))
                            : <div className="discussion-space-no-posts-message-area">
                                <div className="discussion-space-no-posts-message">
                                    No posts available yet. Be the first to start a discussion!
                                </div>
                            </div>}
                        {error && <div className="discussion-space-error-block">
                            <div className="error">{error}</div>
                            <button onClick={fetchPosts}>Retry</button>
                        </div>}
                        {hasPostsLoadedOnce && <div className="discussion-space-post-input">
                            <PostInput onSuccessfulSubmit={fetchPosts}
                                       parentType={parentType}
                                       parentNumber={parentNumber}
                            />
                        </div>}
                        {hasPostsLoadedOnce && posts.length > 0 && <section className="discussion-space-pagination">
                            <button onClick={previousPage} disabled={page === totalPages || page > totalPages}>Previous</button>
                            <span>You're on page {page} of {totalPages}.</span>
                            <button onClick={nextPage} disabled={page === 1}>Next</button>
                        </section>}
                    </div>
                </div>
            </div>
        </>
    );
}

export default DiscussionSpacePage;