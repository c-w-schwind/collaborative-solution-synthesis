import './ConsiderationCard.css';
import {useEffect, useRef, useState} from 'react';
import CommentSection from './CommentSection';
import VotingModule from "../VotingModule";


const ConsiderationCard = ({considerationData}) => {
    const [consideration, setConsideration] = useState(considerationData)
    const [showComments, setShowComments] = useState(false);
    const commentsContainerRef = useRef(null);

    useEffect(() => {
        setConsideration(considerationData);
    }, [considerationData]);

    const toggleComments = () => setShowComments(!showComments);

    const handleInteractionSuccess = (data) => {
        setConsideration(data.consideration);
    }

    useEffect(() => {
        // Using setTimeout to defer height adjustment until after DOM updates are completed for correct adaptation when new comments have been added
        setTimeout(() => {
            if (commentsContainerRef.current) {
                commentsContainerRef.current.style.height = showComments ? `${commentsContainerRef.current.scrollHeight}px` : '0px';
            }
        }, 0);
    }, [showComments, consideration]);

    return (
        <div className={`consideration ${showComments && "comments-expanded"}`}>
            <div className="consideration-content">
                <div className="consideration-text">
                    <h4 className="consideration-title">{consideration.title}</h4>
                    <p>{consideration.description}</p>
                </div>
                <div className="consideration-action-area">
                    <VotingModule
                        votableItem={consideration}
                        onVoteSuccess={handleInteractionSuccess}
                        voteEndpoint={`considerations/${consideration._id}/vote`}
                    />
                    <button onClick={toggleComments}>
                        <img src="http://localhost:3000/comments.png" alt="comments"/>
                        {consideration.comments.length}
                    </button>
                </div>
            </div>
            <div className="comment-section-animated" ref={commentsContainerRef}>
                <CommentSection
                    comments={consideration.comments}
                    considerationId={consideration._id}
                    onAddingCommentSuccess={handleInteractionSuccess}
                />
            </div>
        </div>
    );
};

export default ConsiderationCard;