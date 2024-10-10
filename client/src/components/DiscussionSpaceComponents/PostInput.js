import GenericForm from "../Forms/GenericForm";
import {useFormData} from "../../context/FormDataContext";
import {formConfigurations} from "../Forms/formConfigurations";
import formSubmissionService from "../Forms/formSubmissionService";

function PostInput({onSuccessfulSubmit, parentType, parentNumber}) {
    const {discussionSpaceFormData, setDiscussionSpaceFormData} = useFormData();
    const discussionSpaceConfig = formConfigurations.discussionSpaceForm;

    const submitPost = async (formData) => {
        const postData = {...formData, parentType, parentNumber};
        await formSubmissionService("discussionSpace", postData, "discussion space post", onSuccessfulSubmit);
    };

    return (
        <GenericForm onSubmit={submitPost} config={discussionSpaceConfig} formData={discussionSpaceFormData} setFormData={setDiscussionSpaceFormData}/>
    );
}

export default PostInput;