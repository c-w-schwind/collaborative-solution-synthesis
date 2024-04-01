import './Consideration.css';

const ConsiderationCard = ({ consideration }) => {
    return (
        <div className="consideration">
            <div className="consideration-content">
                <div className="consideration-text">
                    <h4 className="consideration-title">{consideration.title} ({consideration.stance.toUpperCase()})</h4>
                    <p>{consideration.description}</p>
                </div>
                <div className="consideration-actions">
                    <button className="add-comment-button">Add Comment</button>
                </div>
            </div>
        </div>
    );
};

export default ConsiderationCard;