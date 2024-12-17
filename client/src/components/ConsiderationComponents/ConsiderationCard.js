import './ConsiderationCard.css';
import {useCallback, useEffect, useRef, useState} from 'react';
import CommentSection from './CommentSection';
import VotingModule from "../VotingModule";
import {useFormData} from "../../context/FormDataContext";
import {useAuth} from "../../context/AuthContext";
import ConsiderationInput from "./ConsiderationInput";


const ConsiderationCard = ({considerationData, parentType, parentNumber, parentVersionNumber, scrollContainerRef}) => {
    const [consideration, setConsideration] = useState(considerationData);
    const [showComments, setShowComments] = useState(false);
    const [renderComments, setRenderComments] = useState(false);
    const [showConsiderationEditing, setShowConsiderationEditing] = useState(false);
    const [userId, setUserId] = useState(null);

    const {user} = useAuth();
    const {toggleCommentSection, openedCommentSectionId, toggleConsiderationForm, openedConsiderationFormId} = useFormData();

    const commentsContainerRef = useRef(null);
    const considerationRef = useRef(null);

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
        let timeoutId;
        if (commentsContainerRef.current) {
            if (showComments) {
                setRenderComments(true);
                timeoutId = setTimeout(() => commentsContainerRef.current.style.height = `${commentsContainerRef.current.scrollHeight}px`);
            } else {
                commentsContainerRef.current.style.height = '0px';
                timeoutId = setTimeout(() => {
                    setRenderComments(false);
                }, 300);
            }
        }
        return () => clearTimeout(timeoutId);
    }, [showComments, consideration]);

    useEffect(() => {
        setShowConsiderationEditing(openedConsiderationFormId === consideration._id);
    }, [openedConsiderationFormId, consideration._id]);

    const handleInteractionSuccess = useCallback((data) => {
        setConsideration(data);
    }, []);

    return (
        <div className={`consideration ${showComments ? "comments-expanded" : ""}`} ref={considerationRef}>
            <div className="consideration-content">
                {showConsiderationEditing ? (
                    <div className="consideration-input-area">
                        <ConsiderationInput
                            onSuccessfulSubmit={handleInteractionSuccess}
                            parentType={parentType}
                            parentNumber={parentNumber}
                            parentVersionNumber={parentVersionNumber}
                            considerationFormId={consideration._id}
                            existingData={{
                                stance: consideration.stance,
                                title: consideration.title,
                                description: consideration.description
                            }}
                        />
                    </div>
                ) : (
                    <>
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
                            <button onClick={() => toggleCommentSection(consideration._id, commentsContainerRef, scrollContainerRef)}>
                                <img src="http://localhost:3000/comments.png" alt="comments"/>
                                {consideration.comments.length}
                            </button>
                            {userId === consideration.proposedBy && <button onClick={() => toggleConsiderationForm({considerationId: consideration._id, ref: considerationRef})}>edit</button>}
                        </div>
                    </>
                )}
            </div>
            <div className="animated-toggle-section" ref={commentsContainerRef}>
                {renderComments && <CommentSection
                    comments={consideration.comments}
                    considerationId={consideration._id}
                    onAddingCommentSuccess={handleInteractionSuccess}
                />}
            </div>
        </div>
    );
};

export default ConsiderationCard;