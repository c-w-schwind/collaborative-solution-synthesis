import "./VotingModule.css";
import {useState} from "react";
import {useToasts} from "../context/ToastContext";
import {useAuth} from "../context/AuthContext";

const VotingModule = ({votableItem, onVoteSuccess, voteEndpoint}) => {
    const [pendingVote, setPendingVote] = useState(null);

    const addToast = useToasts();
    const {user} = useAuth();


    const handleVote = async (voteType) => {
        if (pendingVote !== null) return;

        const token = localStorage.getItem("token");

        if (!token) {
            addToast("Please log in to cast your vote.");
            return;
        }

        setPendingVote(voteType);

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/${voteEndpoint}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({vote: voteType})
            });

            if (!response.ok) {
                console.error(`Voting failed with HTTP status ${response.status}`);
                addToast("An error occurred while voting. Please try again.");
                return;
            }

            const data = await response.json();
            onVoteSuccess(data);
        } catch (error) {
            console.error("Voting failed:", error);
            addToast("An error occurred while voting. Please try again.");
        } finally {
            setPendingVote(null);
        }
    };

    const userHasVoted = (voteType) => Boolean(user?._id && votableItem.votes[voteType].includes(user._id));

    const upvoteClass = userHasVoted("upvotes") ? "user-has-voted" : userHasVoted("downvotes") ? "opposite-vote-upvote" : "";
    const downvoteClass = userHasVoted("downvotes") ? "user-has-voted" : userHasVoted("upvotes") ? "opposite-vote-downvote" : "";

    return (
        <div className="voting-module">
            <section>
                <div>{votableItem.votes.upvotes.length}</div>
                <button
                    type="button"
                    className={`vote-button upvote ${upvoteClass}`}
                    onClick={() => handleVote("upvote")}
                    disabled={pendingVote !== null}
                    aria-label="Upvote"
                    aria-pressed={userHasVoted("upvotes")}
                >
                    {pendingVote === "upvote"
                        ? <span className="vote-spinner" aria-hidden="true"/>
                        : "Λ"}
                </button>
            </section>
            <section>
                <div>{votableItem.votes.downvotes.length}</div>
                <button
                    type="button"
                    className={`vote-button downvote ${downvoteClass}`}
                    onClick={() => handleVote("downvote")}
                    disabled={pendingVote !== null}
                    aria-label="Downvote"
                    aria-pressed={userHasVoted("downvotes")}
                >
                    {pendingVote === "downvote"
                        ? <span className="vote-spinner" aria-hidden="true"/>
                        : "V"}
                </button>
            </section>
        </div>
    );
};

export default VotingModule;