// src/components/common/Footer/Footer.tsx
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="mb-8 md:mb-0">
            <Link to="/" className="flex items-center">
              <img className="h-8 w-auto" src="/logo-white.svg" alt="MediConnect" />
              <span className="ml-2 text-xl font-bold text-white">MediConnect</span>
            </Link>
            <p className="mt-4 text-sm max-w-md">
              Your trusted healthcare platform connecting patients with quality healthcare providers
              for in-clinic, telemedicine, and home visit appointments.
            </p>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/doctors" className="text-gray-400 hover:text-white text-sm">
                  Find Doctors
                </Link>
              </li>
              <li>
                <Link to="/clinics" className="text-gray-400 hover:text-white text-sm">
                  Clinics
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* For Patients & Doctors */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              For Users
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/login" className="text-gray-400 hover:text-white text-sm">
                  Patient Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-400 hover:text-white text-sm">
                  Register as Patient
                </Link>
              </li>
              <li>
                <Link to="/doctor/register" className="text-gray-400 hover:text-white text-sm">
                  Register as Doctor
                </Link>
              </li>
              <li>
                <Link to="/appointment/book" className="text-gray-400 hover:text-white text-sm">
                  Book Appointment
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white text-sm">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Contact Us
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <div className="ml-3 text-gray-400 text-sm">support@mediconnect.com</div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <div className="ml-3 text-gray-400 text-sm">+1 (555) 123-4567</div>
              </li>
              <li className="mt-4 text-gray-400 text-sm">
                <p>1234 Healthcare Blvd</p>
                <p>Suite 500</p>
                <p>Wellness City, MC 12345</p>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            &copy; {currentYear} MediConnect. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link to="/privacy" className="text-gray-400 hover:text-white text-sm">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-white text-sm">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-gray-400 hover:text-white text-sm">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
