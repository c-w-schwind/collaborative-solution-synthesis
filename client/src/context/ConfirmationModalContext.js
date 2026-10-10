import {createContext, useCallback, useContext, useMemo, useRef, useState} from "react";
import ConfirmationModal from "../components/CommonComponents/ConfirmationModal";

const ConfirmationModalContext = createContext();

export const ConfirmationModalProvider = ({children}) => {
    const [confirmationModalContent, setConfirmationModalContent] = useState({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => {},
        onCancel: () => {},
        buttonMode: "standard",
        followUp: false,
        size: 400,
        entityType: "Solution"
    });
    const isModalOpenRef = useRef(false);

    // entityType only required for "publish" button mode
    const showConfirmationModal = useCallback(({title, message, onConfirm, onCancel, entityType, buttonMode = "standard", size = 400, followUp = false, followUpMessage}) => {
        isModalOpenRef.current = true;
        if (!followUp) {
            setConfirmationModalContent({isOpen: true, title, message, onConfirm, onCancel, entityType, buttonMode, followUp, size});
        } else {
            setConfirmationModalContent({
                isOpen: true,
                title,
                message,
                onConfirm: () => showConfirmationModal({
                    title: "WARNING",
                    message: followUpMessage ? followUpMessage : "This action cannot be undone.\n\nDo you want to proceed?",
                    onConfirm: onConfirm,
                    entityType,
                    buttonMode: buttonMode === "submit_for_review" ? "initiate_review" : buttonMode,
                    followUp: false
                }),
                onCancel,
                entityType,
                buttonMode,
                followUp,
                size
            });
        }

    },[]);

    const hideConfirmationModal = useCallback(() => {
        isModalOpenRef.current = false;
        setConfirmationModalContent(prev => ({...prev, isOpen: false}));
    },[]);

    const value = useMemo(() => ({
        showConfirmationModal, isModalOpenRef
    }), [showConfirmationModal]);

    return (
        <ConfirmationModalContext.Provider value={value}>
            {children}
            <ConfirmationModal
                isOpen={confirmationModalContent.isOpen}
                title={confirmationModalContent.title}
                message={confirmationModalContent.message}
                onConfirm={() => {
                    if (confirmationModalContent.onConfirm) confirmationModalContent.onConfirm();
                    if (!confirmationModalContent.followUp) hideConfirmationModal();
                }}
                onCancel={() => {
                    if (confirmationModalContent.onCancel) confirmationModalContent.onCancel();
                    hideConfirmationModal();
                }}
                entityType={confirmationModalContent.entityType}
                buttonMode={confirmationModalContent.buttonMode}
                size={confirmationModalContent.size}
            />
        </ConfirmationModalContext.Provider>
    );
};

export const useConfirmationModal = () => {
    const context = useContext(ConfirmationModalContext);
    if (context === undefined) {
        throw new Error('useConfirmationModal must be used within a ConfirmationModalProvider');
    }
    return context;
};