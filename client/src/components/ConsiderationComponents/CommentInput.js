import GenericForm from "../Forms/GenericForm";
import {useFormData} from "../../context/FormDataContext";
import {formConfigurations} from "../Forms/formConfigurations";
import formSubmissionService from "../Forms/formSubmissionService";

function CommentInput({onSuccessfulSubmit, parentId}) {
    const {commentFormData, setCommentFormData} = useFormData();
    const commentConfig = formConfigurations.commentForm;

    const submitCommentPost = async (formData) => {
        const postData = {...formData, parentId};
        await formSubmissionService(`considerations/${parentId}/comment`, postData, "comment", onSuccessfulSubmit);
    };

    return (
        <GenericForm onSubmit={submitCommentPost} config={commentConfig} formData={commentFormData} setFormData={setCommentFormData}/>
    );
}

export default CommentInput;