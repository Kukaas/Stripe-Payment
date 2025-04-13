import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
    const token = req.cookies.access_token; // Get the token from cookies

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Forbidden" });
        }

        req.user = { id: decoded.userId }; // Attach user ID to the request object
        next(); // Proceed to the next middleware or route handler
    });
}