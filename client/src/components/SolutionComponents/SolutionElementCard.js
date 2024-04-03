import {useNavigate} from "react-router-dom";

const SolutionElementCard = ({element}) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`./element/${element.elementNumber}`, {state: {fromElementCard: true}});
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