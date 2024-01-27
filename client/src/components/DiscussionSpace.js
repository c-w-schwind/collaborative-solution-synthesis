import './DiscussionSpace.css';
import {useEffect, useState} from "react";
import MessageCard from "./MessageCard";
import MessageInput from "./MessageInput";

function DiscussionSpace () {
    const [messages, setMessages] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const limit = 30;

    useEffect(() => {
        fetchPosts(page, limit);
        const interval = setInterval(() => {
            fetchPosts(page, limit);
        }, 30000); // Polling every 30 seconds

        return () => clearInterval(interval); // Cleanup on component unmount
    }, [page, limit]);

    async function fetchPosts (page, limit) {
        const queryParams = new URLSearchParams({ page, limit}).toString();
        try{
            const response = await fetch(`http://localhost:5555/discussionSpace?${queryParams}`);
            if (!response.ok){
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setMessages(data.posts.reverse());
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error('Failed to fetch posts:', error);
        }
    }

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
                ))};
            <MessageInput onPostSuccess={fetchPosts}/>
            <section className="pagination">
                <button onClick={previousPage} disabled={page === totalPages}>Previous</button>
                <span>You're on page {page} of {totalPages}.</span>
                <button onClick={nextPage} disabled={page === 1}>Next</button>
            </section>
        </div>
    );
}

export default DiscussionSpace;