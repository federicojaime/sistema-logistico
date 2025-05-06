// src/components/shipment-creation/components/StepsProgress.jsx
import React from 'react';
import { Check } from 'lucide-react';

const StepsProgress = ({ steps, currentStep }) => {
    return (
        <div className="relative">
            {/* Línea de conexión */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2"></div>

            {/* Pasos */}
            <div className="relative flex justify-between items-center">
                {steps.map((step, index) => {
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep;

                    return (
                        <div key={step.id} className="flex flex-col items-center z-10">
                            {/* Círculo indicador */}
                            <div
                                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${isActive
                                        ? 'border-blue-600 bg-blue-600 text-white'
                                        : isCompleted
                                            ? 'border-green-500 bg-green-500 text-white'
                                            : 'border-gray-300 bg-white text-gray-400'
                                    }`}
                            >
                                {isCompleted ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    <span className="text-sm font-medium">{index + 1}</span>
                                )}
                            </div>

                            {/* Etiqueta */}
                            <span
                                className={`mt-2 text-xs font-medium ${isActive
                                        ? 'text-blue-600'
                                        : isCompleted
                                            ? 'text-green-600'
                                            : 'text-gray-500'
                                    }`}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StepsProgress;