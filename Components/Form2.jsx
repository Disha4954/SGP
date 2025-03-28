import React, { useState, useEffect, useRef } from "react";
import yaml from "js-yaml";
import { useLocation } from "react-router-dom";
import "../index.css";

function Form2() {
  const location = useLocation();
  const urls = location.pathname.split("/");

  const [studentData, setData] = useState({
    name: "",
    rollno: 0,
    studentid: "",
    latitude: 0.0,
    longitude: 0.0,
    present: false,
  });

  const [submitStatus, setSubmitStatus] = useState(false);
  const [formError, setFormError] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setData((prevData) => ({
        ...prevData,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }));
    });
  }, []);

  // ✅ Start camera to capture image
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  // 📸 Capture image and display preview
  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (canvas && video) {
      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL("image/jpeg");
      setCapturedImage(imageData);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (studentData.name && studentData.rollno && studentData.studentid && capturedImage) {
      const formData = new FormData();
      const yamlData = yaml.dump(studentData);
  
      formData.append("data", yamlData);
      formData.append("user_id", studentData.studentid);
  
      // Convert captured image to blob and append
      const blob = await fetch(capturedImage).then((res) => res.blob());
      formData.append("file", blob, `${studentData.studentid}.jpg`); // ✅ Corrected
  
      // ✅ Fixed URL with template string
      fetch(`http://localhost:5000/student-data/${urls[2]}/${urls[3]}`, {
        method: "POST",
        body: formData,
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to submit data");
          }
          return res.json();
        })
        .then((result) => {
          console.log("Submission result:", result);
          setSubmitStatus(true);
  
          setTimeout(() => {
            setSubmitStatus(false);
          }, 1500);
        })
        .catch((err) => {
          console.error("Error:", err);
        });
    } else {
      setFormError(true);
  
      setTimeout(() => {
        setFormError(false);
      }, 1500);
    }
  };
  

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="border-4 border-gray-700 rounded-2xl py-10 px-6 w-11/12 lg:w-2/6"
        encType="multipart/form-data"
      >
        {/* Name */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="name">
            Name:
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="name"
            type="text"
            value={studentData.name}
            onChange={(e) => setData({ ...studentData, name: e.target.value })}
            placeholder="Enter your name"
          />
        </div>

        {/* Roll No */}
        <div className="mb-4">
          <label
            className="block text-gray-700 font-bold mb-2"
            htmlFor="rollno"
          >
            Roll no:
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline "
            id="rollno"
            type="number"
            value={studentData.rollno > 0 ? studentData.rollno : ""}
            onChange={(e) =>
              setData({ ...studentData, rollno: e.target.value })
            }
            placeholder="Enter Roll no"
            inputMode="numeric"
          />
        </div>

        {/* Student ID */}
        <div className="mb-4">
          <label
            className="block text-gray-700 font-bold mb-2"
            htmlFor="studentid"
          >
            Student ID:
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="studentid"
            type="text"
            value={studentData.studentid}
            onChange={(e) =>
              setData({ ...studentData, studentid: e.target.value })
            }
            placeholder="Enter Student ID"
          />
        </div>

        {/* 📸 Capture and Preview Section */}
        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-2">
            Capture Face:
          </label>
          <div className="flex flex-col items-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-auto mb-2 border rounded-lg"
            />
            <canvas ref={canvasRef} width="640" height="480" hidden />
            {capturedImage && (
              <img
                src={capturedImage}
                alt="Captured"
                className="w-48 h-auto border-2 border-green-500 rounded-lg mb-2"
              />
            )}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={startCamera}
                className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
              >
                Start Camera
              </button>
              <button
                type="button"
                onClick={captureImage}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Capture Image
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-center">
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Submit
          </button>
        </div>

        {formError && (
          <div className="fixed rounded-t-xl bottom-0 left-0 right-0 bg-red-500 text-white p-4 text-center text-lg font-semibold animate-slide-up">
            Kindly fill up all the details and capture your face.
          </div>
        )}

        {submitStatus && (
          <div className="fixed rounded-t-xl bottom-0 left-0 right-0 bg-green-500 text-white p-4 text-center text-lg font-semibold animate-slide-up">
            Your details are submitted successfully!
          </div>
        )}
      </form>
    </>
  );
}

export default Form2;
