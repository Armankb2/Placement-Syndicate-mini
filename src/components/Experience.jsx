import React, { useEffect, useState } from "react";
// ...existing code...

const Experience = () => {
  const [experiences, setExperiences] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/experiences") // Replace with your actual API endpoint
      .then((res) => res.json())
      .then((data) => setExperiences(data))
      .catch((err) => console.error("Error fetching experiences:", err));
  }, []);

  return (
    <div className="border-b border-neutral-900 pb-4">
      <h2 className="my-20 text-center text-4xl">Experience</h2>
      <div>
        {experiences.map((experience, index) => (
          <div key={index} className="mb-8 flex flex-wrap lg:justify-center">
            {/* ...existing code to render year, role, company, etc. using 'experience' object... */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Experience;

