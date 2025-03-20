import React from "react";

const About = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 mt-10 bg-white rounded-xl shadow-md">
      <h1 className="text-3xl font-bold mb-4 text-center text-blue-600">
        About GPI – Geo-based Presence Indicator
      </h1>
      <p className="text-gray-700 mb-4">
        GPI (Geo-based Presence Indicator) is a smart attendance tracking system
        that uses GPS technology to ensure students are physically present
        within a predefined radius of the classroom before their attendance is
        marked. It brings accuracy, transparency, and ease to attendance
        management for educational institutions.
      </p>

      <h2 className="text-2xl font-semibold mb-2 text-blue-500">Key Features</h2>
      <ul className="list-disc list-inside text-gray-800 mb-4">
        <li>📍 Geolocation-based attendance validation</li>
        <li>📝 Easy class and student form generation</li>
        <li>🔐 Secure and efficient backend with Flask & MongoDB</li>
        <li>📊 Real-time data access for class and student records</li>
        <li>🚀 Smooth user experience via React frontend</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-2 text-blue-500">Technology Stack</h2>
      <ul className="list-disc list-inside text-gray-800 mb-4">
        <li>Frontend: React, React Router, Toastify</li>
        <li>Backend: Flask, PyMongo, Haversine</li>
        <li>Database: MongoDB Atlas</li>
        <li>Deployment: Vercel (Frontend), Localhost/Cloud (Backend)</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-2 text-blue-500">Our Mission</h2>
      <p className="text-gray-700 mb-4">
        To simplify and modernize classroom management by delivering a reliable,
        geolocation-based attendance system that saves time and ensures
        accuracy.
      </p>

      <p className="text-gray-600 text-sm text-center">
        🌐 Learn more or contribute at{" "}
        <a
          href="https://github.com/AKACHI-4/GPI"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          GitHub Repository
        </a>
      </p>
    </div>
  );
};

export default About;
