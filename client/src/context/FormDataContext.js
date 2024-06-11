import {createContext, useContext, useMemo, useState} from "react";
import {formConfigurations} from "../components/Forms/formConfigurations";

const FormDataContext = createContext();

export const FormDataProvider = ({children}) => {
    const initFormData = (config) => config.reduce((acc, field) => ({...acc, [field.name]: ''}), {});

    const [discussionSpaceFormData, setDiscussionSpaceFormData] = useState(initFormData(formConfigurations.discussionSpaceForm));
    const [considerationFormData, setConsiderationFormData] = useState(initFormData(formConfigurations.considerationForm));
    const [commentFormData, setCommentFormData] = useState(initFormData(formConfigurations.commentForm));
    const [openedCommentsId, setOpenedCommentsId] = useState(null);

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

    const wipeFormData = ({wipeDiscussionSpaceForm, wipeConsiderationForm, wipeCommentForm}) => {
        wipeDiscussionSpaceForm && setDiscussionSpaceFormData(initFormData(formConfigurations.discussionSpaceForm));
        wipeConsiderationForm && setConsiderationFormData(initFormData(formConfigurations.considerationForm));
        wipeCommentForm && setCommentFormData(initFormData(formConfigurations.commentForm));
    };

    // Allows selective navigation checks and form data wiping. Prompts users only if specified forms
    // have unsaved data, enabling navigation while preserving or ignoring certain fields as needed.
    const canNavigate = ({checkDiscussionSpaceForm, checkConsiderationForm, checkCommentForm, checkAll, saveDiscussionSpaceData}) => {
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
        if (checkCommentForm) setOpenedCommentsId(null);

        return true;
    };

    const toggleCommentSection = (considerationId) => {
        if (isCommentFormFilled && !window.confirm("You have unsaved text in a comment form. Continuing will delete your comment. Proceed?")) {
            return;
        }
        setOpenedCommentsId(prevId => (prevId === considerationId ? null : considerationId));
        if (isCommentFormFilled) {
            setTimeout(() => {
                setCommentFormData(initFormData(formConfigurations.commentForm));
            }, 150);    // 1/2 of 300ms closing animation - input field shouldn't be visible anymore (or yet, if opening new comment section)
        }
    };

    const value = useMemo(() => ({
        discussionSpaceFormData,
        setDiscussionSpaceFormData,
        considerationFormData,
        setConsiderationFormData,
        commentFormData,
        setCommentFormData,
        isDiscussionSpaceFormFilled,
        isConsiderationFormFilled,
        isCommentFormFilled,
        canNavigate,
        openedCommentsId,
        toggleCommentSection
    }), [
        discussionSpaceFormData,
        considerationFormData,
        commentFormData,
        isDiscussionSpaceFormFilled,
        isConsiderationFormFilled,
        isCommentFormFilled,
        canNavigate,
        openedCommentsId,
        toggleCommentSection
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