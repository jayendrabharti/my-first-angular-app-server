import Users from '../models/users.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',

}

export const getUser = async (req, res) => {
    try {
        const user = await Users.findById(req.user.id).select("-password");
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const postUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await Users.findOne({ email });

        if (existingUser) {
            return res.status(409).json({ error: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await Users.create({ name, email, password: hashedPassword });

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await Users.findByIdAndDelete(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const updatedData = { ...req.body };

        if (updatedData?.password) {
            throw "Password cannot be updated using this endpoint.";
        }

        const user = await Users.findByIdAndUpdate(req.user.id, updatedData, {
            new: true,
            runValidators: true,
        }).select('-password');

        res.status(200).json({ user, message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error?.message || "Unable to update user" });
    }
};

export const generateTokens = async (userId) => {

    const user = await Users.findById(userId);

    const accessToken = jwt.sign(
        { id: user._id, email: user.email, name: user.name },
        process.env.ACCESS_SECRET,
        { expiresIn: '1d' }
    );

    const refreshToken = jwt.sign(
        { id: user._id },
        process.env.REFRESH_SECRET,
        { expiresIn: '7d' }
    );

    user.refreshToken = refreshToken;
    await user.save();

    return { accessToken, refreshToken };
}

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await Users.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Incorrect password' });
        }

        const { accessToken, refreshToken } = await generateTokens(user.id);

        const loggedInUser = await Users.findById(user.id).select("-password -refreshToken")

        return res
            .status(200)
            .cookie('accessToken', accessToken, cookieOptions)
            .cookie('refreshToken', refreshToken, cookieOptions)
            .json({ accessToken, refreshToken, user: loggedInUser });

    } catch (error) {
        return res.status(500).json({ error: error?.message || "Not able to login" });
    }
};

export const refreshUserToken = async (req, res) => {
    const clientRefreshToken = req.cookies?.refreshToken || req.header.refreshToken;

    if (!clientRefreshToken) {
        return res.status(401).json({ error: 'Unauthorized request' });
    }

    try {
        const decodedToken = jwt.verify(clientRefreshToken, process.env.REFRESH_SECRET);

        const user = await Users.findById(decodedToken?.id);

        if (!user) {
            throw new Error("Invalid refresh token");
        }

        if (clientRefreshToken !== user?.refreshToken) {
            throw new Error("Refresh token is expired or used");

        }

        const { accessToken, refreshToken } = generateTokens(user._id);

        return res
            .status(200)
            .cookie('accessToken', accessToken, cookieOptions)
            .cookie('refreshToken', refreshToken, cookieOptions)
            .json({ accessToken, refreshToken });

    } catch (error) {
        res.status(403).json({ error: error?.message || 'Invalid or expired refresh token' });
    }
};

export const logoutUser = async (req, res) => {

    await Users.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json({ message: "Logged out successfully" })
};
