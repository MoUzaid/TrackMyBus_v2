import React, { useContext, useState, useEffect } from "react";
import { GlobalState } from "../../GlobalState";
import { useParams } from "react-router-dom";
import axios from "axios";

const Students = () => {
  const state = useContext(GlobalState);
  const [userToken] = state.userToken;
  const [newStudents, setNewStudents] = useState([]);
  const params = useParams();
  const busId = params.id;

  useEffect(() => {
    const getAllUsers = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/user/all_users`, {
          headers: { Authorization: userToken },
        });
        console.log("All users:", res.data);

        const students = res.data;
        const filteredStudents = students.filter(
          (student) => String(student.busId) === String(busId)
        );

        console.log("Filtered:", filteredStudents);
        setNewStudents(filteredStudents);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    if (userToken && busId) getAllUsers();
  }, [busId, userToken]);

  return (
    <div>
      <h3>Students for Bus ID: {busId}</h3>
      {newStudents.length > 0 ? (
        <ul>
          {newStudents.map((s, index) => (
            <li key={index}>
              {s.name} - {s.enroll}
            </li>
          ))}
        </ul>
      ) : (
        <p>No students found.</p>
      )}
    </div>
  );
};

export default Students;
