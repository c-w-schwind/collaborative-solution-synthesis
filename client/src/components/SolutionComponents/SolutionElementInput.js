import GenericForm from "../Forms/GenericForm";
import {useFormData} from "../../context/FormDataContext";
import {formConfigurations} from "../Forms/formConfigurations";
import formSubmissionService from "../Forms/formSubmissionService";

const SolutionElementInput = ({onSuccessfulSubmit, parentNumber}) => {
    const {elementFormData, setElementFormData} = useFormData();

    const submitElementProposal = async (formData) => {
        const proposalData = {...formData, parentNumber}
        await formSubmissionService("solutionElements", proposalData, "solution element", onSuccessfulSubmit);
    };

    return (
        <GenericForm
            onSubmit={submitElementProposal}
            config={formConfigurations.elementForm}
            formData={elementFormData}
            setFormData={setElementFormData}
        />
    );
};

export default SolutionElementInput;