import React,{useMemo,useRef,useState} from 'react';
import { useLocation,useNavigate } from 'react-router-dom';
import apiClient from '../services/api.js';
const VerifyEmail=()=>{
    const location=useLocation();
    const navigate=useNavigate();
    const inputRefs=useRef([]);
    const email=location.state?.email || '';
    const [digits,setDigits]=useState(['','','','','','']);
    const [error,setError]=useState('');
    const [info,setInfo]=useState('');
    const [isVerifying,setIsVerifying]=useState(false);
    const [isResending,setIsResending]=useState(false);

    const code=useMemo(()=>digits.join(''),[digits]);
    const isCodeComplete=code.length===6 && digits.every((d)=>d!=='');
    const handleDigitChange=(index,value)=>{
        if (!/^\d?$/.test(value)) return;
        const next = [...digits];
        next[index]=value;
        setDigits(next);
        if(error) setError('');
        if(info) setInfo('');
        if(value && index<5){
            inputRefs.current[index+1]?.focus();
        }
    };
    const handleKeyDown=(index,e)=>{
        if(e.key==='Backspace' && !digits[index] && index>0){
            inputRefs.current[index-1]?.focus();
        }
        if(e.key==='ArrowLeft' && index>0){
            inputRefs.current[index-1]?.focus();
        }
        if(e.kry==='ArrowRight' && index<5){
            inputRefs.current[index+1]?.focus();
        }
    }
    const handlePaste=(e)=>{
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!pasted) return;
        e.preventDefault();

        const next = ['','','','','',''];
        pasted.split('').forEach((ch, i) => {
            next[i] = ch;
        });
        setDigits(next);
        inputRefs.current[Math.min(pasted.length, 6) - 1]?.focus();
    }
    const handleVerify=async (e)=>{
        e.preventDefault();
        if(!isCodeComplete) return;
        setIsVerifying(true);
        setError('');
        setInfo('');
        try {
            await apiClient.post('users/verify-email',{code});
            setInfo('email verified successfully');
            navigate('/');
        } catch (err) {
            setError(err?.response?.data?.message || 'Verification failed. Please try again.');
        }
        finally{
            setIsVerifying(false);
        }
    };
    handleResend= async ()=>{
        if(!email) {
            setError('Email not found. Please sign up again.'); return;
        }
        setIsResending(true);
        setError(); setInfo('');
        try{
            await apiClient.post('users/resend-verification-code',{email})
        }
        catch(err){
            setError(
                err?.response?.data?.message ||
                'Could not resend code. Please try again.'
            );
        }
        finally{
            setIsResending(false);
        }
    }
    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <div className="w-full max-w-md border-2 border-red-600 rounded-xl p-8 bg-black shadow-[0_0_20px_rgba(220,38,38,0.2)]">
                <h2 className="text-3xl font-bold text-center tracking-wide mb-4">
                    VERIFY EMAIL
                </h2>

                <p className="text-sm text-gray-300 mb-6 text-center">
                    A verification code was sent to 
                    <span className="text-white font-semibold">{email || 'your email'}</span>.
                    Enter the 6-digit code below.
                </p>

                {error && (
                    <div className="mb-4 border border-red-500 bg-red-950 text-red-200 rounded px-4 py-3 text-sm">
                        {error}
                    </div>
                )}

                {info && (
                    <div className="mb-4 border border-red-600 bg-black text-white rounded px-4 py-3 text-sm">
                        {info}
                    </div>
                )}

                <form onSubmit={handleVerify} onPaste={handlePaste} noValidate>
                    <div className="flex justify-between gap-2 mb-6">
                        {digits.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => {
                                    inputRefs.current[index] = el;
                                }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleDigitChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-12 text-center text-xl bg-black text-white border border-red-600 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                                aria-label={`Verification digit ${index + 1}`}
                                required
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={!isCodeComplete || isVerifying || !email}
                        className={`w-full py-3 rounded font-bold uppercase tracking-wider transition-all ${
                            isCodeComplete && !isVerifying && email
                                ? 'bg-red-600 text-white hover:bg-red-500 hover:shadow-[0_0_15px_rgba(220,38,38,0.5)]'
                                : 'bg-black text-gray-500 border border-red-900 cursor-not-allowed opacity-70'
                        }`}
                    >
                        {isVerifying ? 'Verifying...' : 'Verify Email'}
                    </button>
                </form>

                <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending || !email}
                    className={`w-full mt-3 py-3 rounded font-bold uppercase tracking-wider transition-all ${
                        !isResending && email
                            ? 'bg-black text-white border border-red-600 hover:bg-red-950'
                            : 'bg-black text-gray-500 border border-red-900 cursor-not-allowed opacity-70'
                    }`}
                >
                    {isResending ? 'Resending...' : 'Resend Verification Code'}
                </button>
            </div>
        </div>
    );
}
export default VerifyEmail;