const API_URL = process.env.REACT_APP_API_URL;

// entityType: "solution" or "element"
export const handleRequest = async (method, entityType, entityNumber) => {
    const routePrefix = entityType === "solution" ? "solutions" : "solutionElements";
    const token = localStorage.getItem("token");

    if (method !== "GET" && !token) {
        throw new Error("Unauthorized: No token found. Please log in.");
    }

    const response = await fetch(`${API_URL}/${routePrefix}/${entityNumber}`, {
        method: method,
        headers: token
            ? {"Authorization": `Bearer ${token}`, "Content-Type": "application/json"}
            : {"Content-Type": "application/json"}
    });

    if (!response.ok) {
        let error;
        if (method === "DELETE") {
            const errorData = await response.json();
            error = new Error(errorData.message || `Failed to delete ${entityType}. Status: ${response.status}`);
        } else {
            error = new Error(`HTTP error! Status: ${response.status}`);
        }

        if (response.status === 401) {
            error.message = token
                ? `This ${entityType} is private.\n\n\nYou don't have access to it.`
                : `Unauthorized access.\n\n\nPlease log in to access this ${entityType}.`;
        } else if (response.status === 403) {
            error.message = `You are not authorized to access this ${entityType}.`;
        } else if (response.status === 404) {
            error.message = `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} not found. It may have already been deleted.`;
        }
        throw error;
    }

    return response.status === 204 ? null : response.json();
};