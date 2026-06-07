import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api.js';

const SignIn = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        identifier: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const isFormValid =
        formData.identifier.trim() !== '' &&
        formData.password.length >= 8;
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (error) setError('');
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid) return;
        setIsLoading(true);
        setError('');
        try {
            await apiClient.post('/users/login', {
                identifier: formData.identifier,
                password: formData.password,
            });

            navigate('/');
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                'Network error. Please check your connection and try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const inputStyle =
        'w-full bg-black text-white border border-red-600 rounded p-3 focus:outline-none focus:ring-2 focus:ring-red-500 mb-5 placeholder-gray-500 transition-shadow';
    const labelStyle = 'block text-white font-semibold mb-2 text-sm';

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="bg-black border-2 border-red-600 rounded-xl p-8 w-full max-w-md shadow-[0_0_20px_rgba(220,38,38,0.2)]">
                <h2 className="text-3xl font-bold text-white mb-6 text-center tracking-wide">
                    SIGN IN
                </h2>

                {error && (
                    <div className="bg-red-950 border border-red-500 text-red-200 px-4 py-3 rounded mb-6 text-sm font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div>
                        <label className={labelStyle}>Username or Email</label>
                        <input
                            type="text"
                            name="identifier"
                            value={formData.identifier}
                            onChange={handleChange}
                            className={inputStyle}
                            placeholder="Enter username or email"
                            required
                        />
                    </div>

                    <div>
                        <label className={labelStyle}>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={inputStyle}
                            placeholder="Min. 8 characters"
                            required
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
                        {isLoading ? 'Processing...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignIn;