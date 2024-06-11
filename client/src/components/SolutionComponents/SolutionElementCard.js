import {useNavigate} from "react-router-dom";
import {useFormData} from "../../context/FormDataContext";


const SolutionElementCard = ({element, onToggleDiscussionSpace, isDiscussionSpaceOpen}) => {
    const navigate = useNavigate();
    const {canNavigate} = useFormData();

    const handleClick = () => {
        if (canNavigate({checkAll: true})) {
            const navigateToElement = () => navigate(`./element/${element.elementNumber}`, {state: {fromElementCard: true}});
            if (!isDiscussionSpaceOpen) {
                navigateToElement();
            } else {
                onToggleDiscussionSpace(false);

                const discussionSpaceContainer = document.querySelector('.discussion-space-container');

                if (discussionSpaceContainer) {
                    discussionSpaceContainer.addEventListener('transitionend', function onTransitionEnd(event) {
                        if (event.propertyName === 'opacity') {
                            discussionSpaceContainer.removeEventListener('transitionend', onTransitionEnd);
                            setTimeout(navigateToElement, 5); // Brief delay ensures correct registration of navigation sequence, preventing re-open of discussion space on modal close.
                        }
                    });
                }
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