import "./DiscussionSpacePage.css";
import {useCallback, useEffect, useRef, useState} from "react";
import PostCard from "./PostCard";
import PostInput from "./PostInput";
import {formatToGermanTimezone} from "../../utils/utils";
import {useLocation, useNavigate, useParams, useSearchParams} from "react-router-dom";
import LoadingOverlay from "../CommonComponents/LoadingOverlay";


function DiscussionSpacePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const pageFromURL = searchParams.get("page");
    const [posts, setPosts] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState(null);
    const [entityTitle, setEntityTitle] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const {solutionNumber, solutionVersion, elementNumber, elementVersion} = useParams();
    const didInitialLoadingRef = useRef(false);

    const parentType = elementNumber ? "SolutionElement" : "Solution";
    const parentNumber = elementNumber || solutionNumber;
    const parentVersion = parentType === "Solution" ? solutionVersion || location.state?.entityVersion : elementVersion || location.state?.entityVersion;
    const isFullscreenMode = location.pathname.includes("fullscreen");

    const limit = 20;


    const fetchPosts = useCallback(async (currentPage, isPollingRequest = false) => {
        if (!isPollingRequest) setIsLoading(true);

        const queryParams = new URLSearchParams({page: currentPage, limit, parentType, parentNumber, ...(parentVersion !== undefined && {parentVersion})}).toString();
        try {
            const response = await fetch(`http://localhost:5555/discussionSpace?${queryParams}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();

            setPosts(data.posts);
            setTotalPages(data.totalPages);
            setError(null);

            if (currentPage === "last") {
                const lastPage = data.totalPages;
                if (pageFromURL !== String(lastPage)) {
                    setSearchParams({page: lastPage}, {replace: true});
                }
            }
        } catch (err) {
            console.error("Failed to fetch posts:", err);
            setError("Failed to load current posts. Please try again later.");
        } finally {
            if (!isPollingRequest) setIsLoading(false);
        }
    }, [limit, parentType, parentNumber, parentVersion, pageFromURL, setSearchParams]);

    useEffect(() => {
        if (!parentType || !parentNumber) {
            setError("Error: Required information is missing. Please refresh the page.");
            setIsLoading(false);
            return;
        }

        if (!pageFromURL) {
            // If no pageFromURL is present, fetch the last page
            didInitialLoadingRef.current = true;
            fetchPosts("last");
        } else if (didInitialLoadingRef.current) {
            didInitialLoadingRef.current = false;
        } else {
            // If we have a pageFromURL, fetch that page directly
            fetchPosts(Number(pageFromURL));
        }
    }, [parentType, parentNumber, pageFromURL, fetchPosts]);


    // Polling for new posts every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (pageFromURL) {
                fetchPosts(Number(pageFromURL), true);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [fetchPosts, pageFromURL]);


    // Handle fullscreen mode title
    useEffect(() => {
        if (isFullscreenMode) {
            if (entityTitle) {
                // Do nothing, since entity title is already set in state
            } else if (location.state?.entityTitle) {
                setEntityTitle(location.state.entityTitle);
            } else {
                // If entityTitle is missing, navigate back to avoid inconsistencies
                navigate(`..?page=${Number(pageFromURL)}`, {relative: "path"});
            }
        }
    }, [isFullscreenMode, entityTitle, location.state?.entityTitle, navigate, pageFromURL]);


    const nextPage = () => {
        const currentPage = Number(pageFromURL);
        if (currentPage < totalPages) {
            const newPage = currentPage + 1;
            setSearchParams({page: newPage});
        }
    };

    const previousPage = () => {
        const currentPage = Number(pageFromURL);
        if (currentPage > 1) {
            const newPage = currentPage - 1;
            setSearchParams({page: newPage});
        }
    };

    const goToFirst = () => {
        setSearchParams({page: 1});
    };

    const goToLatest = () => {
        setSearchParams({page: totalPages});
    };

    const handleSuccessfulSubmit = async () => {
        await fetchPosts(Number(pageFromURL), true);
        setIsSubmitting(false);
    };

    const closeFullscreen = () => {
        const newPath = location.pathname.replace('/fullscreen', '');
        navigate(newPath + location.search, {replace: true});
    };


    return (
        <>
            {isFullscreenMode && <div className="discussion-space-full-screen-button-area">
                <button className="discussion-space-full-screen-button action-button--propose-changes" onClick={closeFullscreen}>Close Fullscreen Mode</button>
            </div>}
            <div className={isFullscreenMode ? "fullscreen-wrapper" : ""}>
                <div className={isFullscreenMode ? "discussion-space-full-screen-container" : "discussion-space-container"} style={{position: "relative"}}>{/* Ensure relative positioning for absolute overlay*/}
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
                            <button onClick={() => fetchPosts(Number(pageFromURL))}>Retry</button>
                        </div>}
                        <section className="discussion-space-input-area">{/* Warning: Class referenced in handleBrowserNavigation for DOM checks. Changes need to be synchronized. */}
                            {totalPages !== 0 && <div className="discussion-space-post-input-wrapper">
                                <PostInput
                                    onSuccessfulSubmit={handleSuccessfulSubmit}
                                    parentType={parentType}
                                    parentNumber={parentNumber}
                                    parentVersion={parentVersion}
                                    setIsSubmitting={setIsSubmitting}
                                />
                                <LoadingOverlay isVisible={isSubmitting} message="Submitting posts..." isFullScreen={false}/>
                            </div>}
                        </section>
                        {posts.length > 0 && <section className="discussion-space-pagination">
                            {totalPages > 2 && <button onClick={goToFirst} disabled={Number(pageFromURL) === 1}>Go to First</button>}
                            <button onClick={previousPage} disabled={Number(pageFromURL) === 1}>Previous</button>
                            <span>You're on page {Number(pageFromURL)} of {totalPages}.</span>
                            <button onClick={nextPage} disabled={Number(pageFromURL) === totalPages}>Next</button>
                            {totalPages > 2 && <button onClick={goToLatest} disabled={Number(pageFromURL) === totalPages}>Go to Latest</button>}
                        </section>}
                        <LoadingOverlay isVisible={isLoading} message="Loading posts..." isFullScreen={false} isSidePanel={!isFullscreenMode}/>
                    </div>
                </div>
            </div>
        </>
    );
}

export default DiscussionSpacePage;