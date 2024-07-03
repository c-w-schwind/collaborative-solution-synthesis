import {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import {formConfigurations} from "../components/Forms/formConfigurations";
import {useLocation} from "react-router-dom";

const FormDataContext = createContext();

export const FormDataProvider = ({children}) => {
    const initFormData = (config) => config.reduce((acc, field) => ({...acc, [field.name]: ''}), {});

    const [solutionFormData, setSolutionFormData] = useState(initFormData(formConfigurations.solutionForm));
    const [elementFormData, setElementFormData] = useState(initFormData(formConfigurations.elementForm));
    const [considerationFormData, setConsiderationFormData] = useState(initFormData(formConfigurations.considerationForm));
    const [commentFormData, setCommentFormData] = useState(initFormData(formConfigurations.commentForm));
    const [discussionSpaceFormData, setDiscussionSpaceFormData] = useState(initFormData(formConfigurations.discussionSpaceForm));
    const [registrationFormData, setRegistrationFormData] = useState(initFormData(formConfigurations.registrationForm));

    const [openedConsiderationFormId, setOpenedConsiderationFormId] = useState(null);
    const [openedCommentSectionId, setOpenedCommentSectionId] = useState(null);
    const [isElementFormOpen, setIsElementFormOpen] = useState(false);
    const [modalNavigationDetected, setModalNavigationDetected] = useState(false)

    const location = useLocation();
    let previousPathRef = useRef(location.pathname.split("/").includes("element") ? "element" : "solution");

    useEffect(() => {
        const currentPathSegment = location.pathname.split("/").includes("element") ? "element" : "solution";
        setModalNavigationDetected(previousPathRef.current !== currentPathSegment);
        previousPathRef.current = currentPathSegment;
    }, [location]);

    const isSolutionFormFilled = useMemo(() =>
        Object.values(solutionFormData).some(val => val.trim() !== ''),
        [solutionFormData]
    );

    const isElementFormFilled = useMemo(() =>
        Object.values(elementFormData).some(val => val.trim() !== ''),
        [elementFormData]
    );

    const isConsiderationFormFilled = useMemo(() =>
        Object.values(considerationFormData).some(val => val.trim() !== ''),
        [considerationFormData]
    );

    const isCommentFormFilled = useMemo(() =>
        Object.values(commentFormData).some(val => val.trim() !== ''),
        [commentFormData]
    );

    const isDiscussionSpaceFormFilled = useMemo(() =>
        Object.values(discussionSpaceFormData).some(val => val.trim() !== ''),
        [discussionSpaceFormData]
    );


    const wipeFormData = useCallback(({wipeAll, wipeSolutionForm, wipeElementForm, wipeConsiderationForm, wipeCommentForm, wipeDiscussionSpaceForm, wipeRegistrationFormData}) => {
        const shouldWipe = flag => wipeAll || flag;

        shouldWipe(wipeSolutionForm) && setSolutionFormData(initFormData(formConfigurations.solutionForm));
        shouldWipe(wipeElementForm) && setElementFormData(initFormData(formConfigurations.elementForm));
        shouldWipe(wipeConsiderationForm) && setConsiderationFormData(initFormData(formConfigurations.considerationForm));
        shouldWipe(wipeCommentForm) && setCommentFormData(initFormData(formConfigurations.commentForm));
        shouldWipe(wipeDiscussionSpaceForm) && setDiscussionSpaceFormData(initFormData(formConfigurations.discussionSpaceForm));
        shouldWipe(wipeRegistrationFormData) && setRegistrationFormData(initFormData(formConfigurations.registrationForm));
    }, []);


    // Manages form states during browser navigations. Ensures that open forms are appropriately closed or reset based on their presence in the
    // DOM and user input. Warns users of potential data loss before making any changes, and provides instructions on how to save their data
    const handleBrowserNavigation = useCallback(() => {
        // Check if specific forms are still present in the DOM after navigation
        const solutionFormExists = document.querySelector(".solution-form") !== null; //TODO: doesn't exist yet
        const elementFormExists = document.querySelector(".solution-details-add-card-button-container") !== null;
        const considerationFormExists = document.querySelector(".solution-details-add-card-button-container") !== null;
        const commentFormExists = document.querySelector(".comments-container") !== null;
        const discussionSpaceFormExists = document.querySelector(".discussion-space-input-area") !== null;

        // Determine forms that need data wiped based on non-existence, filled state, and navigation to or from modal
        const solutionFormNeedsWiping = isSolutionFormFilled && !solutionFormExists;
        const elementFormNeedsWiping = isElementFormFilled && !elementFormExists;
        const considerationFormNeedsWiping = isConsiderationFormFilled && (!considerationFormExists || modalNavigationDetected);
        const commentFormNeedsWiping = isCommentFormFilled && (!commentFormExists || modalNavigationDetected);
        const discussionSpaceFormNeedsWiping = isDiscussionSpaceFormFilled && !discussionSpaceFormExists;

        // List forms that contain unsaved data
        let formsWithUnsavedData = [];
        if (solutionFormNeedsWiping) formsWithUnsavedData.push("Solution Proposal Form");
        if (elementFormNeedsWiping) formsWithUnsavedData.push("Element Proposal Form");
        if (considerationFormNeedsWiping) formsWithUnsavedData.push("Consideration Form");
        if (commentFormNeedsWiping) formsWithUnsavedData.push("Comment Form");
        if (discussionSpaceFormNeedsWiping) formsWithUnsavedData.push("Discussion Space Form");

        // Timeout ensures that the warning message appears only after the new page has become visible, preventing confusion where the
        // warning might precede the completion of navigation, leading users to see the dialog on a page they are navigating away from
        setTimeout(() => {
            // Warn if any form that disappeared is still filled
            const message = `Warning!\n\nYou closed ${formsWithUnsavedData.length > 1 ? "multiple forms" : "a form"} by using your browser's 'back' or 'forward' buttons. Unsaved changes in the following form${formsWithUnsavedData.length > 1 ? "s" : ""} will be lost:\n - ${formsWithUnsavedData.join('\n - ')}\n\nPress 'OK' to discard your input.\n\nIf you want to keep your work, please follow these steps:\n1. Press 'Cancel' in this dialog.\n2. Use the browser's opposite navigation button ('back' or 'forward') to return to the page where you entered the data. This warning may appear again; press 'Cancel' if it does.\n3. Once back on the correct page, ensure you save or submit your changes before navigating away.`;
            if (formsWithUnsavedData.length > 0 && !window.confirm(message)) {
                return;
            }
            // Wipe data only for forms that don't exist in the DOM
            wipeFormData({
                wipeSolutionForm: solutionFormNeedsWiping,
                wipeElementForm: elementFormNeedsWiping,
                wipeConsiderationForm: considerationFormNeedsWiping,
                wipeCommentForm: commentFormNeedsWiping,
                wipeDiscussionSpaceForm: discussionSpaceFormNeedsWiping
            });

            // Close disappeared forms based on their open state
            if (!elementFormExists && isElementFormOpen) setIsElementFormOpen(false);
            if ((!considerationFormExists || modalNavigationDetected) && openedConsiderationFormId) setOpenedConsiderationFormId(null);
            if ((!commentFormExists || modalNavigationDetected) && openedCommentSectionId) setOpenedCommentSectionId(null);
        });

    }, [isSolutionFormFilled, isElementFormFilled, isConsiderationFormFilled, isCommentFormFilled, isDiscussionSpaceFormFilled, isElementFormOpen, openedConsiderationFormId, openedCommentSectionId, wipeFormData, modalNavigationDetected]);


    // Allows selective navigation checks and form data wiping. Prompts users only if specified forms have unsaved data,
    // enabling navigation while preserving or ignoring certain fields as needed. Closes open forms on navigation.
    const canNavigate = useCallback(({checkSolutionForm, checkElementForm, checkConsiderationForm, checkCommentForm, checkDiscussionSpaceForm, checkAll, saveDiscussionSpaceData, saveElementFormData}) => {
        const filledForms = [];

        if (checkAll) {
            checkSolutionForm = true;
            checkElementForm = true;
            checkConsiderationForm = true;
            checkCommentForm = true;
            checkDiscussionSpaceForm = true;
        }

        if (checkSolutionForm && isSolutionFormFilled) filledForms.push("Solution Proposal Form");
        if (checkElementForm && isElementFormFilled) filledForms.push("Solution Element Proposal Form");
        if (checkConsiderationForm && isConsiderationFormFilled) filledForms.push("Consideration Form");
        if (checkCommentForm && isCommentFormFilled) filledForms.push("Comment Form");
        if (checkDiscussionSpaceForm && isDiscussionSpaceFormFilled) filledForms.push("Discussion Space Form");

        if (filledForms.length > 0) {
            const pluralSuffix = filledForms.length > 1 ? "s" : "";
            const filledFormsMessage = filledForms.map(form => `   - ${form}`).join("\n");
            const discussionSpaceMessage = saveDiscussionSpaceData && isDiscussionSpaceFormFilled
                ? "\nYour Discussion Space input will be transmitted into the fullscreen view.\n"
                : "";
            const elementFormMessage = saveElementFormData && isElementFormFilled
                ? "\\nYour Solution Element Proposal input will be preserved and still available.\n"
                : "";
            const confirmationMessage = `Warning!\n\nYou have unsaved text in the following form${pluralSuffix}:\n${filledFormsMessage}\nContinuing will delete your input${pluralSuffix}.\n${discussionSpaceMessage}${elementFormMessage}\nProceed?`;

            if (!window.confirm(confirmationMessage)) {
                return false;
            }

            wipeFormData({
                wipeSolutionForm: checkSolutionForm,
                wipeElementForm: checkElementForm,
                wipeConsiderationForm: checkConsiderationForm,
                wipeCommentForm: checkCommentForm,
                wipeDiscussionSpaceForm: saveDiscussionSpaceData ? false : checkDiscussionSpaceForm
            });
        }

        // Close relevant open forms & sections when navigating away
        if (checkCommentForm) setOpenedCommentSectionId(null);
        if (checkConsiderationForm) setOpenedConsiderationFormId(null);
        if (checkElementForm) setIsElementFormOpen(false);

        return true;
    }, [isSolutionFormFilled, isElementFormFilled, isConsiderationFormFilled, isCommentFormFilled, isDiscussionSpaceFormFilled, wipeFormData]);


    const toggleElementForm = useCallback((askUser = true, ref) => {
        if (askUser && isElementFormOpen && isElementFormFilled) {
            if (!window.confirm(`You have unsaved text in this form. Closing it will delete your input. Proceed?`)) {
                return;
            }
            wipeFormData({wipeElementForm: true});
        }

        if (!isElementFormOpen && ref?.current) {
            setTimeout(() => {
                ref.current.scrollIntoView({behavior: "smooth", block: "center"});
            }, 300); // Matching animation's completion time
        }

        setIsElementFormOpen(prevState => !prevState);
    }, [isElementFormFilled, isElementFormOpen, wipeFormData]);


    // Use "generalConsiderationForm" for the general consideration form instead of editing a specific one.
    const toggleConsiderationForm = useCallback((considerationId, ref, warnUser = true) => {    //TODO OOOOO
        setOpenedConsiderationFormId((prevId) => {
            const sameForm = prevId === considerationId;
            const message = `You have unsaved text in ${sameForm ? "this" : openedConsiderationFormId === "generalConsiderationForm" ? "the \"Add Consideration\"" : "another opened consideration"} form. ${sameForm ? "Closing it" : "Opening this one"} will delete your ${sameForm ? "input" : "other input"}. Proceed?`;

            if (isConsiderationFormFilled && warnUser && !window.confirm(message)) return prevId;
            if (isConsiderationFormFilled) setConsiderationFormData(initFormData(formConfigurations.considerationForm));
            if (sameForm) return null;

            if (ref?.current) {
                setTimeout(() => {
                    ref.current.scrollIntoView({behavior: "smooth", block: "center"});
                }, 300); // Matching animation's completion time
            }

            return considerationId;
        });
    }, [isConsiderationFormFilled, openedConsiderationFormId]);


    const toggleCommentSection = useCallback((considerationId, ref) => {
        setOpenedCommentSectionId(prevId => {
            const sameForm = prevId === considerationId;
            const message = `You have unsaved text in ${sameForm ? "this" : "a different"} comment form. ${sameForm ? "Closing it" : "Opening this one"} will delete your ${sameForm ? "input" : "other comment"}. Proceed?`;

            if (isCommentFormFilled && !window.confirm(message)) return prevId;
            if (isCommentFormFilled) {
                setTimeout(() => {
                    setCommentFormData(initFormData(formConfigurations.commentForm));
                }, 150);    // 1/2 of 300ms closing animation - input field shouldn't be visible anymore (or yet, if opening new comment section)
            }
            if (sameForm) return null;

            setTimeout(() =>{
                if (ref?.current) {
                    const refPosition = ref.current.getBoundingClientRect().top + window.scrollY;
                    const offsetPosition = refPosition - 250;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                }
            }, 300); // Matching animation's completion time

            return considerationId;
        });
    }, [isCommentFormFilled]);


    const value = useMemo(() => ({
        solutionFormData,
        elementFormData,
        considerationFormData,
        commentFormData,
        discussionSpaceFormData,
        registrationFormData,

        setSolutionFormData,
        setElementFormData,
        setConsiderationFormData,
        setCommentFormData,
        setDiscussionSpaceFormData,
        setRegistrationFormData,

        handleBrowserNavigation,
        canNavigate,
        wipeFormData,

        toggleElementForm,
        toggleConsiderationForm,
        toggleCommentSection,

        isElementFormOpen,
        openedConsiderationFormId,
        openedCommentSectionId
    }), [
        solutionFormData,
        elementFormData,
        considerationFormData,
        commentFormData,
        discussionSpaceFormData,
        registrationFormData,

        handleBrowserNavigation,
        canNavigate,
        wipeFormData,

        toggleElementForm,
        toggleConsiderationForm,
        toggleCommentSection,

        isElementFormOpen,
        openedConsiderationFormId,
        openedCommentSectionId
    ]);

    return (
        <FormDataContext.Provider value={value}>
            {children}
        </FormDataContext.Provider>
    );
};

export function useFormData() {
    const context = useContext(FormDataContext);
    if (context === undefined) {
        throw new Error('useFormData must be used within a FormDataProvider');
    }
    return context;
}