import { Subject } from "@mui/icons-material";
import React, { useState, useEffect } from "react";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import { useNavigate } from "react-router";
import yaml from "js-yaml";
import { toast } from "react-toastify";
import "../index.css";

function Form1() {
  const navigate = useNavigate();

  const [classData, setData] = useState({
    name: "",
    email: "",
    admin_id: "",
    course: "",
    section: "",
    subject: "",
    subjectCode: "",
    radius: 0.0,
    latitude: 0.0,
    longitude: 0.0,
  });

  const [submitStatus, setsubmitStatus] = useState(false);
  const [formError, setformError] = useState(false);

  // Get user’s current location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setData((prevData) => ({
        ...prevData,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }));
    });
  }, []);

  // Generate class link
  function toStudentForm(e) {
    e.preventDefault();

    fetch(`http://127.0.0.1:5000/generate-link/${classData.admin_id}`)
      .then((response) => response.json())
      .then((data) => {
        navigator.clipboard
          .writeText(data.link)
          .then(() => {
            toast.success("Class link has been copied!");
          })
          .catch((err) => {
            toast.error("Could not copy unique link to clipboard: ", err);
          });
      })
      .catch((err) => {
        console.error("Could not generate unique link: ", err);
      });
  }

  // Handle form submission
  function handleSubmit(e) {
    e.preventDefault();
  
    if (
      classData.name &&
      classData.email &&
      classData.admin_id &&
      classData.course &&
      classData.section &&
      classData.subject &&
      classData.subjectCode &&
      classData.radius > 0
    ) {
      const yamlData = yaml.dump(classData);
      
      fetch("http://127.0.0.1:5000/class-data", {
        method: "POST",
        headers: {
          "Content-type": "application/x-yaml",
        },
        body: yamlData,
      })
        .then((res) => res.json())
        .then((result) => {
          console.log(result);
          if (result.Output) {
            setsubmitStatus(true);
            toast.success("Admin details stored successfully!");
            
            setTimeout(() => {
              setsubmitStatus(false);
              navigate("/class-room");
            }, 2000);
          } else {
            toast.error("Failed to store admin details!");
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error("Error submitting data!");
        });
    } else {
      setformError(true);
      setTimeout(() => {
        setformError(false);
      }, 1000);
    }
  }  

  return (
    <>
      <form onSubmit={handleSubmit} className="my-8 max-w-md mx-auto md:px-6">
        {/* Name */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="name">
            Name:
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="name"
            type="text"
            value={classData.name}
            onChange={(e) => setData({ ...classData, name: e.target.value })}
            placeholder="Enter your name"
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="email">
            Email:
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            type="email"
            value={classData.email}
            onChange={(e) => setData({ ...classData, email: e.target.value })}
            placeholder="Enter your email"
          />
        </div>

        {/* Admin ID */}
        <div className="mb-4">
          <label
            className="block text-gray-700 font-bold mb-2"
            htmlFor="admin_id"
          >
            Admin-ID:
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="admin_id"
            type="text"
            value={classData.admin_id}
            onChange={(e) =>
              setData({ ...classData, admin_id: e.target.value })
            }
            placeholder="Enter Admin ID"
          />
        </div>

        {/* Course */}
        <div className="mb-4">
          <label
            className="block text-gray-700 font-bold mb-2"
            htmlFor="course"
          >
            Course:
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="course"
            type="text"
            value={classData.course}
            onChange={(e) => setData({ ...classData, course: e.target.value })}
            placeholder="Enter Course"
          />
        </div>

        {/* Section */}
        <div className="mb-4">
          <label
            className="block text-gray-700 font-bold mb-2"
            htmlFor="section"
          >
            Section:
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="section"
            type="text"
            value={classData.section}
            onChange={(e) =>
              setData({ ...classData, section: e.target.value })
            }
            placeholder="Enter Section"
          />
        </div>

        {/* Subject */}
        <div className="mb-4">
          <label
            className="block text-gray-700 font-bold mb-2"
            htmlFor="subject"
          >
            Subject:
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="subject"
            type="text"
            value={classData.subject}
            onChange={(e) =>
              setData({ ...classData, subject: e.target.value })
            }
            placeholder="Enter Subject"
          />
        </div>

        {/* Subject Code */}
        <div className="mb-4">
          <label
            className="block text-gray-700 font-bold mb-2"
            htmlFor="subjectCode"
          >
            Subject Code:
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="subjectCode"
            type="text"
            value={classData.subjectCode}
            onChange={(e) =>
              setData({ ...classData, subjectCode: e.target.value })
            }
            placeholder="Enter Subject Code"
          />
        </div>

        {/* Max Radius */}
        <div className="mb-8">
          <label
            className="block text-gray-700 font-bold mb-2"
            htmlFor="radius"
          >
            Max Radius (in meters):
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline custom-input"
            id="radius"
            type="number"
            value={classData.radius > 0 ? classData.radius : ""}
            onChange={(e) =>
              setData({ ...classData, radius: parseFloat(e.target.value) })
            }
            placeholder="Enter Max Radius"
          />
        </div>

        {/* Button Section */}
        <div className="flex items-center justify-center gap-8 mx-auto">
          {/* Generate Class Link */}
          <div className="mt-6 flex items-center justify-center">
            <button
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={toStudentForm}
            >
              <ContentPasteIcon className="mt-3/5 h-5 w-5 fill-white" />
              Generate Class Link
            </button>
          </div>

          {/* Submit */}
          <div className="mt-6 flex items-center justify-center">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Submit
            </button>
          </div>
        </div>

        {/* Error Message */}
        {formError && (
          <div
            className={`fixed rounded-t-xl bottom-0 left-0 right-0 bg-red-500 text-white p-4 text-center text-lg font-semibold ${
              formError ? "animate-slide-up" : "animate-slide-down"
            }`}
          >
            Fill up all the details.
          </div>
        )}

        {/* Success Message */}
        {submitStatus && (
          <div
            className={`fixed rounded-t-xl bottom-0 left-0 right-0 bg-green-500 text-white p-4 text-center text-lg font-semibold ${
              submitStatus ? "animate-slide-up" : "animate-slide-down"
            }`}
          >
            Form Submitted Successfully!
          </div>
        )}
      </form>
    </>
  );
}

export default Form1;
