import {User} from "../user/userModel.js";

async function verifyUserExistence(req, res, next) {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send({ message: 'User not found.' });
        }

        next();
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Internal server error' });
    }
}

export default verifyUserExistence;