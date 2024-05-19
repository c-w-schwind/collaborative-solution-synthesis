import {useNavigate} from "react-router-dom";


const SolutionElementCard = ({element, onToggleDiscussionSpace, isDiscussionSpaceOpen}) => {
    const navigate = useNavigate();

    const handleClick = () => {
        const navigateToElement = () => navigate(`./element/${element.elementNumber}`, {state: {fromElementCard: true}});
        if (!isDiscussionSpaceOpen) {
            navigateToElement();
        } else {
            onToggleDiscussionSpace();

            const discussionSpaceContainer = document.querySelector('.discussion-space-container');

            if (discussionSpaceContainer) {
                discussionSpaceContainer.addEventListener('transitionend', function onTransitionEnd(event) {
                    if (event.propertyName === 'opacity' || event.propertyName === 'width' || event.propertyName === 'left') {
                        discussionSpaceContainer.removeEventListener('transitionend', onTransitionEnd);
                        setTimeout(navigateToElement,5); // Brief delay ensures correct registration of navigation sequence, preventing re-open of discussion space on modal close.
                    }
                });
            }
        }
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