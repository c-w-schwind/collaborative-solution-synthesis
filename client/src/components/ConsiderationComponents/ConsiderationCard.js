import './Consideration.css';
import {useEffect, useState} from 'react';
import CommentSection from './CommentSection';
import VotingModule from "../VotingModule";


const ConsiderationCard = ({considerationData}) => {
    const [consideration, setConsideration] = useState(considerationData)
    const [showComments, setShowComments] = useState(false);

    useEffect(() => {
        setConsideration(considerationData);
    }, [considerationData]);

    const toggleComments = () => setShowComments(!showComments);

    const handleVoteSuccess = (data) => {
        setConsideration(data.consideration);
    }

    return (
        <div className={`consideration ${consideration.stance}`}>
            <div className="consideration-content">
                <div className="consideration-text">
                    <h4 className="consideration-title">{consideration.title}</h4>
                    <p>{consideration.description}</p>
                </div>
                <div className="consideration-actions">
                    <button onClick={toggleComments} className="toggle-comments-button" disabled={consideration.comments.length === 0}>
                        {showComments ? 'Hide Comments' : (consideration.comments.length === 0 ? 'No comments yet' : `Show Comments (${consideration.comments.length})`)}
                    </button>
                    <button className="add-comment-button">Add Comment</button>
                </div>
                <VotingModule
                    votableItem={consideration}
                    onVoteSuccess={handleVoteSuccess}
                    voteEndpoint={`considerations/${consideration._id}/vote`}
                />
            </div>
            {showComments && <CommentSection
                comments={consideration.comments}
                considerationId={consideration._id}
            />}
        </div>
    );
};

export default ConsiderationCard;