import "./ProposeChangeButton.css";
import useOutsideClick from "../../hooks/useOutsideClickHook";
import {useCallback, useState} from "react";
import {EDIT_ICON_SRC} from "../../constants";
import {useConfirmationModal} from "../../context/ConfirmationModalContext";
import {useLoading} from "../../context/LoadingContext";
import {handleRequest} from "../../services/solutionApiService";
import {useToasts} from "../../context/ToastContext";


const ProposeChangeButton = ({entityType, entityTitle, entityNumber, onClosingModal}) => {
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    const {addToast} = useToasts();
    const {showLoading, hideLoading} = useLoading();
    const {showConfirmationModal} = useConfirmationModal();

    const menuRef = useOutsideClick(() => setIsMenuVisible(false));


    const createChangeProposal = useCallback(async () => {
        showLoading(`Creating Change Proposal for\n"${entityTitle}"`);
        const requestEntityType = entityType === "Solution" ? "solution" : "element";

        try {
            const changeProposalResponse = await handleRequest("POST", requestEntityType, entityNumber, "changeProposal");
            onClosingModal(`../element/${changeProposalResponse.elementNumber}`);
            addToast(`Successfully created Change Proposal for "${entityTitle}"`);
        } catch (err) {
            console.error(`Failed to create change proposal for ${entityType}:`, err);
            addToast("Failed to create a Change Proposal. Please try again.", 8000);
        } finally {
            hideLoading();
        }
    }, [showLoading, entityTitle, entityType, entityNumber, onClosingModal, addToast, hideLoading]);

    const handleCreateChangeProposal = () => {
        setIsMenuVisible(false);
        const modalMessage = <>You are about to create a <strong>Change Proposal</strong>.<br/><br/>This will ...</>;
        showConfirmationModal({title: "Proposing Changes", message: modalMessage, onConfirm: createChangeProposal, size: 500});
    };


    const createDeletionProposal = useCallback(async () => {
        // Create deletion proposal
    }, []);

    const handleCreateDeletionProposal = () => {
        setIsMenuVisible(false);
        const modalMessage = <>You are about to create a <strong>Deletion Proposal</strong>.<br/><br/>This will ...</>;
        showConfirmationModal({title: "Proposing Deletion", modalMessage, onConfirm: createChangeProposal});
    };


    const tooltipAttribute = isMenuVisible ? {} : entityType === "Solution"
        ? {'data-tooltip': "Propose Change"}
        : {'data-tooltip-down': "Propose Change"};

    return (
        <div ref={menuRef} className="propose-change-button-container">
            <button
                className={`action-button icon-action-button action-button--propose-changes ${isMenuVisible ? 'active' : ''}`}
                {...tooltipAttribute}
                onClick={() => setIsMenuVisible(!isMenuVisible)}
            >
                <img src={EDIT_ICON_SRC} alt="propose change"/>
            </button>
            {isMenuVisible && (
                <nav className="propose-change-menu">
                    <button className="propose-change-menu-item" onClick={handleCreateChangeProposal}>Create Change Proposal</button>
                    <button className="propose-change-menu-item" onClick={handleCreateDeletionProposal}>Create Deletion Proposal</button>
                </nav>
            )}
        </div>
    );
};

export default ProposeChangeButton;