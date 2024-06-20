import {createContext, useCallback, useContext, useMemo, useState} from "react";
import {formConfigurations} from "../components/Forms/formConfigurations";

const FormDataContext = createContext();

export const FormDataProvider = ({children}) => {
    const initFormData = (config) => config.reduce((acc, field) => ({...acc, [field.name]: ''}), {});

    const [solutionFormData, setSolutionFormData] = useState(initFormData(formConfigurations.solutionForm));
    const [elementFormData, setElementFormData] = useState(initFormData(formConfigurations.elementForm));
    const [considerationFormData, setConsiderationFormData] = useState(initFormData(formConfigurations.considerationForm));
    const [commentFormData, setCommentFormData] = useState(initFormData(formConfigurations.commentForm));
    const [discussionSpaceFormData, setDiscussionSpaceFormData] = useState(initFormData(formConfigurations.discussionSpaceForm));
    const [registrationFormData, setRegistrationFormData] = useState(initFormData(formConfigurations.registrationForm));

    const [openedCommentSectionId, setOpenedCommentSectionId] = useState(null);
    const [openedConsiderationFormId, setOpenedConsiderationFormId] = useState(null);


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

    const wipeFormData = useCallback(({wipeSolutionForm, wipeElementForm, wipeConsiderationForm, wipeCommentForm, wipeDiscussionSpaceForm, wipeRegistrationFormData}) => {
        wipeSolutionForm && setSolutionFormData(initFormData(formConfigurations.solutionForm));
        wipeElementForm && setElementFormData(initFormData(formConfigurations.elementForm));
        wipeConsiderationForm && setConsiderationFormData(initFormData(formConfigurations.considerationForm));
        wipeCommentForm && setCommentFormData(initFormData(formConfigurations.commentForm));
        wipeDiscussionSpaceForm && setDiscussionSpaceFormData(initFormData(formConfigurations.discussionSpaceForm));
        wipeRegistrationFormData && setRegistrationFormData(initFormData(formConfigurations.registrationForm));
    },[]);

    // Allows selective navigation checks and form data wiping. Prompts users only if specified forms have unsaved data,
    // enabling navigation while preserving or ignoring certain fields as needed. Closes open forms on navigation.
    const canNavigate = useCallback(({checkSolutionForm, checkElementForm, checkConsiderationForm, checkCommentForm, checkDiscussionSpaceForm, checkAll, saveDiscussionSpaceData}) => {
        const filledForms = [];

        if (checkAll) {
            checkSolutionForm = true;
            checkElementForm = true;
            checkConsiderationForm = true;
            checkCommentForm = true;
            checkDiscussionSpaceForm = true;
        }

        if (checkSolutionForm && isSolutionFormFilled) filledForms.push("Solution Form");
        if (checkElementForm && isElementFormFilled) filledForms.push("Solution Element Form");
        if (checkConsiderationForm && isConsiderationFormFilled) filledForms.push("Consideration Form");
        if (checkCommentForm && isCommentFormFilled) filledForms.push("Comment Form");
        if (checkDiscussionSpaceForm && isDiscussionSpaceFormFilled) filledForms.push("Discussion Space Form");

        if (filledForms.length > 0) {
            const filledFormsMessage = filledForms.map(form => `   - ${form}`).join("\n");
            const pluralSuffix = filledForms.length > 1 ? "s" : "";

            if (!window.confirm(`Warning!\n\nYou have unsaved text in the following form${pluralSuffix}:\n${filledFormsMessage}\nContinuing will delete your input${pluralSuffix}.\n${saveDiscussionSpaceData && isDiscussionSpaceFormFilled ? "\nYour Discussion Space input will be transmitted into full screen view.\n" : ""}\nProceed?`)) {
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

        // Close open forms & sections when navigating away
        if (checkCommentForm) setOpenedCommentSectionId(null);
        if (checkConsiderationForm) setOpenedConsiderationFormId(null);

        return true;
    },[isDiscussionSpaceFormFilled, isConsiderationFormFilled, isCommentFormFilled, wipeFormData]);
    },[isSolutionFormFilled, isElementFormFilled, isConsiderationFormFilled, isCommentFormFilled, isDiscussionSpaceFormFilled, wipeFormData]);

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
    const toggleConsiderationForm = useCallback((considerationId, warnUser = true) => {
        setOpenedConsiderationFormId((prevId) => {
            const sameForm = prevId === considerationId;
            if (isConsiderationFormFilled && warnUser && !window.confirm(`You have unsaved text in ${sameForm ? "this" : openedConsiderationFormId === "generalConsiderationForm" ? "the \"Add Consideration\"" : "another opened consideration"} form. ${sameForm ? "Closing it" : "Opening this one"} will delete your ${sameForm ? "input" : "other input"}. Proceed?`)) {
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