import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api.js';
const SignUp=()=> {
    const navigate = useNavigate();
    // State for text inputs
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        fullName: '',
        password: '',
    });

    // State for file inputs
    const [files, setFiles] = useState({
        avatar: null,
        coverImage: null,
    });

    // State for UI feedback
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Dynamic Validation Check
    // The button will only enable if all these conditions are true
    const isFormValid =
        formData.email.trim() !== '' &&
        formData.username.trim() !== '' &&
        formData.fullName.trim() !== '' &&
        formData.password.length >= 8 &&
        files.avatar !== null;

    // Handlers
    const handleTextChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (error) setError(''); // Clear error when user starts typing again
    };

    const handleFileChange = (e) => {
        const { name, files: selectedFiles } = e.target;
        // We only want the first file selected
        setFiles((prev) => ({ ...prev, [name]: selectedFiles[0] }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid) return;

        setIsLoading(true);
        setError('');

        // Prepare FormData for multipart/form-data upload
        const payload = new FormData();
        payload.append('email', formData.email);
        payload.append('username', formData.username);
        payload.append('fullName', formData.fullName);
        payload.append('password', formData.password);
        payload.append('avatar', files.avatar);

        // Only append coverImage if the user actually uploaded one
        if (files.coverImage) {
            payload.append('coverImage', files.coverImage);
        }

        try {
            const { data, status } = await apiClient.post('/users/register', payload);
            navigate('/verify-email',{state: { email: formData.email }});
        } catch (err) {
            setError(err?.response?.data?.message || 
                'Network error. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Reusable styling strings to keep JSX clean
    const inputStyle = "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none transition-colors mb-4";
    const labelStyle = "mb-1.5 block text-sm font-medium text-zinc-300";
    const fileInputStyle = `${inputStyle} file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-zinc-700 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-600 p-2`;

    return (
        <div className="flex flex-1 items-center justify-center p-4 py-8">
            <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-xl shadow-black/30 backdrop-blur-sm">

                <h2 className="mb-6 text-center text-2xl font-bold tracking-tight text-white">
                    CREATE ACCOUNT
                </h2>

                {/* Error Message Display */}
                {error && (
                    <div className="mb-6 rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div>
                        <label className={labelStyle}>Email </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleTextChange}
                            className={inputStyle}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className={labelStyle}>Username </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleTextChange}
                            className={inputStyle}
                            required
                        />
                    </div>

                    <div>
                        <label className={labelStyle}>Full Name </label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleTextChange}
                            className={inputStyle}
                            required
                        />
                    </div>

                    <div>
                        <label className={labelStyle}>Password *</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleTextChange}
                            className={inputStyle}
                            required
                        />
                    </div>

                    <div>
                        <label className={labelStyle}>Avatar Image </label>
                        <input
                            type="file"
                            name="avatar"
                            accept="image/*"
                            onChange={handleFileChange}
                            className={fileInputStyle}
                            required
                        />
                    </div>

                    <div>
                        <label className={labelStyle}>Cover Image</label>
                        <input
                            type="file"
                            name="coverImage"
                            accept="image/*"
                            onChange={handleFileChange}
                            className={fileInputStyle}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!isFormValid || isLoading}
                        className={`mt-2 w-full rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
                            isFormValid && !isLoading
                                ? 'bg-white text-zinc-950 hover:bg-zinc-200 cursor-pointer'
                                : 'cursor-not-allowed bg-zinc-800 text-zinc-500'
                        }`}
                    >
                        {isLoading ? 'Processing...' : 'Sign Up'}
                    </button>
                </form>
            </div>
        </div>
    );
}
export default SignUp;
