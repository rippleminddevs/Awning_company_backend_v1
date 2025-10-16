import express from 'express';
import { AuthViewController } from './authViewController';

const router = express.Router();
const authViewController = new AuthViewController();

// Show password reset form - token validation will be handled by the client
router.get('/reset-password', authViewController.showResetPasswordForm);

// Handle password reset form submission
router.post('/reset-password', authViewController.handleResetPassword);

// Show password reset success page
router.get('/reset-password-success', authViewController.showResetSuccessPage);

export default router; 