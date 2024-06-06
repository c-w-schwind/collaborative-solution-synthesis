import './CommentSection.css';
import React, {useEffect, useState} from 'react';
import VotingModule from "../VotingModule";
import CommentInput from "./CommentInput";


const CommentSection = ({comments, considerationId, onAddingCommentSuccess}) => {
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
            {considerationComments.length === 0 && <div>There aren't any comments yet.</div>}
            {considerationComments.map(comment => (
                <div key={comment._id} className="comment">
                    <div className="comment-content">
                        <p className="comment-text">{comment.text}</p>
                        {/*<button className="comment-action-button">Reply</button>*/}
                    </div>
                    <VotingModule
                        votableItem={comment}
                        onVoteSuccess={handleVoteSuccess}
                        voteEndpoint={`considerations/${considerationId}/comment/${comment._id}/vote`}
                    />
                </div>
            ))}
            <CommentInput
                onSuccessfulSubmit={onAddingCommentSuccess}
                parentId={considerationId}
            />
        </div>
    );
};

export default CommentSection;