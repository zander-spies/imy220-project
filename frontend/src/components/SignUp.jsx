import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function SignUp() {

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const userData = {
    name,
    username,
    email,
    password
  };
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(e){
    e.preventDefault();

    if(password !== confirmPassword){
      setError("Passwords doesn't match")
      return;
    }

    fetch("http://localhost:3000/api/users/register", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        })
            .then((res) => {
                if (!res.ok) throw new Error();
                return res.json();
            })
            .then(async () => {
                const authenticated = await refreshUser();

                if (authenticated) {
                    navigate("/home", { replace: true });
                } else {
                    setError("Account created, but automatic login failed. Please sign in.");
                }
            })
            .catch(() => setError("Failed to add user."));
  }


  return (
    <div>
      <form className="flex flex-col gap-4 text-left" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1">
          <label>Name:</label>
          <input 
          type="text" 
          name="name" 
          placeholder="John Doe" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          required />
        </div>

        <div className="flex flex-col gap-1">
          <label>Username:</label>
          <input type="text" 
          name="username" 
          placeholder="jdoe123" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          required />
        </div>

        <div className="flex flex-col gap-1">
          <label>Email:</label>
          <input 
          type="email"
          name="email" 
          placeholder="john.doe@example.com" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          required />
        </div>

        <div className="flex flex-col gap-1">
          <label>Password:</label>
          <input 
          type="password" 
          name="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          required 
          minLength={8} />
        </div>

        <div className="flex flex-col gap-1">
          <label>Confirm Password:</label>
          <input 
          type="password" 
          name="confirmPassword" 
          value={confirmPassword} 
          onChange={(e) => setConfirmPassword(e.target.value)}
          required />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" className="mt-2 w-full">
          Create Account
        </button>
      </form>
    </div>
  );
}

export default SignUp;