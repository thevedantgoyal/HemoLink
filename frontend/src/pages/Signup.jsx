import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "../api/axiosConfig";
import { FaUser, FaEnvelope, FaLock, FaTint, FaCity, FaPhone, FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    city: "",
    bloodGroup: "",
    isDonor: false,
    needsBlood: false,
    needsBloodGroup: "",
    userType: "" // "donor", "recipient", "both", or ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
    setError("");
  };

  const handleUserTypeChange = (type) => {
    if (type === "donor") {
      setFormData({
        ...formData,
        userType: "donor",
        isDonor: true,
        needsBlood: false,
        needsBloodGroup: "" // Will be filtered out before sending
      });
    } else if (type === "recipient") {
      setFormData({
        ...formData,
        userType: "recipient",
        isDonor: false,
        needsBlood: true,
        bloodGroup: "" // Will be filtered out before sending
      });
    } else if (type === "both") {
      setFormData({
        ...formData,
        userType: "both",
        isDonor: true,
        needsBlood: true
      });
    }
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate user type selection
    if (!formData.userType) {
      setError("Please select whether you want to donate blood, need blood, or both");
      setLoading(false);
      return;
    }

    // Validate blood group requirements based on user type
    if (formData.isDonor && !formData.bloodGroup) {
      setError("Please select your blood group for donation");
      setLoading(false);
      return;
    }

    if (formData.needsBlood && !formData.needsBloodGroup) {
      setError("Please select the blood group you need");
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting registration with data:', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        city: formData.city,
        bloodGroup: formData.bloodGroup,
        isDonor: formData.isDonor,
        needsBlood: formData.needsBlood,
        needsBloodGroup: formData.needsBloodGroup,
        userType: formData.userType,
        role: 'user'
      });
      
      // Prepare registration data - only include fields that have values
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        city: formData.city || undefined,
        isDonor: formData.isDonor,
        needsBlood: formData.needsBlood,
        role: 'user'
      };

      // Only include bloodGroup if donor is selected and has a value
      if (formData.isDonor && formData.bloodGroup) {
        registrationData.bloodGroup = formData.bloodGroup;
      }

      // Only include needsBloodGroup if needsBlood is true and has a value
      if (formData.needsBlood && formData.needsBloodGroup) {
        registrationData.needsBloodGroup = formData.needsBloodGroup;
      }

      const response = await axios.post("/auth/register", registrationData);

      console.log('Registration response:', response.data);
      
      // Store user data and token in localStorage and update context
      login({
        ...response.data.user,
        token: response.data.token
      });
      
      // Redirect to home page
      navigate("/");
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response) {
        // Server responded with error status
        const errorMessage = err.response.data?.message || "Registration failed. Please try again.";
        const errorDetails = err.response.data?.errors ? err.response.data.errors.join(', ') : '';
        setError(errorMessage + (errorDetails ? `: ${errorDetails}` : ''));
      } else if (err.request) {
        // Request made but no response received
        setError("Network error. Please check your connection and try again.");
      } else {
        // Something else happened
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background Decorations */ }
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-200 rounded-full blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
      
      <motion.div
        className="max-w-2xl w-full relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */ }
        <div className="text-center mb-8">
          <motion.div
            className="inline-block p-4 bg-gradient-to-r from-red-600 to-rose-600 rounded-3xl mb-6 shadow-2xl"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <FaTint className="text-5xl text-white" />
          </motion.div>
          <h1 className="text-5xl font-black mb-3">
            <span className="bg-gradient-to-r from-red-600 via-rose-500 to-pink-600 bg-clip-text text-transparent">
              Join Our Mission
            </span>
          </h1>
          <p className="text-gray-600 text-lg">Create an account and start making a difference today</p>
        </div>

        {/* Signup Form */ }
        <motion.form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-2xl p-8 space-y-6 border border-gray-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Grid Layout for inputs */ }
          <div className="grid md:grid-cols-2 gap-6">
            {/* Name */ }
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Full Name *</label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                  placeholder="John Smith"
                />
              </div>
            </div>

            {/* Email */ }
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Email Address *</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */ }
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Password *</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Confirm Password */ }
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Confirm Password *</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Phone */ }
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Phone Number</label>
              <div className="relative">
                <FaPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                  placeholder="+1 555 123 4567"
                />
              </div>
            </div>

            {/* City */ }
            <div>
              <label className="block text-gray-700 font-semibold mb-2">City</label>
              <div className="relative">
                <FaCity className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                  placeholder="New York"
                />
              </div>
            </div>
          </div>

          {/* User Type Selection */}
          <div className="space-y-4">
            <label className="block text-gray-700 font-semibold mb-3 text-lg">
              I want to: <span className="text-red-600">*</span>
            </label>
            <div className="grid md:grid-cols-3 gap-4">
              {/* Donor Option */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`cursor-pointer border-2 rounded-xl p-6 transition-all ${
                  formData.userType === "donor"
                    ? 'border-red-600 bg-red-50 shadow-lg'
                    : 'border-gray-200 hover:border-red-300 bg-white'
                }`}
                onClick={() => handleUserTypeChange("donor")}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">🩸</div>
                  <h3 className="font-bold text-gray-800 mb-2">Donate Blood</h3>
                  <p className="text-sm text-gray-600">I want to help others by donating blood</p>
                  <input
                    type="radio"
                    name="userType"
                    value="donor"
                    checked={formData.userType === "donor"}
                    onChange={() => handleUserTypeChange("donor")}
                    className="mt-3"
                  />
                </div>
              </motion.div>

              {/* Recipient Option */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`cursor-pointer border-2 rounded-xl p-6 transition-all ${
                  formData.userType === "recipient"
                    ? 'border-red-600 bg-red-50 shadow-lg'
                    : 'border-gray-200 hover:border-red-300 bg-white'
                }`}
                onClick={() => handleUserTypeChange("recipient")}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">❤️</div>
                  <h3 className="font-bold text-gray-800 mb-2">Need Blood</h3>
                  <p className="text-sm text-gray-600">I need blood or may need blood in future</p>
                  <input
                    type="radio"
                    name="userType"
                    value="recipient"
                    checked={formData.userType === "recipient"}
                    onChange={() => handleUserTypeChange("recipient")}
                    className="mt-3"
                  />
                </div>
              </motion.div>

              {/* Both Option */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`cursor-pointer border-2 rounded-xl p-6 transition-all ${
                  formData.userType === "both"
                    ? 'border-red-600 bg-red-50 shadow-lg'
                    : 'border-gray-200 hover:border-red-300 bg-white'
                }`}
                onClick={() => handleUserTypeChange("both")}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">🤝</div>
                  <h3 className="font-bold text-gray-800 mb-2">Both</h3>
                  <p className="text-sm text-gray-600">I want to donate and may need blood</p>
                  <input
                    type="radio"
                    name="userType"
                    value="both"
                    checked={formData.userType === "both"}
                    onChange={() => handleUserTypeChange("both")}
                    className="mt-3"
                  />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Blood Group for Donor (shown if isDonor is true) */}
          {formData.isDonor && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="bg-red-50 rounded-xl p-6"
            >
              <label className="block text-gray-700 font-semibold mb-3">
                Your Blood Group (for donation) <span className="text-red-600">*</span>
              </label>
              <div className="grid grid-cols-4 gap-3">
                {bloodGroups.map((group) => (
                  <label
                    key={group}
                    className={`cursor-pointer border-2 rounded-xl p-3 text-center font-bold transition-all ${
                      formData.bloodGroup === group
                        ? 'border-red-600 bg-red-100 text-red-600'
                        : 'border-gray-200 hover:border-red-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="bloodGroup"
                      value={group}
                      checked={formData.bloodGroup === group}
                      onChange={handleChange}
                      className="hidden"
                    />
                    {group}
                  </label>
                ))}
              </div>
            </motion.div>
          )}

          {/* Blood Group Needed (shown if needsBlood is true) */}
          {formData.needsBlood && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="bg-rose-50 rounded-xl p-6"
            >
              <label className="block text-gray-700 font-semibold mb-3">
                Blood Group Needed <span className="text-red-600">*</span>
              </label>
              <div className="grid grid-cols-4 gap-3">
                {bloodGroups.map((group) => (
                  <label
                    key={group}
                    className={`cursor-pointer border-2 rounded-xl p-3 text-center font-bold transition-all ${
                      formData.needsBloodGroup === group
                        ? 'border-red-600 bg-red-100 text-red-600'
                        : 'border-gray-200 hover:border-red-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="needsBloodGroup"
                      value={group}
                      checked={formData.needsBloodGroup === group}
                      onChange={handleChange}
                      className="hidden"
                    />
                    {group}
                  </label>
                ))}
              </div>
            </motion.div>
          )}

          {/* Submit Button */ }
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-rose-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          {/* Divider */ }
          <div className="text-center text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-red-600 font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default Signup;