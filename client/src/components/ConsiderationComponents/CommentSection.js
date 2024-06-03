import './CommentSection.css';
import React, {useEffect, useState} from 'react';
import VotingModule from "../VotingModule";


const CommentSection = ({ comments, considerationId }) => {
    const [considerationComments, setConsiderationComments] = useState(comments);

    useEffect(() => {
        setConsiderationComments(comments);
    }, [comments]);

    const handleVoteSuccess = (data) => {
        const updatedComment = data.comment;

        const updatedComments = considerationComments.map(considerationComment => (
            considerationComment._id === updatedComment._id ? updatedComment : considerationComment
        ));

        setConsiderationComments(updatedComments);
    }

    return (
        <div className="comments-container">
            {considerationComments.map(comment => (
                <div key={comment._id} className="comment">
                    <div className="comment-content">
                        <p className="comment-text">{comment.text}</p>
                        <button className="add-comment-button">Reply</button>
                    </div>
                    <VotingModule
                        votableItem={comment}
                        onVoteSuccess={handleVoteSuccess}
                        voteEndpoint={`considerations/${considerationId}/comment/${comment._id}/vote`}
                    />
                </div>
            ))}
        </div>
    );
};

export default CommentSection;