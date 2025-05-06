// src/components/shipment-creation/components/MobileStepNav.jsx
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const MobileStepNav = ({ steps, currentStep, setCurrentStep }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-2 px-3 border rounded-xl flex items-center justify-between text-sm"
            >
                <span className="font-medium text-gray-700">
                    Paso {currentStep + 1}: {steps[currentStep].label}
                </span>
                {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-xl shadow-lg z-20">
                    <ul className="py-1">
                        {steps.map((step, index) => (
                            <li key={step.id}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCurrentStep(index);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm ${currentStep === index
                                            ? 'bg-blue-50 text-blue-700 font-medium'
                                            : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {index + 1}. {step.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {isOpen && (
                <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default MobileStepNav;