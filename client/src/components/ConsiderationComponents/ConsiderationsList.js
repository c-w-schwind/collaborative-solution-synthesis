import './Consideration.css';
import ConsiderationCard from './ConsiderationCard';

const ConsiderationsList = ({considerations}) => {
    const handleAddConsideration = () => {};

    return (
        <div className="solution-details-list-container">
            <h3 className="solution-details-list-container-title">Considerations</h3>
            {considerations.length > 0 ? (
                <div className="solution-details-list">
                    {considerations.map(consideration => (
                        <ConsiderationCard key={consideration._id} consideration={consideration}/>
                    ))}
                </div>
            ) : (
                <p>No considerations yet.</p>
            )}
            <div className="solution-details-add-card-button-container">
                <button className="solution-details-add-card-button" onClick={handleAddConsideration}>Add Consideration</button>
            </div>
        </div>
    );
};

export default ConsiderationsList;