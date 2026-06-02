import { User } from "../models/user.model.js";

const verifyJWT = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized request" });
        }

        const user = await User.findOne({ token: token }).select("-password");

        if (!user) {
            return res.status(401).json({ message: "Invalid Access Token" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export { verifyJWT };