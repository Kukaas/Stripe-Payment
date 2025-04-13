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

export const verifyEmail = async (token) => {
    try {
        const response = await api.get("/auth/verify-email", {
            params: { token }
        });
        return response;
    } catch (error) {
        console.error("Email verification error:", {
            status: error.response?.status,
            message: error.response?.data?.message,
            token: token
        });
        throw error; // Let the component handle the error
    }
};

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

export const logoutUser = async () => {
    try {
        const response = await api.post("/auth/logout", {}, { withCredentials: true });
        
        return response;
        
    } catch (error) {
        console.error("Logout error:", error);
        throw error; // Throw the original error to preserve response data
    }
}