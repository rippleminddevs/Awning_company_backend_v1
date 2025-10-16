import { Request, Response } from 'express';
import { config } from '../../services/configService';
import { AuthService } from './authService';
import { EmailService } from '../../services/emailService';

export class AuthViewController {
    private authService: AuthService;
    private emailService: EmailService;

    constructor() {
        this.authService = new AuthService();
        this.emailService = new EmailService();
    }

    public showResetPasswordForm = async (req: Request, res: Response): Promise<void> => {
        // Pass dynamic values to the template
        res.render('auth/reset-password', {
            appName: config.app.name,
            currentYear: new Date().getFullYear()
        });
    };

    public showResetSuccessPage = async (req: Request, res: Response): Promise<void> => {
        // Pass dynamic values to the template
        res.render('auth/password-reset-success', {
            appName: config.app.name,
            currentYear: new Date().getFullYear()
        });
    };

    public handleResetPassword = async (req: Request, res: Response): Promise<void> => {
        const { token, password } = req.body;

        try {
            // Call the existing reset password API 
            await this.authService.resetPassword({ token, newPassword: password });

            // Redirect to success page
            res.redirect('/auth/reset-password-success');
        } catch (error) {
            // If there's an error, show the reset form again with an error message
            res.render('auth/reset-password', {
                token,
                error: 'Invalid or expired token. Please request a new password reset link.'
            });
        }
    };
} 