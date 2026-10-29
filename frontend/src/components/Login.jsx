import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";



function Login(){
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const userData = {
    email,
    password
  };
  const navigate = useNavigate();
  const { refreshUser } = useAuth();



  function handleSubmit(e){
    e.preventDefault();

    if(!email || !password){
      setError("Both fields are required");
      return;
    }

    fetch("http://localhost:3000/api/users/login", {
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
                  setError("Login succeeded, but the session could not be verified.");
              }
          })
          .catch((error) => {
              console.error(error);
              setError("Invalid email or password");
          });

  }


    return(
        <div>
            <form className="flex flex-col gap-4 text-left" onSubmit={handleSubmit}>
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

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button type="submit" className="mt-2 w-full">
              Login
            </button>
          </form>
        </div>
    );
}

export default Login;