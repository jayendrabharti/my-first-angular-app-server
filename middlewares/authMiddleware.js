import jwt from 'jsonwebtoken';
import Users from '../models/users.model.js';

const validToken = async (req, res, next) => {
    try {
        const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!accessToken) {
            throw "Unauthorized request";
        }

        const decodedUser = jwt.verify(accessToken, process.env.ACCESS_SECRET);

        const user = await Users.findById(decodedUser.id).select('-password');;

        if (!user) {

            throw "Invalid Access Token";
        }
        req.user = user;
        req.user.id = user._id;

        next();

    } catch (err) {
        return res.status(401).json({ error: err?.message || "Invalid access token" });
    }
};

export default validToken;
