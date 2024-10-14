import {createContext, useCallback, useContext, useMemo, useState} from "react";
import ConfirmationModal from "../components/ConfirmationModal";

const ConfirmationModalContext = createContext();

export const ConfirmationModalProvider = ({children}) => {
    const [confirmationModalContent, setConfirmationModalContent] = useState({
        isVisible: false,
        title: "",
        message: "",
        onConfirm: () => {},
        onCancel: () => {},
        mode: "standard",
        followUp: false,
        size: "400"
    });

    const showConfirmationModal = useCallback(({title, message, onConfirm, onCancel, mode = "standard", followUp = false, size = "400"}) => {
        setConfirmationModalContent({isVisible: true, title, message, onConfirm, onCancel, mode, followUp, size});
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
                mode={confirmationModalContent.mode}
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