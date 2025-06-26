import express from 'express';
import validToken from '../middlewares/authMiddleware.js';
import {
    getUser,
    postUser,
    deleteUser,
    updateUser,
    loginUser,
    refreshUserToken,
    logoutUser
} from '../controllers/users.controllers.js';

const router = express.Router();

router.get('/user', validToken, getUser);
router.delete('/delete', validToken, deleteUser);
router.put('/update', validToken, updateUser);
router.post('/logout', validToken, logoutUser);

router.post('/login', loginUser);
router.post('/signup', postUser);
router.post('/refresh', refreshUserToken);

export default router;
