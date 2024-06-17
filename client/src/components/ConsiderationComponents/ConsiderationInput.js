import {useEffect} from "react";
import GenericForm from "../Forms/GenericForm";
import {useFormData} from "../../context/FormDataContext";
import {formConfigurations} from "../Forms/formConfigurations";
import formSubmissionService from "../Forms/formSubmissionService";

function ConsiderationInput({onSuccessfulSubmit, parentType, parentNumber, existingData}) {
    const {considerationFormData, setConsiderationFormData, openedConsiderationFormId} = useFormData();
    const considerationConfig = formConfigurations.considerationForm;

    useEffect(() => {
        existingData && setConsiderationFormData(existingData);
    }, []);

    const submitConsiderationPost = async (formData) => {
        const postData = {...formData, parentType, parentNumber};
        const method = existingData ? "PUT" : "POST";
        const url = existingData ? `considerations/${openedConsiderationFormId}` : "considerations";

        await formSubmissionService(url, postData, "consideration", onSuccessfulSubmit, method);
    };

    return (
        <GenericForm
            onSubmit={submitConsiderationPost}
            config={considerationConfig}
            formData={considerationFormData}
            setFormData={setConsiderationFormData}
        />
    );
}

export default ConsiderationInput;