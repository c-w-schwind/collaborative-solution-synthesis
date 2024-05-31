import GenericForm from "../Forms/GenericForm";
import {useFormData} from "../../context/FormDataContext";
import {formConfigurations} from "../Forms/formConfigurations";
import formSubmissionService from "../Forms/formSubmissionService";

function ConsiderationInput({onSuccessfulSubmit, parentType, parentNumber}) {
    const {considerationFormData, setConsiderationFormData} = useFormData();
    const considerationConfig = formConfigurations.considerationForm;

    const submitPost = async (formData) => {
        formData.stance = formData.stance.toLowerCase();
        const postData = { ...formData, parentType, parentNumber };
        await formSubmissionService("considerations", postData, "consideration", onSuccessfulSubmit);
    };

    return (
        <GenericForm onSubmit={submitPost} config={considerationConfig} formData={considerationFormData} setFormData={setConsiderationFormData}/>
    );
}

export default ConsiderationInput;