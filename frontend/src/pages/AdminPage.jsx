import { useState } from "react";
import { registerUser, getUserById } from "../services/api";

export default function AdminPage() {
  // ─── Register User ───────────────────────────
  const [regForm, setRegForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    year: new Date().getFullYear(),
  });
  const [regResult, setRegResult] = useState(null);
  const [regError, setRegError] = useState(null);

  const handleRegChange = (e) =>
    setRegForm({ ...regForm, [e.target.name]: e.target.value });

  const handleRegister = (e) => {
    e.preventDefault();
    setRegError(null);
    setRegResult(null);
    registerUser({ ...regForm, year: parseInt(regForm.year, 10) })
      .then((res) => setRegResult(res.data))
      .catch((err) => setRegError(err.response?.data?.message || err.message));
  };

  // ─── Lookup User ─────────────────────────────
  const [lookupId, setLookupId] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupError, setLookupError] = useState(null);

  const handleLookup = (e) => {
    e.preventDefault();
    setLookupError(null);
    setLookupResult(null);
    getUserById(lookupId)
      .then((res) => setLookupResult(res.data))
      .catch((err) => setLookupError(err.response?.data?.message || err.message));
  };

  return (
    <div>
      <h2>Admin Panel</h2>

      {/* Register User */}
      <h3>Register a New User</h3>
      {regError && <p style={{ color: "red" }}>{regError}</p>}
      {regResult && (
        <p style={{ color: "green" }}>
          User created: {regResult.firstname} {regResult.lastname} (ID: {regResult.id})
        </p>
      )}
      <form onSubmit={handleRegister}>
        <div>
          <label>First Name: </label>
          <input name="firstname" value={regForm.firstname} onChange={handleRegChange} required />
        </div>
        <div>
          <label>Last Name: </label>
          <input name="lastname" value={regForm.lastname} onChange={handleRegChange} required />
        </div>
        <div>
          <label>Email: </label>
          <input name="email" type="email" value={regForm.email} onChange={handleRegChange} required />
        </div>
        <div>
          <label>Password: </label>
          <input name="password" type="password" value={regForm.password} onChange={handleRegChange} required />
        </div>
        <div>
          <label>Year: </label>
          <input name="year" type="number" value={regForm.year} onChange={handleRegChange} required />
        </div>
        <button type="submit">Register User</button>
      </form>

      <hr />

      {/* Lookup User */}
      <h3>Lookup User by ID</h3>
      {lookupError && <p style={{ color: "red" }}>{lookupError}</p>}
      <form onSubmit={handleLookup}>
        <div>
          <label>User ID: </label>
          <input value={lookupId} onChange={(e) => setLookupId(e.target.value)} required />
        </div>
        <button type="submit">Lookup</button>
      </form>
      {lookupResult && (
        <table border="1" cellPadding="8" style={{ marginTop: 10 }}>
          <tbody>
            <tr><td><strong>ID</strong></td><td>{lookupResult.id}</td></tr>
            <tr><td><strong>First Name</strong></td><td>{lookupResult.firstname}</td></tr>
            <tr><td><strong>Last Name</strong></td><td>{lookupResult.lastname}</td></tr>
            <tr><td><strong>Email</strong></td><td>{lookupResult.email}</td></tr>
            <tr><td><strong>Role</strong></td><td>{lookupResult.role}</td></tr>
            <tr><td><strong>Keycloak ID</strong></td><td>{lookupResult.keyCloakId}</td></tr>
            <tr><td><strong>Created</strong></td><td>{lookupResult.createdDate}</td></tr>
          </tbody>
        </table>
      )}
    </div>
  );
}

