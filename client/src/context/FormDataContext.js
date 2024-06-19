import {createContext, useCallback, useContext, useMemo, useState} from "react";
import {formConfigurations} from "../components/Forms/formConfigurations";

const FormDataContext = createContext();

export const FormDataProvider = ({children}) => {
    const initFormData = (config) => config.reduce((acc, field) => ({...acc, [field.name]: ''}), {});

    const [discussionSpaceFormData, setDiscussionSpaceFormData] = useState(initFormData(formConfigurations.discussionSpaceForm));
    const [considerationFormData, setConsiderationFormData] = useState(initFormData(formConfigurations.considerationForm));
    const [commentFormData, setCommentFormData] = useState(initFormData(formConfigurations.commentForm));
    const [registrationFormData, setRegistrationFormData] = useState(initFormData(formConfigurations.registrationForm));

    const [openedCommentSectionId, setOpenedCommentSectionId] = useState(null);
    const [openedConsiderationFormId, setOpenedConsiderationFormId] = useState(null);


    const isDiscussionSpaceFormFilled = useMemo(() =>
        Object.values(discussionSpaceFormData).some(val => val.trim() !== ''),
        [discussionSpaceFormData]
    );

    const isConsiderationFormFilled = useMemo(() =>
        Object.values(considerationFormData).some(val => val.trim() !== ''),
        [considerationFormData]
    );

    const isCommentFormFilled = useMemo(() =>
        Object.values(commentFormData).some(val => val.trim() !== ''),
        [commentFormData]
    );

    const wipeFormData = useCallback(({wipeDiscussionSpaceForm, wipeConsiderationForm, wipeCommentForm, wipeRegistrationFormData}) => {
        wipeDiscussionSpaceForm && setDiscussionSpaceFormData(initFormData(formConfigurations.discussionSpaceForm));
        wipeConsiderationForm && setConsiderationFormData(initFormData(formConfigurations.considerationForm));
        wipeCommentForm && setCommentFormData(initFormData(formConfigurations.commentForm));
        wipeRegistrationFormData && setRegistrationFormData(initFormData(formConfigurations.registrationForm));
    },[]);

    // Allows selective navigation checks and form data wiping. Prompts users only if specified forms
    // have unsaved data, enabling navigation while preserving or ignoring certain fields as needed.
    const canNavigate = useCallback(({checkDiscussionSpaceForm, checkConsiderationForm, checkCommentForm, checkAll, saveDiscussionSpaceData}) => {
        const filledForms = [];

        if (checkAll) {
            checkDiscussionSpaceForm = true;
            checkConsiderationForm = true;
            checkCommentForm = true;
        }

        if (checkDiscussionSpaceForm && isDiscussionSpaceFormFilled) filledForms.push("Discussion Space Form");
        if (checkConsiderationForm && isConsiderationFormFilled) filledForms.push("Consideration Form");
        if (checkCommentForm && isCommentFormFilled) filledForms.push("Comment Form");

        if (filledForms.length > 0) {
            const filledFormsMessage = filledForms.map(form => `   - ${form}`).join("\n");
            const pluralSuffix = filledForms.length > 1 ? "s" : "";

            if (!window.confirm(`Warning!\n\nYou have unsaved text in the following form${pluralSuffix}:\n${filledFormsMessage}\nContinuing will delete your input${pluralSuffix}.\n${saveDiscussionSpaceData && isDiscussionSpaceFormFilled ? "\nYour Discussion Space input will be transmitted into full screen view.\n" : ""}\nProceed?`)) {
                return false;
            }

            wipeFormData({
                wipeDiscussionSpaceForm: saveDiscussionSpaceData ? false : checkDiscussionSpaceForm,
                wipeConsiderationForm: checkConsiderationForm,
                wipeCommentForm: checkCommentForm
            });
        }

        // Close open comment section when navigating away from a consideration form
        if (checkCommentForm) setOpenedCommentSectionId(null);
        if (checkConsiderationForm) setOpenedConsiderationFormId(null);

        return true;
    },[isDiscussionSpaceFormFilled, isConsiderationFormFilled, isCommentFormFilled, wipeFormData]);

    const toggleCommentSection = useCallback((considerationId) => {
        setOpenedCommentSectionId(prevId => {
            const sameForm = prevId === considerationId;
            if (isCommentFormFilled && !window.confirm(`You have unsaved text in ${sameForm ? "this" : "a different"} comment form. ${sameForm ? "Closing it" : "Opening this one"} will delete your ${sameForm ? "input" : "other comment"}. Proceed?`)) {
                return prevId;
            }

            if (isCommentFormFilled) {
                setTimeout(() => {
                    setCommentFormData(initFormData(formConfigurations.commentForm));
                }, 150);    // 1/2 of 300ms closing animation - input field shouldn't be visible anymore (or yet, if opening new comment section)
            }

            return sameForm ? null : considerationId;
        });
    },[isCommentFormFilled]);

    // Use "generalConsiderationForm" for the general consideration form instead of editing a specific one.
    const toggleConsiderationForm = useCallback((considerationId) => {
        setOpenedConsiderationFormId((prevId) => {
            const sameForm = prevId === considerationId;
            if (isConsiderationFormFilled && !window.confirm(`You have unsaved text in ${sameForm ? "this" : openedConsiderationFormId === "generalConsiderationForm" ? "the \"Add Consideration\"" : "another opened consideration"} form. ${sameForm ? "Closing it" : "Opening this one"} will delete your ${sameForm ? "input" : "other input"}. Proceed?`)) {
                return prevId;
            }

            if (isConsiderationFormFilled) {
                setConsiderationFormData(initFormData(formConfigurations.considerationForm));
            }

            return sameForm ? null : considerationId;
        });
    },[isConsiderationFormFilled, openedConsiderationFormId]);

    const value = useMemo(() => ({
        discussionSpaceFormData,
        setDiscussionSpaceFormData,
        considerationFormData,
        setConsiderationFormData,
        commentFormData,
        setCommentFormData,
        registrationFormData,
        setRegistrationFormData,
        isDiscussionSpaceFormFilled,
        isConsiderationFormFilled,
        isCommentFormFilled,
        canNavigate,
        wipeFormData,
        toggleCommentSection,
        openedCommentSectionId,
        toggleConsiderationForm,
        openedConsiderationFormId
    }), [
        discussionSpaceFormData,
        considerationFormData,
        commentFormData,
        registrationFormData,
        isDiscussionSpaceFormFilled,
        isConsiderationFormFilled,
        isCommentFormFilled,
        canNavigate,
        wipeFormData,
        openedCommentSectionId,
        toggleCommentSection,
        openedConsiderationFormId,
        toggleConsiderationForm
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