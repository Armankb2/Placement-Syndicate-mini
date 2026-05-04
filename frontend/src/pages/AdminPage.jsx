import { useState } from "react";
import { registerUser, getUserById } from "../services/api";
import "./AdminPage.css";

export default function AdminPage() {
  const [regForm, setRegForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    year: new Date().getFullYear(),
  });
  const [regResult, setRegResult] = useState(null);
  const [regError, setRegError] = useState(null);

  const [lookupId, setLookupId] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupError, setLookupError] = useState(null);

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

  const handleLookup = (e) => {
    e.preventDefault();
    setLookupError(null);
    setLookupResult(null);
    getUserById(lookupId)
      .then((res) => setLookupResult(res.data))
      .catch((err) => setLookupError(err.response?.data?.message || err.message));
  };

  return (
    <div className="container animate-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin <span>Panel</span></h1>
          <p className="page-subtitle">Register users and inspect profile records.</p>
        </div>
      </div>

      <div className="admin-grid">
        <section className="admin-card glass">
          <h2>Register user</h2>
          {regError && <p className="admin-alert error">{regError}</p>}
          {regResult && (
            <p className="admin-alert success">
              User created: {regResult.firstname} {regResult.lastname} / ID {regResult.id}
            </p>
          )}
          <form onSubmit={handleRegister}>
            <div className="form-grid">
              <div>
                <label>First Name</label>
                <input name="firstname" value={regForm.firstname} onChange={handleRegChange} required />
              </div>
              <div>
                <label>Last Name</label>
                <input name="lastname" value={regForm.lastname} onChange={handleRegChange} required />
              </div>
              <div>
                <label>Email</label>
                <input name="email" type="email" value={regForm.email} onChange={handleRegChange} required />
              </div>
              <div>
                <label>Password</label>
                <input name="password" type="password" value={regForm.password} onChange={handleRegChange} required />
              </div>
              <div>
                <label>Year</label>
                <input name="year" type="number" value={regForm.year} onChange={handleRegChange} required />
              </div>
            </div>
            <button type="submit" className="btn-primary">Register user</button>
          </form>
        </section>

        <section className="admin-card glass">
          <h2>Lookup user</h2>
          {lookupError && <p className="admin-alert error">{lookupError}</p>}
          <form onSubmit={handleLookup} className="lookup-form">
            <label>User ID</label>
            <input value={lookupId} onChange={(e) => setLookupId(e.target.value)} required />
            <button type="submit" className="btn-primary">Lookup</button>
          </form>

          {lookupResult && (
            <div className="lookup-table">
              <div><strong>ID</strong><span>{lookupResult.id}</span></div>
              <div><strong>First Name</strong><span>{lookupResult.firstname}</span></div>
              <div><strong>Last Name</strong><span>{lookupResult.lastname}</span></div>
              <div><strong>Email</strong><span>{lookupResult.email}</span></div>
              <div><strong>Role</strong><span>{lookupResult.role}</span></div>
              <div><strong>Keycloak ID</strong><span>{lookupResult.keyCloakId}</span></div>
              <div><strong>Created</strong><span>{lookupResult.createdDate}</span></div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
