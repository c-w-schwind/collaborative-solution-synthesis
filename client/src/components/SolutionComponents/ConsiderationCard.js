import { useState } from 'react';
import CommentSection from './CommentSection';
import './Consideration.css';


const ConsiderationCard = ({ consideration }) => {
    const [showComments, setShowComments] = useState(false);

    const toggleComments = () => setShowComments(!showComments);

    return (
        <div className="consideration">
            <div className="consideration-content">
                <div className="consideration-text">
                    <h4 className="consideration-title">{consideration.title} ({consideration.stance.toUpperCase()})</h4>
                    <p>{consideration.description}</p>
                </div>
                <div className="consideration-actions">
                    <button onClick={toggleComments} className="toggle-comments-button" disabled={consideration.comments.length === 0}>
                        {showComments ? 'Hide Comments' : (consideration.comments.length === 0 ? 'No comments yet' : `Show Comments (${consideration.comments.length})`)}
                    </button>
                    <button className="add-comment-button">Add Comment</button>
                </div>
            </div>
            {showComments && <CommentSection comments={consideration.comments} considerationId={consideration._id}/>}
        </div>
    );
};

export default ConsiderationCard;