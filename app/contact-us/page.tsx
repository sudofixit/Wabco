"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import MobileNavigation from "../../components/MobileNavigation";
import { useToast } from "../hooks/useToast";
import countryCodes from "@/lib/constants";
import Footer from "@/components/Footer";

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: string;
  subscribeToOffers: boolean;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

interface CountryCode {
  code: string;
  dialCode: string;
  name: string;
  flag: string;
}

export default function ContactUsPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
    vehicleBrand: "",
    vehicleModel: "",
    vehicleYear: "",
    subscribeToOffers: false,
  });
  const [countryCode, setCountryCode] = useState("+971");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null);

  const { success: showSuccess, error: showError } = useToast();

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = "Name is required";
      isValid = false;
    }
    if (!formData.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
      isValid = false;
    } else if (!/^\d+$/.test(formData.phone)) {
      errors.phone = "Phone number should contain only digits";
      isValid = false;
    } else if (formData.phone.length < 7 || formData.phone.length > 15) {
      errors.phone = "Phone number should be between 7 and 15 digits";
      isValid = false;
    }
    if (!formData.message.trim()) {
      errors.message = "Message is required";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (submitStatus) setSubmitStatus(null);
  };

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCountryCode(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showError("Please fix the errors in the form");
      setSubmitStatus({ success: false, message: "Please fix the errors in the form." });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("/api/contact-us", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          phone: countryCode + formData.phone,
          ...(formData.vehicleBrand || formData.vehicleModel || formData.vehicleYear
            ? {
              vehicleBrand: formData.vehicleBrand || undefined,
              vehicleModel: formData.vehicleModel || undefined,
              vehicleYear: formData.vehicleYear || undefined,
            }
            : {}),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setFormData({
          name: "",
          email: "",
          phone: "",
          message: "",
          vehicleBrand: "",
          vehicleModel: "",
          vehicleYear: "",
          subscribeToOffers: false,
        });
        setCountryCode("+971");
        showSuccess("Message sent successfully!");
        setSubmitStatus({ success: true, message: "Your message was sent successfully." });
      } else {
        const errorMessage = result.error || "Failed to send your message. Please try again.";
        showError(errorMessage);
        setSubmitStatus({ success: false, message: errorMessage });
      }
    } catch (error) {
      console.error("Contact form submission error:", error);
      const errorMessage = "Failed to send your message. Please try again.";
      showError(errorMessage);
      setSubmitStatus({ success: false, message: errorMessage });
    } finally {
      setIsSubmitting(false);
      // Auto-hide message after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000);
    }
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 21 }, (_, i) => currentYear - i);

  return (
    <div className="bg-white min-h-screen w-full flex flex-col items-center font-poppins">
      {/* Header */}
      <header className="w-full max-w-[1440px] flex items-center justify-between py-4 px-4 md:py-6 md:px-8 lg:px-16">
        <div className="flex items-center gap-4">
          <Image
            src="/Wabco Logo.jpeg"
            alt="Wabco Mobility Logo"
            width={180}
            height={24}
            className="md:w-[231px] md:h-[30px]"
          />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-10 text-lg font-medium text-[#0a1c58]">
          <Link href="/" className="hover:text-black transition">Home</Link>
          <Link href="/tire" className="hover:text-black transition">Tires</Link>
          <Link href="/service" className="hover:text-black transition">Services</Link>
          <Link href="/location" className="hover:text-black transition">Location</Link>
        </nav>

        {/* Desktop Contact Button */}
        <Link href="/contact-us" className="hidden lg:block">
          <button className="border-2 border-[#0a1c58] text-[#0a1c58] px-6 xl:px-8 py-2 rounded-full font-semibold text-base xl:text-lg hover:bg-[#0a1c58] hover:text-white transition">
            Contact Us
          </button>
        </Link>

        {/* Mobile Navigation */}
        <MobileNavigation />
      </header>

      {/* Hero Section */}
      <section className="relative w-full flex justify-center items-end overflow-hidden h-[400px] md:h-[500px] lg:h-[600px]">
        <Image
          src="/book now bg.png"
          alt="Contact Us Hero"
          fill
          className="object-cover"
          priority
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/15 to-transparent" />

        {/* Decorative line */}
        <svg className="absolute top-8 md:top-15 right-8 md:right-15 w-[calc(100%-4rem)] md:w-[calc(100%-7.5rem)] h-6" viewBox="0 0 1380 24" fill="none">
          <line x1="0" y1="12" x2="1370" y2="12" stroke="white" strokeWidth="2" />
          <circle cx="1370" cy="12" r="6" fill="white" />
        </svg>

        <div className="absolute left-0 bottom-0 flex flex-col items-start p-6 md:p-10 lg:p-16 w-full">
          <h1 className="font-poppins text-2xl md:text-3xl lg:text-[44px] font-semibold text-white leading-tight mb-4 md:mb-[18px] max-w-3xl">
            Get in Touch with WABCO Mobility
          </h1>
          <p className="font-poppins text-base md:text-lg text-white max-w-xl md:max-w-2xl">
            Ready to enhance your driving experience? Contact us for inquiries, bookings, or expert advice on tires and services.
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="w-full flex flex-col items-center bg-white py-12 md:py-16 px-4">
        <div className="w-full max-w-[1440px] flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
          {/* Left Card */}
          <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col items-center p-0 w-full lg:w-[400px] mb-8 lg:mb-0 h-[300px] md:h-[350px] lg:h-[420px]">
            <Image src="/book now car.png" alt="Contact Us Car" fill className="object-cover" />
            {/* Overlay */}
            <div className="absolute inset-0 flex flex-col justify-between items-center p-4 md:p-6 bg-black/45">
              <div className="w-full text-left mb-4 md:mb-8">
                <h2 className="text-white font-bold text-xl md:text-2xl leading-tight mb-4 md:mb-8 font-poppins max-w-[260px]">
                  Contact WABCO Mobility for All Your Tire & Service Needs
                </h2>
              </div>
              <div className="flex flex-col gap-3 md:gap-4 w-full">
                <a href="tel:+97104746873" className="w-full flex items-center gap-3 border border-white bg-transparent text-white rounded-lg py-3 px-4 font-semibold text-sm md:text-base justify-start transition hover:bg-white/10 focus:bg-white/10">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.2 2.2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="font-semibold">Call Us : <span className="font-normal">+971 04 746 8773</span></span>
                </a>
                <a href="mailto:wabcomobility@tire.com" className="w-full flex items-center gap-3 border border-white bg-transparent text-white rounded-lg py-3 px-4 font-semibold text-sm md:text-base justify-start transition hover:bg-white/10 focus:bg-white/10">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path d="M4 4h16v16H4V4zm0 0l8 8m0 0l8-8m-8 8v8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="font-semibold">Mail Us : <span className="font-normal">wabcomobility@tire.com</span></span>
                </a>
                <Link href="/location" className="w-full flex items-center gap-3 border border-white bg-transparent text-white rounded-lg py-3 px-4 font-semibold text-sm md:text-base justify-start transition hover:bg-white/10 focus:bg-white/10">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="10" r="3" stroke="white" strokeWidth="2" />
                    <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07-7.07l-1.41 1.41M6.34 17.66l-1.41 1.41m12.02 0l-1.41-1.41M6.34 6.34L4.93 4.93" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span className="font-semibold">Find Us : <span className="font-normal">Click Here</span></span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Form */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6 w-full">
            {/* Vehicle Information Row */}
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <div className="flex-1 relative">
                <label className="block mb-2 font-semibold text-[#232f53]">Vehicle Brand</label>
                <select
                  name="vehicleBrand"
                  value={formData.vehicleBrand}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-[#232f53] bg-white focus:outline-none focus:ring-2 focus:ring-[#232f53] text-base font-medium appearance-none pr-14"
                >
                  <option value="">Select Vehicle</option>
                  <option value="Toyota">Toyota</option>
                  <option value="Honda">Honda</option>
                  <option value="Nissan">Nissan</option>
                  <option value="BMW">BMW</option>
                  <option value="Mercedes-Benz">Mercedes-Benz</option>
                  <option value="Audi">Audi</option>
                  <option value="Ford">Ford</option>
                  <option value="Chevrolet">Chevrolet</option>
                  <option value="Hyundai">Hyundai</option>
                  <option value="Kia">Kia</option>
                  <option value="Other">Other</option>
                </select>
                <span className="pointer-events-none absolute right-6 top-[70%] -translate-y-1/2 flex items-center">
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                    <path d="M6 8l4 4 4-4" stroke="#232f53" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
              <div className="flex-1 relative">
                <label className="block mb-2 font-semibold text-[#232f53]">Vehicle Model</label>
                <input
                  type="text"
                  name="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-[#232f53] bg-white focus:outline-none focus:ring-2 focus:ring-[#232f53] text-base font-medium"
                  placeholder="Enter model"
                />
              </div>
              <div className="flex-1 relative">
                <label className="block mb-2 font-semibold text-[#232f53]">Vehicle Year</label>
                <select
                  name="vehicleYear"
                  value={formData.vehicleYear}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-[#232f53] bg-white focus:outline-none focus:ring-2 focus:ring-[#232f53] text-base font-medium appearance-none pr-14"
                >
                  <option value="">Select Year</option>
                  {yearOptions.map(year => (
                    <option key={year} value={year.toString()}>{year}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-6 top-[70%] -translate-y-1/2 flex items-center">
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                    <path d="M6 8l4 4 4-4" stroke="#232f53" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Contact Information */}
            <div className="flex flex-col gap-4">
              <div>
                <label className="block mb-2 font-semibold text-[#232f53]">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${validationErrors.name ? 'border-red-500' : 'border-gray-300'} text-[#232f53] bg-white focus:outline-none focus:ring-2 focus:ring-[#232f53] text-base font-medium`}
                  placeholder="Enter your name"
                />
                {validationErrors.name && (
                  <p className="mt-1 text-red-500 text-sm">{validationErrors.name}</p>
                )}
              </div>
              <div>
                <label className="block mb-2 font-semibold text-[#232f53]">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${validationErrors.email ? 'border-red-500' : 'border-gray-300'} text-[#232f53] bg-white focus:outline-none focus:ring-2 focus:ring-[#232f53] text-base font-medium`}
                  placeholder="Enter your email"
                />
                {validationErrors.email && (
                  <p className="mt-1 text-red-500 text-sm">{validationErrors.email}</p>
                )}
              </div>
              <div>
                <label className="block mb-2 font-semibold text-[#232f53]">Phone Number *</label>
                <div className="flex">
                  <select
                    value={countryCode}
                    onChange={handleCountryCodeChange}
                    className="px-3 rounded-l-lg border border-gray-300 bg-[#f7f7f7] text-[#232f53] font-medium focus:outline-none focus:ring-2 focus:ring-[#232f53]"
                  >
                    {countryCodes.map((country) => (
                      <option key={country.code} value={country.dialCode}>
                        {country.flag} {country.dialCode}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`flex-1 px-4 py-3 rounded-r-lg border-t border-b border-r ${validationErrors.phone ? 'border-red-500' : 'border-gray-300'} text-[#232f53] bg-white focus:outline-none focus:ring-2 focus:ring-[#232f53] text-base font-medium`}
                    placeholder="Enter your phone number"
                  />
                </div>
                {validationErrors.phone && (
                  <p className="mt-1 text-red-500 text-sm">{validationErrors.phone}</p>
                )}
              </div>
              <div>
                <label className="block mb-2 font-semibold text-[#232f53]">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${validationErrors.message ? 'border-red-500' : 'border-gray-300'} text-[#232f53] bg-white focus:outline-none focus:ring-2 focus:ring-[#232f53] text-base font-medium`}
                  rows={4}
                  placeholder="Tell us how we can help you..."
                />
                {validationErrors.message && (
                  <p className="mt-1 text-red-500 text-sm">{validationErrors.message}</p>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="offers"
                  name="subscribeToOffers"
                  checked={formData.subscribeToOffers}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded border border-gray-300 focus:ring-2 focus:ring-[#232f53]"
                />
                <label htmlFor="offers" className="text-[#232f53] text-base">Want to get offers and updates from us?</label>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#232f53] text-white py-3 rounded-lg font-semibold text-lg mt-2 hover:bg-[#1a2040] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
              {submitStatus && (
                <div
                  className={`p-4 mb-4 rounded-lg text-center font-semibold transition-opacity duration-300
      ${submitStatus.success
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                    }`}
                >
                  {submitStatus.message}
                </div>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="w-full bg-[#f7f7f7] py-8 md:py-12 px-4 flex flex-col items-center font-poppins">
        <div className="w-full max-w-[1440px] flex flex-col gap-8 md:gap-12">
          {/* Top Row: Columns + Subscribe */}
          <div className="flex flex-col lg:flex-row items-start justify-center gap-8 lg:gap-50 w-full">
            {/* Columns */}
            <Footer />
          </div>
          {/* Divider */}
          <div className="border-t border-[#e5e7eb] w-full mt-4 md:mt-7" />
          {/* Bottom Row: Logo and Socials */}
          <div className="w-full flex flex-col md:flex-row justify-between items-center pt-4 md:pt-8 gap-6">
            <div>
              <Image
                src="/Wabco Logo.jpeg"
                alt="Wabco Mobility Logo"
                width={180}
                height={24}
                className="md:w-[231px] md:h-[30px]"
              />
            </div>
            <div className="flex gap-4 md:gap-6">
              <a href="#" className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border border-[#e5e7eb] text-[#0a1c58] hover:bg-[#0a1c58] hover:text-white transition">
                <svg width="16" height="16" className="md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 10.28h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.89v1.23h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v4.72z" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border border-[#e5e7eb] text-[#0a1c58] hover:bg-[#0a1c58] hover:text-white transition">
                <svg width="16" height="16" className="md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.675 0h-21.35C.6 0 0 .6 0 1.326v21.348C0 23.4.6 24 1.326 24h11.495v-9.294H9.692v-3.622h3.129V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.4 24 24 23.4 24 22.674V1.326C24 .6 23.4 0 22.675 0z" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border border-[#e5e7eb] text-[#0a1c58] hover:bg-[#0a1c58] hover:text-white transition">
                <svg width="16" height="16" className="md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.916 4.916 0 0 0-8.38 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.856 3.17 0 2.188 1.115 4.117 2.823 5.247a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.057 0 14.009-7.496 14.009-13.986 0-.213-.005-.425-.014-.636A9.936 9.936 0 0 0 24 4.557z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}