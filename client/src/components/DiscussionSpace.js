import './DiscussionSpace.css';
import {useCallback, useEffect, useRef, useState} from "react";
import MessageCard from "./MessageCard";
import MessageInput from "./MessageInput";
import {useToasts} from "../context/ToastContext";

function DiscussionSpace () {
    const [messages, setMessages] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState(null);
    const [isInputFilled, setIsInputFilled] = useState(false);
    const {addToast} = useToasts();
    const limit = 20;

    const isInputFilledRef = useRef(isInputFilled);
    isInputFilledRef.current = isInputFilled;

    useEffect(() => {
        fetchPosts(page, limit);
        const interval = setInterval(() => {
            fetchPosts(page, limit);
        }, 30000); // Polling every 30 seconds

        return () => clearInterval(interval); // Cleanup on component unmount
    }, [page, limit]);

    function displayToastWarning() {
        if (isInputFilledRef.current) addToast("Warning: To prevent losing your message, please copy and save it before refreshing the page.", 30000);
    }

    const fetchPosts = useCallback(async (page, limit) => {
        if (error) setError("Fetching posts...");
        const queryParams = new URLSearchParams({ page, limit}).toString();
        try{
            const response = await fetch(`http://localhost:5555/discussionSpace?${queryParams}`);
            if (!response.ok){
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            setError(null);
            const data = await response.json();
            setMessages(data.posts.reverse());
            setTotalPages(data.totalPages);
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
        <div className="messageBlock">
            {messages.map(message => (
                <MessageCard
                    key={message._id}
                    title={message.title}
                    content={message.content}
                    author={message.author.username}
                    timestamp={message.timestamp}
                    authorPictureUrl={message.authorPictureUrl}
                />
            ))}
            {error &&
                <div className="errorBlock">
                    <div className="error">{error}</div>
                    <button onClick={fetchPosts}>Retry</button>
                </div>}
            <MessageInput onPostSuccess={fetchPosts}
                          onPostError={displayToastWarning}
                          onInputChange={(isFilled) => setIsInputFilled(isFilled)}
            />
            <section className="pagination">
                <button onClick={previousPage} disabled={page === totalPages || page > totalPages}>Previous</button>
                <span>You're on page {page} of {totalPages}.</span>
                <button onClick={nextPage} disabled={page === 1}>Next</button>
            </section>
        </div>
    );
}

export default DiscussionSpace;