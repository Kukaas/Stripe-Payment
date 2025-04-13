import api from "../api";

export const registerUser = async (name, email, password) => {
    try {
        const response = await api.post("/auth/register", {
            name,
            email,
            password,
        });
        
        return response;
        
    } catch (error) {
        console.error("Registration error:", error);
        throw error; // Throw the original error to preserve response data
    }
}

export const loginUser = async (email, password) => {
    try {
        const response = await api.post("/auth/login", {
            email,
            password,
        });
        
        return response;
        
    } catch (error) {
        console.error("Login error:", error);
        throw error; // Throw the original error to preserve response data
    }
}