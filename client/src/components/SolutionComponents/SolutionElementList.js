import SolutionElementCard from "./SolutionElementCard.js";

const SolutionElementsList = ({elements}) => {

    const handleAddElement = () => {};

    return (
        <div className="solution-details-list-container">
            <h3 className="solution-details-list-container-title">Solution Elements</h3>
            <div className="solution-details-list">
                {elements.map(element => (
                    <SolutionElementCard key={element._id} element={element}/>
                ))}
            </div>
            <div className="solution-details-add-card-button-container">
                <button className="solution-details-add-card-button" onClick={handleAddElement}>Propose New Element</button>
            </div>
        </div>
    );
};

export default SolutionElementsList;