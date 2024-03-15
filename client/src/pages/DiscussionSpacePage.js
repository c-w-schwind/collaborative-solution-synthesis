import './DiscussionSpacePage.css';
import {useCallback, useEffect, useState} from "react";
import PostCard from "../components/DiscussionSpaceComponents/PostCard";
import PostInput from "../components/DiscussionSpaceComponents/PostInput";
import {useToasts} from "../context/ToastContext";
import {formatToGermanTimezone} from '../utils/dateUtils';

function DiscussionSpacePage() {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState(null);
    const [isInputFilled, setIsInputFilled] = useState(false);
    const [hasPostsLoadedOnce, setHasPostsLoadedOnce] = useState(false);
    const {addToast} = useToasts();
    const limit = 20;

    useEffect(() => {
        fetchPosts(page, limit);
        const interval = setInterval(() => {
            fetchPosts(page, limit);
        }, 30000); // Polling every 30 seconds

        return () => clearInterval(interval);
    }, [page, limit]);

    function displayToastWarning() {
        if (isInputFilled) addToast("Warning: To prevent losing your message, please copy and save it before refreshing the page.", 30000);
    }

    const fetchPosts = useCallback(async (page, limit) => {
        if (error) setError("Fetching posts...");
        const queryParams = new URLSearchParams({page, limit}).toString();
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
    }, []);

    function nextPage() {
        if (page > 1) setPage(page - 1);
    }

    function previousPage() {
        if (page < totalPages) setPage(page + 1);
    }

    return (
        <div className="postBlock">
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