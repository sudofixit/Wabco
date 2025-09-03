"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TireSizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableSizes: {
    widths: string[];
    profiles: string[];
    diameters: string[];
  };
}

export default function TireSizeModal({ isOpen, onClose, availableSizes }: TireSizeModalProps) {
  const [step, setStep] = useState<'width' | 'profile' | 'diameter'>('width');
  const [selectedWidth, setSelectedWidth] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [selectedDiameter, setSelectedDiameter] = useState<string | null>(null);
  const router = useRouter();

  // Reset modal state when it closes
  useEffect(() => {
    if (!isOpen) {
      setStep('width');
      setSelectedWidth(null);
      setSelectedProfile(null);
      setSelectedDiameter(null);
    }
  }, [isOpen]);

  // Handle clicks outside modal to close it
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleWidthSelect = (width: string) => {
    setSelectedWidth(width);
    setStep('profile');
  };

  const handleProfileSelect = (profile: string) => {
    setSelectedProfile(profile);
    setStep('diameter');
  };

  const handleDiameterSelect = (diameter: string) => {
    setSelectedDiameter(diameter);
  };

  const handleSearchTires = () => {
    // Build query params only for selected values
    const params = new URLSearchParams();
    if (selectedWidth) params.append('width', selectedWidth);
    if (selectedProfile) params.append('ratio', selectedProfile); // Note: using 'ratio' to match TireClientPage
    if (selectedDiameter) params.append('rimSize', selectedDiameter); // Note: using 'rimSize' to match TireClientPage

    const queryString = params.toString();
    router.push(`/tire${queryString ? '?' + queryString : ''}`);
    onClose();
  };

  const handleBackStep = () => {
    if (step === 'diameter') {
      setSelectedDiameter(null);
      setStep('profile');
    } else if (step === 'profile') {
      setSelectedProfile(null);
      setStep('width');
    }
  };

  if (!isOpen) return null;

  const getCurrentOptions = () => {
    if (step === 'width') return availableSizes.widths || [];
    if (step === 'profile') return availableSizes.profiles || [];
    return availableSizes.diameters || [];
  };

  const getCurrentStepLabel = () => {
    if (step === 'width') return 'Width';
    if (step === 'profile') return 'Profile';
    return 'Diameter';
  };

  const handleOptionSelect = (value: string) => {
    if (step === 'width') {
      handleWidthSelect(value);
    } else if (step === 'profile') {
      handleProfileSelect(value);
    } else {
      handleDiameterSelect(value);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Modal Content */}
      <div
        className={`bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden transform transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with breadcrumb and close button */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 text-lg font-poppins">
            <span className={step === 'width' ? 'text-[#0a1c58] font-semibold' : 'text-gray-400'}>
              Width
            </span>
            <span className="text-gray-400">›</span>
            <span className={step === 'profile' ? 'text-[#0a1c58] font-semibold' : 'text-gray-400'}>
              Profile
            </span>
            <span className="text-gray-400">›</span>
            <span className={step === 'diameter' ? 'text-[#0a1c58] font-semibold' : 'text-gray-400'}>
              Diameter
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#0a1c58] hover:text-[#132b7c] text-2xl font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Selected values display */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2 text-lg font-poppins">
            <span className={selectedWidth ? "font-semibold text-black" : "text-gray-400"}>
              {selectedWidth || "Width"}
            </span>
            <span className="text-gray-400">›</span>
            <span className={selectedProfile ? "font-semibold text-black" : "text-gray-400"}>
              {selectedProfile || "Profile"}
            </span>
            <span className="text-gray-400">›</span>
            <span className={selectedDiameter ? "font-semibold text-black" : "text-gray-400"}>
              {selectedDiameter || "Diameter"}
            </span>
          </div>
        </div>

        {/* Options Grid */}
        <div className="p-6">
          <h3 className="text-xl font-semibold text-black mb-4 font-poppins">
            Select {getCurrentStepLabel()}
          </h3>
          {getCurrentOptions().length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Loading available {getCurrentStepLabel().toLowerCase()} options...
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3 max-h-80 overflow-y-auto">
              {getCurrentOptions().map((option) => (
                <button
                  key={option}
                  onClick={() => handleOptionSelect(option)}
                  className="px-4 py-3 text-center border border-gray-300 rounded-lg hover:border-[#0a1c58] hover:bg-[#0a1c58] hover:text-white transition-all duration-200 font-poppins font-medium text-black"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between gap-4">
            {step !== 'width' && (
              <button
                onClick={handleBackStep}
                className="px-5 py-2.5 text-[#0a1c58] border border-gray-300 rounded-lg hover:border-[#0a1c58] hover:bg-[#f8f9ff] transition-all duration-200 font-poppins font-medium flex items-center gap-2 min-w-[90px] cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back
              </button>
            )}

            <div className="flex-1" />

            <div className="flex gap-3">
              {/* Skip button */}
              {step !== 'diameter' && (
                <button
                  onClick={() => {
                    if (step === 'width') {
                      setStep('profile');
                    } else if (step === 'profile') {
                      setStep('diameter');
                    }
                  }}
                  className="px-5 py-2.5 text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-all duration-200 font-poppins font-medium flex items-center gap-2 min-w-[90px] cursor-pointer"
                >
                  Skip
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}

              {/* Search button */}
              <button
                onClick={handleSearchTires}
                className="px-6 py-3 bg-[#0a1c58] text-white rounded-lg hover:bg-[#132b7c] transition-all duration-200 font-poppins font-semibold flex items-center gap-2 shadow-sm hover:shadow-md min-w-[140px] justify-center cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Search Tires
              </button>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
} 