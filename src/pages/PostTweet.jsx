import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api.js';

const PostTweet=()=>{
    const navigate=useNavigate();
    const [formData,setFormData]=useState({
        content:'',
        image:'',
    });
    const [files,setFiles]=useState({
        image=null
    })
    const [error,setError]=useState(null);
    const [loading,setLoading]=useState(false);

    const isFormValid=
        formData.content.trim()!==''

    const handleFileChange = (e) => {
        const { name, files: selectedFiles } = e.target;
        setFiles((prev) => ({ ...prev, [name]: selectedFiles[0] }));
        if (error) setError('');
    };
    const handleTextChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (error) setError(''); // Clear error when user starts typing again
    };
    const handleSubmit=async (e)=>{
        e.preventDefault();
        if(!isFormValid) return;
        const payload=new FormData();
        payload.append('content',formData.content);
        if(files.image)
            payload.append('image',formData.image);
        try {
            const response=await apiClient.post('/tweets',payload);
            navigate(`videos/view?q=${response.data.data.tweet._id}`);
        } catch (err) {
            setError(err?.response?.data?.message || 
                'Network error. Please check your connection and try again.');
        }
        finally{
            setLoading(false);
        }
    }
    const inputStyle = "w-full bg-black text-white border border-red-600 rounded p-3 focus:outline-none focus:ring-2 focus:ring-red-500 mb-5 placeholder-gray-500 transition-shadow";
    const labelStyle = "block text-white font-semibold mb-2 text-sm";
    const fileInputStyle = `${inputStyle} file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-bold file:bg-red-600 file:text-white hover:file:bg-red-500 file:cursor-pointer p-2`;
    return(
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="bg-black border-2 border-red-600 rounded-xl p-8 w-full max-w-md shadow-[0_0_20px_rgba(220,38,38,0.2)]">

                <h2 className="text-3xl font-bold text-white mb-6 text-center tracking-wide">
                    POST TWEET
                </h2>

                {/* Error Message Display */}
                {error && (
                    <div className="bg-red-950 border border-red-500 text-red-200 px-4 py-3 rounded mb-6 text-sm font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div>
                        <label className={labelStyle}>Content </label>
                        <input
                            type="text"
                            name="content"
                            value={formData.content}
                            onChange={handleTextChange}
                            className={inputStyle}
                            required
                        />
                    </div>
                    <div>
                        <label className={labelStyle}>Image </label>
                        <input
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={handleFileChange}
                            className={fileInputStyle}
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
                        {isLoading ? 'Processing...' : 'Post Tweet'}
                    </button>
                </form>
            </div>
        </div>
    )
}
export default PostTweet;