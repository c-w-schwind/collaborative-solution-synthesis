import {useNavigate, useParams} from "react-router-dom";

const SolutionElementCard = ({element}) => {
    const navigate = useNavigate();
    const {solutionNumber} = useParams();

    const handleClick = () => {
        navigate(`/solutions/${solutionNumber}/element/${element._id}`, {state: {fromElementCard: true}});
    }

    return (
        <>
            <div className={"solution-details-card"} onClick={handleClick} style={{cursor: "pointer"}}>
                    <h4>{element.title} ({element.elementType})</h4>
                    <p>{element.overview}</p>
            </div>
        </>
    );
};

export default SolutionElementCard;