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
            const { data, status } = await apiClient.post('/users/signup', payload);
            navigate('/verify-email',{state: { email: formData.email }});
        } catch (err) {
            setError(err?.response?.data?.message || 
                'Network error. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Reusable styling strings to keep JSX clean
    const inputStyle = "w-full bg-black text-white border border-red-600 rounded p-3 focus:outline-none focus:ring-2 focus:ring-red-500 mb-5 placeholder-gray-500 transition-shadow";
    const labelStyle = "block text-white font-semibold mb-2 text-sm";
    const fileInputStyle = `${inputStyle} file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-bold file:bg-red-600 file:text-white hover:file:bg-red-500 file:cursor-pointer p-2`;

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="bg-black border-2 border-red-600 rounded-xl p-8 w-full max-w-md shadow-[0_0_20px_rgba(220,38,38,0.2)]">

                <h2 className="text-3xl font-bold text-white mb-6 text-center tracking-wide">
                    CREATE ACCOUNT
                </h2>

                {/* Error Message Display */}
                {error && (
                    <div className="bg-red-950 border border-red-500 text-red-200 px-4 py-3 rounded mb-6 text-sm font-medium">
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
                        className={`w-full py-3 mt-4 rounded font-bold uppercase tracking-wider transition-all duration-200 ${
                            isFormValid && !isLoading
                                ? 'bg-red-600 text-white hover:bg-red-500 hover:shadow-[0_0_15px_rgba(220,38,38,0.5)] cursor-pointer'
                                : 'bg-black text-gray-500 border border-red-900 cursor-not-allowed opacity-70'
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