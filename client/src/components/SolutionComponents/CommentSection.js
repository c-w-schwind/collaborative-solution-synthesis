import './CommentSection.css';
import React, {useState} from 'react';


const CommentSection = ({ comments, considerationId }) => {
    const [considerationComments, setConsiderationComments] = useState(comments);

    const handleVote = async (considerationId, commentId, voteType) => {
        const vote = voteType === 'upvote' ? {vote: 'upvote'} : {vote: 'downvote'};
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/considerations/${considerationId}/comment/${commentId}/vote`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(vote)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            const updatedComment = data.comment;

            const updatedComments = considerationComments.map(considerationComment => {
                if (considerationComment._id === commentId) {
                    return updatedComment;
                }
                return considerationComment;
            });

            setConsiderationComments(updatedComments);
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    };

    return (
        <div className="comments-container">
            {considerationComments.map(comment => (
                <div key={comment._id} className="comment">
                    <div className="comment-content">
                        <p className="comment-text">{comment.text}</p>
                        <button className="add-comment-button">Reply</button>
                    </div>
                    <div className="comment-interactions">
                        <section>
                            <div>{comment.votes.upvotes.length}</div>
                            <button className="comment-upvote-button" onClick={() => handleVote(considerationId, comment._id, 'upvote')}>^</button>
                        </section>
                        <section>
                            <div>{comment.votes.downvotes.length}</div>
                            <button className="comment-downvote-button" onClick={() => handleVote(considerationId, comment._id, 'downvote')}>v</button>
                        </section>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CommentSection;