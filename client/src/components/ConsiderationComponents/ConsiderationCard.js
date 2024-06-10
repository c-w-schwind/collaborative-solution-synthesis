import './ConsiderationCard.css';
import {useCallback, useEffect, useRef, useState} from 'react';
import CommentSection from './CommentSection';
import VotingModule from "../VotingModule";
import {useFormData} from "../../context/FormDataContext";


const ConsiderationCard = ({considerationData}) => {
    const [consideration, setConsideration] = useState(considerationData);
    const [showComments, setShowComments] = useState(false);
    const commentsContainerRef = useRef(null);
    const {toggleCommentSection, openedCommentsId} = useFormData();

    useEffect(() => {
        setConsideration(considerationData);
    }, [considerationData]);

    useEffect(() => {
        setShowComments(openedCommentsId === consideration._id);
    }, [openedCommentsId, consideration._id]);

    const handleInteractionSuccess = useCallback((data) => {
        setConsideration(data.consideration);
    }, []);

    useEffect(() => {
        // Adjust height after DOM updates to adapt to new comments
        requestAnimationFrame(() => {
            if (commentsContainerRef.current) {
                commentsContainerRef.current.style.height = showComments ? `${commentsContainerRef.current.scrollHeight}px` : '0px';
            }
        });
    }, [showComments, consideration]);

    return (
        <div className={`consideration ${showComments ? "comments-expanded" : ""}`}>
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
                    <button onClick={() => toggleCommentSection(consideration._id)}>
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