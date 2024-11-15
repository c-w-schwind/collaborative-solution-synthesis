import {createContext, useCallback, useContext, useMemo, useState} from "react";
import ConfirmationModal from "../components/CommonComponents/ConfirmationModal";

const ConfirmationModalContext = createContext();

export const ConfirmationModalProvider = ({children}) => {
    const [confirmationModalContent, setConfirmationModalContent] = useState({
        isVisible: false,
        title: "",
        message: "",
        onConfirm: () => {},
        onCancel: () => {},
        buttonMode: "standard",
        followUp: false,
        size: "400"
    });

    const showConfirmationModal = useCallback(({title, message, onConfirm, onCancel, buttonMode = "standard", size = "400", followUp = false, followUpMessage}) => {
        if (!followUp) {
            setConfirmationModalContent({isVisible: true, title, message, onConfirm, onCancel, buttonMode, followUp, size});
        } else {
            setConfirmationModalContent({
                isVisible: true,
                title,
                message,
                onConfirm: () => showConfirmationModal({
                    isVisible: true,
                    title: "WARNING",
                    message: followUpMessage ? followUpMessage : "This action cannot be undone.\n\nDo you want to proceed?",
                    onConfirm: onConfirm,
                    buttonMode: buttonMode === "submit_for_review" ? "initiate_review" : buttonMode,
                    followUp: false
                }),
                onCancel,
                buttonMode,
                followUp,
                size
            });
        }

    },[]);

    const hideConfirmationModal = useCallback(() => {
        setConfirmationModalContent(prev => ({...prev, isVisible: false}));
    },[]);

    const value = useMemo(() => ({
        showConfirmationModal, confirmationModalContent
    }), [showConfirmationModal, confirmationModalContent]);

    return (
        <ConfirmationModalContext.Provider value={value}>
            {children}
            <ConfirmationModal
                isVisible={confirmationModalContent.isVisible}
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