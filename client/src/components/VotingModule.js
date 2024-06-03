import './VotingModule.css';
import {useToasts} from "../context/ToastContext";

const VotingModule = ({votableItem, onVoteSuccess, voteEndpoint}) => {
    const {addToast} = useToasts();

    const handleVote = async (voteType) => {
        const token = localStorage.getItem('token');
        if (!token) {
            return addToast('Please log in to cast your vote.');
        }

        const vote = {vote: voteType};
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/${voteEndpoint}`, {
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
            onVoteSuccess(data);
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    };

    return (
        <div className="voting-module">
            <section>
                <div>{votableItem.votes.upvotes.length}</div>
                <button className="vote-button upvote" onClick={() => handleVote('upvote')}>^</button>
            </section>
            <section>
                <div>{votableItem.votes.downvotes.length}</div>
                <button className="vote-button downvote" onClick={() => handleVote('downvote')}>v</button>
            </section>
        </div>
    );
};

export default VotingModule;