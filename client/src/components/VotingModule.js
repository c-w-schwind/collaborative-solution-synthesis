import './VotingModule.css';
import {useToasts} from "../context/ToastContext";
import {useAuth} from "../context/AuthContext";
import {useEffect, useState} from "react";

const VotingModule = ({votableItem, onVoteSuccess, voteEndpoint}) => {
    const [userId, setUserId] = useState(null);

    const {addToast} = useToasts();
    const {user} = useAuth();

    useEffect(() => {
        if(user) {
            setUserId(user._id);
        }
    }, [user]);

    const handleVote = async (voteType) => {
        const token = localStorage.getItem('token');
        if (!token) {
            return addToast('Please log in to cast your vote.');
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/${voteEndpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({vote: voteType})
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            onVoteSuccess(data);
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            addToast('An error occurred while voting. Please try again.');
        }
    };

    const userHasVoted = (voteType) => votableItem.votes[voteType].includes(userId);

    const upvoteClass = userHasVoted("upvotes") ? "user-has-voted" : userHasVoted("downvotes") ? "opposite-vote-upvote" : "";
    const downvoteClass = userHasVoted("downvotes") ? "user-has-voted" : userHasVoted("upvotes") ? "opposite-vote-downvote" : "";

    return (
        <div className="voting-module">
            <section>
                <div>{votableItem.votes.upvotes.length}</div>
                <button className={`vote-button upvote ${upvoteClass}`} onClick={() => handleVote('upvote')}>Λ</button>
            </section>
            <section>
                <div>{votableItem.votes.downvotes.length}</div>
                <button className={`vote-button downvote ${downvoteClass}`} onClick={() => handleVote('downvote')}>V</button>
            </section>
        </div>
    );
};

export default VotingModule;