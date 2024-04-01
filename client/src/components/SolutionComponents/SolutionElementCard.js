const SolutionElementCard = ({element}) => {
    return (
        <>
            <div className={"solution-details-card"}>
                    <h4>{element.title} ({element.elementType})</h4>
                    <p>{element.overview}</p>
            </div>
        </>
    );
};

export default SolutionElementCard;