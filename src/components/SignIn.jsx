import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api.js';
import {useAuth} from '../context/AuthContext.jsx';
const SignIn = () => {
    const navigate = useNavigate();
    const {login}=useAuth();
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
            const response=await apiClient.post('/users/login', {
                identifier: formData.identifier,
                password: formData.password,
            });
            login(response.data.data.user);
            navigate('/');
        } catch (err) {
            console.log(err);
            setError(
                err?.response?.data?.message ||
                'Network error. Please check your connection and try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const inputStyle =
        'w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none transition-colors mb-4';
    const labelStyle = 'mb-1.5 block text-sm font-medium text-zinc-300';

    return (
        <div className="flex flex-1 items-center justify-center p-4 pb-12">
            <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-xl shadow-black/30 backdrop-blur-sm">
                <h2 className="mb-6 text-center text-2xl font-bold tracking-tight text-white">
                    SIGN IN
                </h2>

                {error && (
                    <div className="mb-6 rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-300">
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
                        className={`mt-2 w-full rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
                            isFormValid && !isLoading
                                ? 'bg-white text-zinc-950 hover:bg-zinc-200 cursor-pointer'
                                : 'cursor-not-allowed bg-zinc-800 text-zinc-500'
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
