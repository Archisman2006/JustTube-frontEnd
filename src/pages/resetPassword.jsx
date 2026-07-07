import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/api.js';
import { Eye, EyeOff } from 'lucide-react';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [passwords, setPasswords] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const isFormValid =
        passwords.newPassword.length >= 8 &&
        passwords.newPassword === passwords.confirmPassword;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPasswords((prev) => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid || isLoading) return;

        setIsLoading(true);
        setError('');

        try {
            await apiClient.post('/users/reset-password', {
                token,
                newPassword: passwords.newPassword,
            });
            // Redirect to Sign In page with success message in location state
            navigate('/signin', {
                state: { successMessage: 'Password changed successfully. Log in with your new password.' },
            });
        } catch (err) {
            console.error('Reset Password Error:', err);
            setError(
                err?.response?.data?.message ||
                'Failed to reset password. The link may have expired or is invalid.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const inputStyle =
        'w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none transition-colors mb-4';
    const labelStyle = 'mb-1.5 block text-sm font-medium text-zinc-300';

    return (
        <div className="flex min-h-screen flex-col bg-zinc-950 items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-xl shadow-black/30 backdrop-blur-sm">
                <h2 className="mb-6 text-center text-2xl font-bold tracking-tight text-white uppercase">
                    Reset Password
                </h2>

                {error && (
                    <div className="mb-6 rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-300 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className={labelStyle}>New Password</label>
                            <button
                                type="button"
                                onClick={() => setShowNewPassword((prev) => !prev)}
                                className="text-zinc-400 hover:text-zinc-200 transition-colors focus:outline-none cursor-pointer"
                                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                            >
                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <input
                            type={showNewPassword ? 'text' : 'password'}
                            name="newPassword"
                            value={passwords.newPassword}
                            onChange={handleChange}
                            className={inputStyle}
                            placeholder="Min. 8 characters"
                            required
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className={labelStyle}>Confirm Password</label>
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                className="text-zinc-400 hover:text-zinc-200 transition-colors focus:outline-none cursor-pointer"
                                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                            >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={passwords.confirmPassword}
                            onChange={handleChange}
                            className={inputStyle}
                            placeholder="Confirm your new password"
                            required
                        />
                    </div>

                    {!isFormValid && passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
                        <p className="mb-4 text-xs text-red-400 text-center">
                            Passwords do not match.
                        </p>
                    )}
                    {!isFormValid && passwords.newPassword && passwords.newPassword.length < 8 && (
                        <p className="mb-4 text-xs text-red-400 text-center">
                            Password must be at least 8 characters.
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={!isFormValid || isLoading}
                        className={`mt-2 w-full rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
                            isFormValid && !isLoading
                                ? 'bg-white text-zinc-950 hover:bg-zinc-200 cursor-pointer'
                                : 'cursor-not-allowed bg-zinc-800 text-zinc-500'
                        }`}
                    >
                        {isLoading ? 'Resetting Password...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
