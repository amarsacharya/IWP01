import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(({
    label,
    error,
    type = 'text',
    className = '',
    fullWidth = true,
    ...props
}, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = type === 'password';
    const inputType = isPasswordType && showPassword ? 'text' : type;
    return (
        <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    ref={ref}
                    type={inputType}
                    className={`
          block w-full rounded-md border-gray-300 shadow-sm
          focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm
          bg-white border text-gray-900 px-3 py-2
          ${isPasswordType ? 'pr-10' : ''}
          ${error ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500' : ''}
          ${props.disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
        `}
                    {...props}
                />
                {isPasswordType && (
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-500"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
