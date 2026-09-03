import { useState } from "react";

function SignUp() {
  const [form, setForm] = useState({
    name: "", username: "", email: "", password: "", confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  return (
    <div>
      <form className="auth-form">
        <div className="input-group">
          <label>Name:</label>
          <input type="text" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} required />
        </div>

        <div className="input-group">
          <label>Username:</label>
          <input type="text" name="username" placeholder="jdoe123" value={form.username} onChange={handleChange} required />
        </div>

        <div className="input-group">
          <label>Email:</label>
          <input type="email" name="email" placeholder="john.doe@example.com" value={form.email} onChange={handleChange} required />
        </div>

        <div className="input-group">
          <label>Password:</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={8} />
        </div>

        <div className="input-group">
          <label>Confirm Password:</label>
          <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required />
        </div>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="submit-button main-action">
          Create Account
        </button>
      </form>
    </div>
  );
}

export default SignUp;