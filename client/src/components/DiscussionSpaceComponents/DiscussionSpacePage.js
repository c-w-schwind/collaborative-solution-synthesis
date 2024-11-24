import "./DiscussionSpacePage.css";
import {useCallback, useEffect, useState} from "react";
import PostCard from "./PostCard";
import PostInput from "./PostInput";
import {formatToGermanTimezone} from "../../utils/utils";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import LoadingOverlay from "../CommonComponents/LoadingOverlay";


function DiscussionSpacePage() {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState(null);
    const [initialPostsLoaded, setInitialPostsLoaded] = useState(false);
    const [isFullscreenMode, setIsFullscreenMode] = useState(false);
    const [entityTitle, setEntityTitle] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const {solutionNumber, elementNumber} = useParams();

    const parentType = elementNumber ? "SolutionElement" : "Solution";
    const parentNumber = elementNumber || solutionNumber;
    const limit = 20;


    const fetchPosts = useCallback(async () => {
        if (!initialPostsLoaded) {
            setIsLoading(true);
        }

        const queryParams = new URLSearchParams({page, limit, parentType, parentNumber}).toString();
        try {
            const response = await fetch(`http://localhost:5555/discussionSpace?${queryParams}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setPosts(data.posts.reverse());
            setTotalPages(data.totalPages);
            setInitialPostsLoaded(true);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch posts:", err);
            setError("Failed to load current posts. Please try again later.");
        } finally {
            if (!initialPostsLoaded) {
                setIsLoading(false);
            }
        }
    }, [page, limit, parentType, parentNumber, initialPostsLoaded]);

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
    }, [fetchPosts, parentType, parentNumber]);

    useEffect(() => {
        const pathSegments = location.pathname.split("/");
        const isFullscreenPath = pathSegments.includes("fullscreen");
        setIsFullscreenMode(isFullscreenPath);

        if (isFullscreenPath) {
            if (location.state?.entityTitle) {
                setEntityTitle(location.state?.entityTitle);
            } else {
                navigate("..", {relative: "path"});
            }
        }
    }, [location, navigate]);

    return (
        <>
            {isFullscreenMode && <div className="discussion-space-full-screen-button-area">
                <button className="discussion-space-full-screen-button action-button--propose-changes" onClick={() => navigate(-1)}>Close Fullscreen Mode</button>
            </div>}
            <div className={isFullscreenMode ? "fullscreen-wrapper" : ""}>
                <div className={isFullscreenMode ? "discussion-space-full-screen-container" : "discussion-space-container"} style={{ position: 'relative' }}>{/* Ensure relative positioning for absolute overlay*/}
                    {isFullscreenMode && <div className="discussion-space-full-screen-header">
                        <div className="discussion-space-full-screen-title">{entityTitle} ({parentType === "SolutionElement" ? "Solution Element" : parentType})</div>
                    </div>}
                    <div className={isFullscreenMode ? "discussion-space-full-screen-content" : "discussion-space-content"}>
                        {posts.length > 0 ? (
                            posts.map(post => (
                                <PostCard
                                    key={post._id}
                                    title={post.title}
                                    content={post.content}
                                    author={post.author.username}
                                    createdAt={formatToGermanTimezone(post.createdAt)}
                                    authorPictureUrl={post.authorPictureUrl}
                                />))
                        ) : !isLoading ? (
                            <div className="discussion-space-no-posts-message-area">
                                <div className="discussion-space-no-posts-message">
                                    No posts available yet. Be the first to start a discussion!
                                </div>
                            </div>
                        ) : null}
                        {error && <div className="discussion-space-error-block">
                            <div className="error">{error}</div>
                            <button onClick={fetchPosts}>Retry</button>
                        </div>}
                        <section className="discussion-space-input-area">{/* Warning: Class referenced in handleBrowserNavigation for DOM checks. Changes need to be synchronized. */}
                            {initialPostsLoaded && <div className="discussion-space-post-input">
                                <PostInput onSuccessfulSubmit={fetchPosts}
                                           parentType={parentType}
                                           parentNumber={parentNumber}
                                />
                            </div>}
                        </section>
                        {initialPostsLoaded && posts.length > 0 && <section className="discussion-space-pagination">
                            <button onClick={previousPage} disabled={page === totalPages || page > totalPages}>Previous</button>
                            <span>You're on page {page} of {totalPages}.</span>
                            <button onClick={nextPage} disabled={page === 1}>Next</button>
                        </section>}
                        <LoadingOverlay isVisible={isLoading} message="Loading posts..." isFullScreen={false}/>
                    </div>
                </div>
            </div>
        </>
    );
}

export default DiscussionSpacePage;