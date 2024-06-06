import {createContext, useContext, useMemo, useState} from "react";
import {formConfigurations} from "../components/Forms/formConfigurations";

const FormDataContext = createContext();

export const FormDataProvider = ({children}) => {
    const initFormData = (config) => config.reduce((acc, field) => ({...acc, [field.name]: ''}), {});

    const [discussionSpaceFormData, setDiscussionSpaceFormData] = useState(initFormData(formConfigurations.discussionSpaceForm));
    const [considerationFormData, setConsiderationFormData] = useState(initFormData(formConfigurations.considerationForm));
    const [commentFormData, setCommentFormData] = useState(initFormData(formConfigurations.commentForm));

    const value = useMemo(() => ({
        discussionSpaceFormData, setDiscussionSpaceFormData, considerationFormData, setConsiderationFormData, commentFormData, setCommentFormData
    }), [discussionSpaceFormData, considerationFormData, commentFormData]);


    return (
        <FormDataContext.Provider value={value}>
            {children}
        </FormDataContext.Provider>
    )
}

export function useFormData() {
    const context = useContext(FormDataContext);
    if (context === undefined) {
        throw new Error('useFormData must be used within a FormDataProvider');
    }
    return context;
}