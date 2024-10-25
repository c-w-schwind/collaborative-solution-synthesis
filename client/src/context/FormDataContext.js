import {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import {formConfigurations} from "../components/Forms/formConfigurations";
import {useLocation} from "react-router-dom";
import {useAuth} from "./AuthContext";
import {useToasts} from "./ToastContext";

const FormDataContext = createContext();

export const FormDataProvider = ({children}) => {
    const initFormData = useCallback((config) => config.fields.reduce((acc, field) => ({...acc, [field.name]: ''}), {}), []);

    const [solutionFormData, setSolutionFormData] = useState(initFormData(formConfigurations.solutionForm));
    const [solutionDraftTitleFormData, setSolutionDraftTitleFormData] = useState(initFormData(formConfigurations.draftTitleForm));
    const [solutionDraftOverviewFormData, setSolutionDraftOverviewFormData] = useState(initFormData(formConfigurations.draftOverviewForm));
    const [solutionDraftDescriptionFormData, setSolutionDraftDescriptionFormData] = useState(initFormData(formConfigurations.draftDescriptionForm));
    const [solutionDraftChangeSummaryFormData, setSolutionDraftChangeSummaryFormData] = useState(initFormData(formConfigurations.draftChangeSummaryForm));

    const [elementFormData, setElementFormData] = useState(initFormData(formConfigurations.elementForm));
    const [elementDraftTitleFormData, setElementDraftTitleFormData] = useState(initFormData(formConfigurations.draftTitleForm));
    const [elementDraftOverviewFormData, setElementDraftOverviewFormData] = useState(initFormData(formConfigurations.draftOverviewForm));
    const [elementDraftDescriptionFormData, setElementDraftDescriptionFormData] = useState(initFormData(formConfigurations.draftDescriptionForm));
    const [elementDraftChangeSummaryFormData, setElementDraftChangeSummaryFormData] = useState(initFormData(formConfigurations.draftChangeSummaryForm));

    const [considerationFormData, setConsiderationFormData] = useState(initFormData(formConfigurations.considerationForm));
    const [commentFormData, setCommentFormData] = useState(initFormData(formConfigurations.commentForm));
    const [discussionSpaceFormData, setDiscussionSpaceFormData] = useState(initFormData(formConfigurations.discussionSpaceForm));
    const [registrationFormData, setRegistrationFormData] = useState(initFormData(formConfigurations.registrationForm));

    const [isSolutionFormOpen, setIsSolutionFormOpen] = useState(false);
    const [isSolutionDraftTitleFormOpen, setIsSolutionDraftTitleFormOpen] = useState(false);
    const [isSolutionDraftOverviewFormOpen, setIsSolutionDraftOverviewFormOpen] = useState(false);
    const [isSolutionDraftDescriptionFormOpen, setIsSolutionDraftDescriptionFormOpen] = useState(false);
    const [isSolutionDraftChangeSummaryFormOpen, setIsSolutionDraftChangeSummaryFormOpen] = useState(false);

    const [isElementFormOpen, setIsElementFormOpen] = useState(false);
    const [isElementDraftTitleFormOpen, setIsElementDraftTitleFormOpen] = useState(false);
    const [isElementDraftOverviewFormOpen, setIsElementDraftOverviewFormOpen] = useState(false);
    const [isElementDraftDescriptionFormOpen, setIsElementDraftDescriptionFormOpen] = useState(false);
    const [isElementDraftChangeSummaryFormOpen, setIsElementDraftChangeSummaryFormOpen] = useState(false);

    const [openedConsiderationFormId, setOpenedConsiderationFormId] = useState(null);
    const [openedCommentSectionId, setOpenedCommentSectionId] = useState(null);

    const [modalNavigationDetected, setModalNavigationDetected] = useState(false);

    const location = useLocation();
    let previousPathRef = useRef(location.pathname.split("/").includes("element") ? "element" : "solution");

    const {isLoggedIn} = useAuth();
    const {addToast} = useToasts();


    useEffect(() => {
        const currentPathSegment = location.pathname.split("/").includes("element") ? "element" : "solution";
        setModalNavigationDetected(previousPathRef.current !== currentPathSegment);
        previousPathRef.current = currentPathSegment;
    }, [location]);


    const isSolutionFormFilled = useMemo(() =>
        Object.values(solutionFormData).some(val => val.trim() !== ''), [solutionFormData]
    );

    const isSolutionDraftTitleFormFilled = useMemo(() =>
        Object.values(solutionDraftTitleFormData).some(val => val.trim() !== ''), [solutionDraftTitleFormData]
    );

    const isSolutionDraftOverviewFormFilled = useMemo(() =>
        Object.values(solutionDraftOverviewFormData).some(val => val.trim() !== ''), [solutionDraftOverviewFormData]
    );

    const isSolutionDraftDescriptionFormFilled = useMemo(() =>
        Object.values(solutionDraftDescriptionFormData).some(val => val.trim() !== ''), [solutionDraftDescriptionFormData]
    );

    const isSolutionDraftChangeSummaryFormFilled = useMemo(() =>
        Object.values(solutionDraftChangeSummaryFormData).some(val => val.trim() !== ''), [solutionDraftChangeSummaryFormData]
    );

    const isElementFormFilled = useMemo(() =>
        Object.values(elementFormData).some(val => val.trim() !== ''), [elementFormData]
    );

    const isElementDraftTitleFormFilled = useMemo(() =>
        Object.values(elementDraftTitleFormData).some(val => val.trim() !== ''), [elementDraftTitleFormData]
    );

    const isElementDraftOverviewFormFilled = useMemo(() =>
        Object.values(elementDraftOverviewFormData).some(val => val.trim() !== ''), [elementDraftOverviewFormData]
    );

    const isElementDraftDescriptionFormFilled = useMemo(() =>
        Object.values(elementDraftDescriptionFormData).some(val => val.trim() !== ''), [elementDraftDescriptionFormData]
    );

    const isElementDraftChangeSummaryFormFilled = useMemo(() =>
        Object.values(elementDraftChangeSummaryFormData).some(val => val.trim() !== ''), [elementDraftChangeSummaryFormData]
    );

    const isConsiderationFormFilled = useMemo(() =>
        Object.values(considerationFormData).some(val => val.trim() !== ''), [considerationFormData]
    );

    const isCommentFormFilled = useMemo(() =>
        Object.values(commentFormData).some(val => val.trim() !== ''), [commentFormData]
    );

    const isDiscussionSpaceFormFilled = useMemo(() =>
        Object.values(discussionSpaceFormData).some(val => val.trim() !== ''), [discussionSpaceFormData]
    );


    const wipeFormData = useCallback(({
                                          wipeAll,
                                          wipeSolutionForm,
                                          wipeSolutionDraftTitleForm,
                                          wipeSolutionDraftOverviewForm,
                                          wipeSolutionDraftDescriptionForm,
                                          wipeSolutionDraftChangeSummaryForm,
                                          wipeElementForm,
                                          wipeElementDraftTitleForm,
                                          wipeElementDraftOverviewForm,
                                          wipeElementDraftDescriptionForm,
                                          wipeElementDraftChangeSummaryForm,
                                          wipeConsiderationForm,
                                          wipeCommentForm,
                                          wipeDiscussionSpaceForm,
                                          wipeRegistrationFormData
                                      }) => {
        const shouldWipe = flag => wipeAll || flag;

        shouldWipe(wipeSolutionForm) && setSolutionFormData(initFormData(formConfigurations.solutionForm));
        shouldWipe(wipeSolutionDraftTitleForm) && setSolutionDraftTitleFormData(initFormData(formConfigurations.draftTitleForm));
        shouldWipe(wipeSolutionDraftOverviewForm) && setSolutionDraftOverviewFormData(initFormData(formConfigurations.draftOverviewForm));
        shouldWipe(wipeSolutionDraftDescriptionForm) && setSolutionDraftDescriptionFormData(initFormData(formConfigurations.draftDescriptionForm));
        shouldWipe(wipeSolutionDraftChangeSummaryForm) && setSolutionDraftChangeSummaryFormData(initFormData(formConfigurations.draftChangeSummaryForm));
        shouldWipe(wipeElementForm) && setElementFormData(initFormData(formConfigurations.elementForm));
        shouldWipe(wipeElementDraftTitleForm) && setElementDraftTitleFormData(initFormData(formConfigurations.draftTitleForm));
        shouldWipe(wipeElementDraftOverviewForm) && setElementDraftOverviewFormData(initFormData(formConfigurations.draftOverviewForm));
        shouldWipe(wipeElementDraftDescriptionForm) && setElementDraftDescriptionFormData(initFormData(formConfigurations.draftDescriptionForm));
        shouldWipe(wipeElementDraftChangeSummaryForm) && setElementDraftChangeSummaryFormData(initFormData(formConfigurations.draftChangeSummaryForm));
        shouldWipe(wipeConsiderationForm) && setConsiderationFormData(initFormData(formConfigurations.considerationForm));
        shouldWipe(wipeCommentForm) && setCommentFormData(initFormData(formConfigurations.commentForm));
        shouldWipe(wipeDiscussionSpaceForm) && setDiscussionSpaceFormData(initFormData(formConfigurations.discussionSpaceForm));
        shouldWipe(wipeRegistrationFormData) && setRegistrationFormData(initFormData(formConfigurations.registrationForm));
    }, [initFormData]);

    // Manages form states during browser navigations. Ensures that open forms are appropriately closed or reset based on their presence in the
    // DOM and user input. Warns users of potential data loss before making any changes, and provides instructions on how to save their data
    const handleBrowserNavigation = useCallback(() => {
        // Check if specific forms are still present in the DOM after navigation
        const solutionFormExists = document.querySelector(".solution-input-container") !== null;
        const solutionDraftTitleFormExists = document.querySelector(".draft-form") !== null;
        const solutionDraftOverviewFormExists = document.querySelector(".draft-form") !== null;
        const solutionDraftDescriptionFormExists = document.querySelector(".draft-form") !== null;
        const solutionDraftChangeSummaryFormExists = document.querySelector(".draft-form") !== null;
        const elementFormExists = document.querySelector(".solution-details-add-card-button-container") !== null;
        const elementDraftTitleFormExists = document.querySelector(".draft-form") !== null;
        const elementDraftOverviewFormExists = document.querySelector(".draft-form") !== null;
        const elementDraftDescriptionFormExists = document.querySelector(".draft-form") !== null;
        const elementDraftChangeSummaryFormExists = document.querySelector(".draft-form") !== null;
        const considerationFormExists = document.querySelector(".solution-details-add-card-button-container") !== null;
        const commentFormExists = document.querySelector(".comments-container") !== null;
        const discussionSpaceFormExists = document.querySelector(".discussion-space-input-area") !== null;

        // Determine forms that need data wiped based on non-existence, filled state, and navigation to or from modal
        const solutionFormNeedsWiping = isSolutionFormFilled && !solutionFormExists;
        const solutionDraftTitleFormNeedsWiping = isSolutionDraftTitleFormFilled && !solutionDraftTitleFormExists;
        const solutionDraftOverviewFormNeedsWiping = isSolutionDraftOverviewFormFilled && !solutionDraftOverviewFormExists;
        const solutionDraftDescriptionFormNeedsWiping = isSolutionDraftDescriptionFormFilled && !solutionDraftDescriptionFormExists;
        const solutionDraftChangeSummaryFormNeedsWiping = isSolutionDraftChangeSummaryFormFilled && !solutionDraftChangeSummaryFormExists;
        const elementFormNeedsWiping = isElementFormFilled && !elementFormExists;
        const elementDraftTitleFormNeedsWiping = isElementDraftTitleFormFilled && !elementDraftTitleFormExists;
        const elementDraftOverviewFormNeedsWiping = isElementDraftOverviewFormFilled && !elementDraftOverviewFormExists;
        const elementDraftDescriptionFormNeedsWiping = isElementDraftDescriptionFormFilled && !elementDraftDescriptionFormExists;
        const elementDraftChangeSummaryFormNeedsWiping = isElementDraftChangeSummaryFormFilled && !elementDraftChangeSummaryFormExists;
        const considerationFormNeedsWiping = isConsiderationFormFilled && (!considerationFormExists || modalNavigationDetected);
        const commentFormNeedsWiping = isCommentFormFilled && (!commentFormExists || modalNavigationDetected);
        const discussionSpaceFormNeedsWiping = isDiscussionSpaceFormFilled && !discussionSpaceFormExists;

        // List forms that contain unsaved data
        let formsWithUnsavedData = [];
        if (solutionFormNeedsWiping) formsWithUnsavedData.push("Solution Proposal Form");
        if (solutionDraftTitleFormNeedsWiping) formsWithUnsavedData.push("Solution Draft Title Form");
        if (solutionDraftOverviewFormNeedsWiping) formsWithUnsavedData.push("Solution Draft Overview Form");
        if (solutionDraftDescriptionFormNeedsWiping) formsWithUnsavedData.push("Solution Draft Description Form");
        if (solutionDraftChangeSummaryFormNeedsWiping) formsWithUnsavedData.push("Solution Draft Change Summary Form");
        if (elementFormNeedsWiping) formsWithUnsavedData.push("Element Proposal Form");
        if (elementDraftTitleFormNeedsWiping) formsWithUnsavedData.push("Element Draft Title Form");
        if (elementDraftOverviewFormNeedsWiping) formsWithUnsavedData.push("Element Draft Overview Form");
        if (elementDraftDescriptionFormNeedsWiping) formsWithUnsavedData.push("Element Draft Description Form");
        if (elementDraftChangeSummaryFormNeedsWiping) formsWithUnsavedData.push("Element Draft Change Summary Form");
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
                wipeSolutionDraftTitleForm: solutionDraftTitleFormNeedsWiping,
                wipeSolutionDraftOverviewForm: solutionDraftOverviewFormNeedsWiping,
                wipeSolutionDraftDescriptionForm: solutionDraftDescriptionFormNeedsWiping,
                wipeSolutionDraftChangeSummaryForm: solutionDraftChangeSummaryFormNeedsWiping,
                wipeElementForm: elementFormNeedsWiping,
                wipeElementDraftTitleForm: elementDraftTitleFormNeedsWiping,
                wipeElementDraftOverviewForm: elementDraftOverviewFormNeedsWiping,
                wipeElementDraftDescriptionForm: elementDraftDescriptionFormNeedsWiping,
                wipeElementDraftChangeSummaryForm: elementDraftChangeSummaryFormNeedsWiping,
                wipeConsiderationForm: considerationFormNeedsWiping,
                wipeCommentForm: commentFormNeedsWiping,
                wipeDiscussionSpaceForm: discussionSpaceFormNeedsWiping
            });

            // Close disappeared forms based on their open state
            if (!solutionFormExists && isSolutionFormOpen) setIsSolutionFormOpen(false);
            if (!solutionDraftTitleFormExists && isSolutionDraftTitleFormOpen) setIsSolutionDraftTitleFormOpen(false);
            if (!solutionDraftOverviewFormExists && isSolutionDraftOverviewFormOpen) setIsSolutionDraftOverviewFormOpen(false);
            if (!solutionDraftDescriptionFormExists && isSolutionDraftDescriptionFormOpen) setIsSolutionDraftDescriptionFormOpen(false);
            if (!solutionDraftChangeSummaryFormExists && isSolutionDraftChangeSummaryFormOpen) setIsSolutionDraftChangeSummaryFormOpen(false);
            if (!elementFormExists && isElementFormOpen) setIsElementFormOpen(false);
            if (!elementDraftTitleFormExists && isElementDraftTitleFormOpen) setIsElementDraftTitleFormOpen(false);
            if (!elementDraftOverviewFormExists && isElementDraftOverviewFormOpen) setIsElementDraftOverviewFormOpen(false);
            if (!elementDraftDescriptionFormExists && isElementDraftDescriptionFormOpen) setIsElementDraftDescriptionFormOpen(false);
            if (!elementDraftChangeSummaryFormExists && isElementDraftChangeSummaryFormOpen) setIsElementDraftChangeSummaryFormOpen(false);
            if ((!considerationFormExists || modalNavigationDetected) && openedConsiderationFormId) setOpenedConsiderationFormId(null);
            if ((!commentFormExists || modalNavigationDetected) && openedCommentSectionId) setOpenedCommentSectionId(null);
        });

    }, [isSolutionFormFilled, isSolutionDraftTitleFormFilled, isSolutionDraftOverviewFormFilled, isSolutionDraftDescriptionFormFilled, isSolutionDraftChangeSummaryFormFilled, isElementFormFilled, isElementDraftTitleFormFilled, isElementDraftOverviewFormFilled, isElementDraftDescriptionFormFilled, isElementDraftChangeSummaryFormFilled, isConsiderationFormFilled, isCommentFormFilled, isDiscussionSpaceFormFilled, isSolutionFormOpen, isSolutionDraftTitleFormOpen, isSolutionDraftOverviewFormOpen, isSolutionDraftDescriptionFormOpen, isSolutionDraftChangeSummaryFormOpen, isElementFormOpen, isElementDraftTitleFormOpen, isElementDraftOverviewFormOpen, isElementDraftDescriptionFormOpen, isElementDraftChangeSummaryFormOpen, openedConsiderationFormId, openedCommentSectionId, wipeFormData, modalNavigationDetected]);

    // Allows selective navigation checks and form data wiping. Prompts users only if specified forms have unsaved data,
    // enabling navigation while preserving or ignoring certain fields as needed. Closes open forms on navigation.
    const canNavigate = useCallback(({
                                         checkSolutionForm,
                                         checkSolutionDraftTitleForm,
                                         checkSolutionDraftOverviewForm,
                                         checkSolutionDraftDescriptionForm,
                                         checkSolutionDraftChangeSummaryForm,
                                         checkElementForm,
                                         checkElementDraftTitleForm,
                                         checkElementDraftOverviewForm,
                                         checkElementDraftDescriptionForm,
                                         checkElementDraftChangeSummaryForm,
                                         checkConsiderationForm,
                                         checkCommentForm,
                                         checkDiscussionSpaceForm,
                                         checkAll,
                                         saveDiscussionSpaceData,
                                         saveElementFormData
                                     }) => {
        const filledForms = [];

        if (checkAll) {
            checkSolutionForm = true;
            checkSolutionDraftTitleForm = true;
            checkSolutionDraftOverviewForm = true;
            checkSolutionDraftDescriptionForm = true;
            checkSolutionDraftChangeSummaryForm = true;
            checkElementForm = true;
            checkElementDraftTitleForm = true;
            checkElementDraftOverviewForm = true;
            checkElementDraftDescriptionForm = true;
            checkElementDraftChangeSummaryForm = true;
            checkConsiderationForm = true;
            checkCommentForm = true;
            checkDiscussionSpaceForm = true;
        }

        if (checkSolutionForm && isSolutionFormFilled) filledForms.push("Solution Proposal Form");
        if (checkSolutionDraftTitleForm && isSolutionDraftTitleFormFilled) filledForms.push("Solution Draft Title Form");
        if (checkSolutionDraftOverviewForm && isSolutionDraftOverviewFormFilled) filledForms.push("Solution Draft Overview Form");
        if (checkSolutionDraftDescriptionForm && isSolutionDraftDescriptionFormFilled) filledForms.push("Solution Draft Description Form");
        if (checkSolutionDraftChangeSummaryForm && isSolutionDraftChangeSummaryFormFilled) filledForms.push("Solution Draft Change Summary Form");
        if (checkElementForm && isElementFormFilled) filledForms.push("Solution Element Proposal Form");
        if (checkElementDraftTitleForm && isElementDraftTitleFormFilled) filledForms.push("Element Draft Title Form");
        if (checkElementDraftOverviewForm && isElementDraftOverviewFormFilled) filledForms.push("Element Draft Overview Form");
        if (checkElementDraftDescriptionForm && isElementDraftDescriptionFormFilled) filledForms.push("Element Draft Description Form");
        if (checkElementDraftChangeSummaryForm && isElementDraftChangeSummaryFormFilled) filledForms.push("Element Draft Change Summary Form");
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
                ? "\nHowever, your *Solution Element Proposal* will temporarily be saved and remain available.\n"
                : "";
            const confirmationMessage = `Warning!\n\nYou have unsaved text in the following form${pluralSuffix}:\n${filledFormsMessage}\nContinuing will delete your input${pluralSuffix}.\n${discussionSpaceMessage}${elementFormMessage}\nProceed?`;

            if (!window.confirm(confirmationMessage)) {
                return false;
            }

            wipeFormData({
                wipeSolutionForm: checkSolutionForm,
                wipeSolutionDraftTitleForm: checkSolutionDraftTitleForm,
                wipeSolutionDraftOverviewForm: checkSolutionDraftOverviewForm,
                wipeSolutionDraftDescriptionForm: checkSolutionDraftDescriptionForm,
                wipeSolutionDraftChangeSummaryForm: checkSolutionDraftChangeSummaryForm,
                wipeElementForm: checkElementForm,
                wipeElementDraftTitleForm: checkElementDraftTitleForm,
                wipeElementDraftOverviewForm: checkElementDraftOverviewForm,
                wipeElementDraftDescriptionForm: checkElementDraftDescriptionForm,
                wipeElementDraftChangeSummaryForm: checkElementDraftChangeSummaryForm,
                wipeConsiderationForm: checkConsiderationForm,
                wipeCommentForm: checkCommentForm,
                wipeDiscussionSpaceForm: saveDiscussionSpaceData ? false : checkDiscussionSpaceForm
            });
        }

        // Close relevant open forms & sections when navigating away
        if (checkSolutionForm) setIsSolutionFormOpen(false);
        if (checkSolutionDraftTitleForm) setIsSolutionDraftTitleFormOpen(false);
        if (checkSolutionDraftOverviewForm) setIsSolutionDraftOverviewFormOpen(false);
        if (checkSolutionDraftDescriptionForm) setIsSolutionDraftDescriptionFormOpen(false);
        if (checkSolutionDraftChangeSummaryForm) setIsSolutionDraftChangeSummaryFormOpen(false);
        if (checkElementForm) setIsElementFormOpen(false);
        if (checkElementDraftTitleForm) setIsElementDraftTitleFormOpen(false);
        if (checkElementDraftOverviewForm) setIsElementDraftOverviewFormOpen(false);
        if (checkElementDraftDescriptionForm) setIsElementDraftDescriptionFormOpen(false);
        if (checkElementDraftChangeSummaryForm) setIsElementDraftChangeSummaryFormOpen(false);
        if (checkCommentForm) setOpenedCommentSectionId(null);
        if (checkConsiderationForm) setOpenedConsiderationFormId(null);

        return true;
    }, [isSolutionFormFilled, isSolutionDraftTitleFormFilled, isSolutionDraftOverviewFormFilled, isSolutionDraftDescriptionFormFilled, isSolutionDraftChangeSummaryFormFilled, isElementFormFilled, isElementDraftTitleFormFilled, isElementDraftOverviewFormFilled, isElementDraftDescriptionFormFilled, isElementDraftChangeSummaryFormFilled, isConsiderationFormFilled, isCommentFormFilled, isDiscussionSpaceFormFilled, wipeFormData]);


    const checkLoggedIn = useCallback(() => {
        if (!isLoggedIn) {
            addToast("You must be logged in to use this feature.", 5000);
            return false;
        }
        return true;
    }, [isLoggedIn, addToast]);


    const toggleSolutionForm = useCallback((askUser = true, ref) => {
        if (!checkLoggedIn()) return;

        if (askUser && isSolutionFormOpen && isSolutionFormFilled) {
            if (!window.confirm(`You have unsaved text in this form. Closing it will delete your input. Proceed?`)) {
                return;
            }
            wipeFormData({wipeSolutionForm: true});
        }

        if (!isSolutionFormOpen && ref?.current) {
            setTimeout(() => {
                ref.current.scrollIntoView({behavior: "smooth", block: "center"});
            }, 300); // Matching animation's completion time
        }

        setIsSolutionFormOpen(prevState => !prevState);
    }, [checkLoggedIn, isSolutionFormFilled, isSolutionFormOpen, wipeFormData]);


    const toggleSolutionDraftTitleForm = useCallback((askUser = true) => {
        if (askUser && isSolutionDraftTitleFormFilled) {
            if (!window.confirm(`You have unsaved text in this form. Closing it will delete your input. Proceed?`)) {
                return;
            }
        }
        if (isSolutionDraftTitleFormOpen) wipeFormData({wipeSolutionDraftTitleForm: true});

        setIsSolutionDraftTitleFormOpen(prevState => !prevState);
    }, [isSolutionDraftTitleFormFilled, isSolutionDraftTitleFormOpen, wipeFormData]);


    const toggleSolutionDraftOverviewForm = useCallback((askUser = true) => {
        if (askUser && isSolutionDraftOverviewFormFilled) {
            if (!window.confirm(`You have unsaved text in this form. Closing it will delete your input. Proceed?`)) {
                return;
            }
        }
        if (isSolutionDraftOverviewFormOpen) wipeFormData({wipeSolutionDraftOverviewForm: true});

        setIsSolutionDraftOverviewFormOpen(prevState => !prevState);
    }, [isSolutionDraftOverviewFormFilled, isSolutionDraftOverviewFormOpen, wipeFormData]);


    const toggleSolutionDraftDescriptionForm = useCallback((askUser = true) => {
        if (askUser && isSolutionDraftDescriptionFormFilled) {
            if (!window.confirm(`You have unsaved text in this form. Closing it will delete your input. Proceed?`)) {
                return;
            }
        }
        if (isSolutionDraftDescriptionFormOpen) wipeFormData({wipeSolutionDraftDescriptionForm: true});

        setIsSolutionDraftDescriptionFormOpen(prevState => !prevState);
    }, [isSolutionDraftDescriptionFormFilled, isSolutionDraftDescriptionFormOpen, wipeFormData]);

    const toggleSolutionDraftChangeSummaryForm = useCallback((askUser = true) => {
        if (askUser && isSolutionDraftChangeSummaryFormFilled) {
            if (!window.confirm(`You have unsaved text in this form. Closing it will delete your input. Proceed?`)) {
                return;
            }
        }
        if (isSolutionDraftChangeSummaryFormOpen) wipeFormData({wipeSolutionDraftChangeSummaryForm: true});

        setIsSolutionDraftChangeSummaryFormOpen(prevState => !prevState);
    }, [isSolutionDraftChangeSummaryFormFilled, isSolutionDraftChangeSummaryFormOpen, wipeFormData]);


    const toggleElementForm = useCallback((askUser = true, ref) => {
        if (!checkLoggedIn()) return;

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
    }, [checkLoggedIn, isElementFormFilled, isElementFormOpen, wipeFormData]);


    const toggleElementDraftTitleForm = useCallback((askUser = true) => {
        if (askUser && isElementDraftTitleFormFilled) {
            if (!window.confirm(`You have unsaved text in this form. Closing it will delete your input. Proceed?`)) {
                return;
            }
        }
        if (isElementDraftTitleFormOpen) wipeFormData({wipeElementDraftTitleForm: true});

        setIsElementDraftTitleFormOpen(prevState => !prevState);
    }, [isElementDraftTitleFormFilled, isElementDraftTitleFormOpen, wipeFormData]);


    const toggleElementDraftOverviewForm = useCallback((askUser = true) => {
        if (askUser && isElementDraftOverviewFormFilled) {
            if (!window.confirm(`You have unsaved text in this form. Closing it will delete your input. Proceed?`)) {
                return;
            }
        }
        if (isElementDraftOverviewFormOpen) wipeFormData({wipeElementDraftOverviewForm: true});

        setIsElementDraftOverviewFormOpen(prevState => !prevState);
    }, [isElementDraftOverviewFormFilled, isElementDraftOverviewFormOpen, wipeFormData]);


    const toggleElementDraftDescriptionForm = useCallback((askUser = true) => {
        if (askUser && isElementDraftDescriptionFormFilled) {
            if (!window.confirm(`You have unsaved text in this form. Closing it will delete your input. Proceed?`)) {
                return;
            }
        }
        if (isElementDraftDescriptionFormOpen) wipeFormData({wipeElementDraftDescriptionForm: true});

        setIsElementDraftDescriptionFormOpen(prevState => !prevState);
    }, [isElementDraftDescriptionFormFilled, isElementDraftDescriptionFormOpen, wipeFormData]);

    const toggleElementDraftChangeSummaryForm = useCallback((askUser = true) => {
        if (askUser && isElementDraftChangeSummaryFormFilled) {
            if (!window.confirm(`You have unsaved text in this form. Closing it will delete your input. Proceed?`)) {
                return;
            }
        }
        if (isElementDraftChangeSummaryFormOpen) wipeFormData({wipeElementDraftChangeSummaryForm: true});

        setIsElementDraftChangeSummaryFormOpen(prevState => !prevState);
    }, [isElementDraftChangeSummaryFormFilled, isElementDraftChangeSummaryFormOpen, wipeFormData]);


    // Use "generalConsiderationForm" for the general consideration form at the end of the consideration list instead of editing a specific one
    const toggleConsiderationForm = useCallback((considerationId, ref, warnUser = true) => {
        if (!checkLoggedIn()) return;

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
    }, [checkLoggedIn, isConsiderationFormFilled, openedConsiderationFormId, initFormData]);


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

            setTimeout(() => {
                if (ref?.current) {
                    const refPosition = ref.current.getBoundingClientRect().top + window.scrollY;
                    const offsetPosition = refPosition - 180;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                }
            }, 300); // Matching animation's completion time

            return considerationId;
        });
    }, [isCommentFormFilled, initFormData]);


    const value = useMemo(() => ({
        solutionFormData,
        solutionDraftTitleFormData,
        solutionDraftOverviewFormData,
        solutionDraftDescriptionFormData,
        solutionDraftChangeSummaryFormData,
        elementFormData,
        elementDraftTitleFormData,
        elementDraftOverviewFormData,
        elementDraftDescriptionFormData,
        elementDraftChangeSummaryFormData,
        considerationFormData,
        commentFormData,
        discussionSpaceFormData,
        registrationFormData,

        setSolutionFormData,
        setSolutionDraftTitleFormData,
        setSolutionDraftOverviewFormData,
        setSolutionDraftDescriptionFormData,
        setSolutionDraftChangeSummaryFormData,
        setElementFormData,
        setElementDraftTitleFormData,
        setElementDraftOverviewFormData,
        setElementDraftDescriptionFormData,
        setElementDraftChangeSummaryFormData,
        setConsiderationFormData,
        setCommentFormData,
        setDiscussionSpaceFormData,
        setRegistrationFormData,

        handleBrowserNavigation,
        canNavigate,
        wipeFormData,

        toggleSolutionForm,
        toggleSolutionDraftTitleForm,
        toggleSolutionDraftOverviewForm,
        toggleSolutionDraftDescriptionForm,
        toggleSolutionDraftChangeSummaryForm,
        toggleElementForm,
        toggleElementDraftTitleForm,
        toggleElementDraftOverviewForm,
        toggleElementDraftDescriptionForm,
        toggleElementDraftChangeSummaryForm,
        toggleConsiderationForm,
        toggleCommentSection,

        isSolutionFormOpen,
        isSolutionDraftTitleFormFilled,
        isSolutionDraftOverviewFormFilled,
        isSolutionDraftDescriptionFormFilled,
        isSolutionDraftChangeSummaryFormFilled,
        isSolutionDraftTitleFormOpen,
        isSolutionDraftOverviewFormOpen,
        isSolutionDraftDescriptionFormOpen,
        isSolutionDraftChangeSummaryFormOpen,
        isElementFormOpen,
        isElementDraftTitleFormFilled,
        isElementDraftOverviewFormFilled,
        isElementDraftDescriptionFormFilled,
        isElementDraftChangeSummaryFormFilled,
        isElementDraftTitleFormOpen,
        isElementDraftOverviewFormOpen,
        isElementDraftDescriptionFormOpen,
        isElementDraftChangeSummaryFormOpen,
        openedConsiderationFormId,
        openedCommentSectionId
    }), [
        solutionFormData,
        solutionDraftTitleFormData,
        solutionDraftOverviewFormData,
        solutionDraftDescriptionFormData,
        solutionDraftChangeSummaryFormData,
        elementFormData,
        elementDraftTitleFormData,
        elementDraftOverviewFormData,
        elementDraftDescriptionFormData,
        elementDraftChangeSummaryFormData,
        considerationFormData,
        commentFormData,
        discussionSpaceFormData,
        registrationFormData,

        handleBrowserNavigation,
        canNavigate,
        wipeFormData,

        toggleSolutionForm,
        toggleSolutionDraftTitleForm,
        toggleSolutionDraftOverviewForm,
        toggleSolutionDraftDescriptionForm,
        toggleSolutionDraftChangeSummaryForm,
        toggleElementForm,
        toggleElementDraftTitleForm,
        toggleElementDraftOverviewForm,
        toggleElementDraftDescriptionForm,
        toggleElementDraftChangeSummaryForm,
        toggleConsiderationForm,
        toggleCommentSection,

        isSolutionFormOpen,
        isSolutionDraftTitleFormFilled,
        isSolutionDraftOverviewFormFilled,
        isSolutionDraftDescriptionFormFilled,
        isSolutionDraftChangeSummaryFormFilled,
        isSolutionDraftTitleFormOpen,
        isSolutionDraftOverviewFormOpen,
        isSolutionDraftDescriptionFormOpen,
        isSolutionDraftChangeSummaryFormOpen,
        isElementFormOpen,
        isElementDraftTitleFormFilled,
        isElementDraftOverviewFormFilled,
        isElementDraftDescriptionFormFilled,
        isElementDraftChangeSummaryFormFilled,
        isElementDraftTitleFormOpen,
        isElementDraftOverviewFormOpen,
        isElementDraftDescriptionFormOpen,
        isElementDraftChangeSummaryFormOpen,
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