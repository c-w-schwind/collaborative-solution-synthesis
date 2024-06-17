import './ConsiderationCard.css';
import {useCallback, useEffect, useRef, useState} from 'react';
import CommentSection from './CommentSection';
import VotingModule from "../VotingModule";
import {useFormData} from "../../context/FormDataContext";
import {useAuth} from "../../context/AuthContext";
import ConsiderationInput from "./ConsiderationInput";


const ConsiderationCard = ({considerationData, parentType, parentNumber}) => {
    const [consideration, setConsideration] = useState(considerationData);
    const [showComments, setShowComments] = useState(false);
    const [showConsiderationEditing, setShowConsiderationEditing] = useState(false);
    const [userId, setUserId] = useState(null);

    const {user} = useAuth();
    const {toggleCommentSection, openedCommentSectionId, toggleConsiderationForm, openedConsiderationFormId} = useFormData();

    const commentsContainerRef = useRef(null);

    useEffect(() => {
        if (user) setUserId(user._id);
    }, [user]);

    useEffect(() => {
        setConsideration(considerationData);
    }, [considerationData]);

    useEffect(() => {
        setShowComments(openedCommentSectionId === consideration._id);
    }, [openedCommentSectionId, consideration._id]);

    useEffect(() => {
        setShowConsiderationEditing(openedConsiderationFormId === consideration._id);
    }, [openedConsiderationFormId, consideration._id]);

    useEffect(() => {
        // Adjust height after DOM updates to adapt to new comments
        requestAnimationFrame(() => {
            if (commentsContainerRef.current) {
                commentsContainerRef.current.style.height = showComments ? `${commentsContainerRef.current.scrollHeight}px` : '0px';
            }
        });
    }, [showComments, consideration]);

    const handleInteractionSuccess = useCallback((data) => {
        setConsideration(data);
        toggleConsiderationForm(consideration._id);
    }, []);

    return (
        <div className={`consideration ${showComments ? "comments-expanded" : ""}`}>
            <div className="consideration-content">
                <div className="consideration-text">
                    {showConsiderationEditing ? (
                        <ConsiderationInput
                            onSuccessfulSubmit={handleInteractionSuccess}
                            parentType={parentType}
                            parentNumber={parentNumber}
                            existingData={{
                                stance: consideration.stance,
                                title: consideration.title,
                                description: consideration.description
                            }}
                        />
                    ) : (
                        <>
                            <h4 className="consideration-title">{consideration.title}</h4>
                            <p>{consideration.description}</p>
                        </>
                    )}
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
                    {userId === consideration.proposedBy && <button onClick={() => toggleConsiderationForm(consideration._id)}>edit</button>}
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