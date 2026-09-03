function Login(){
    return(
        <div>
            <form className="auth-form">
            <div className="input-group">
              <label>Username or Email:</label>
              <input type="text" placeholder="Username" required />
            </div>
            <div className="input-group">
              <label>Password:</label>
              <input type="password" placeholder="Password" required />
            </div>
            <button type="submit" className="submit-button main-action">
              Login
            </button>
          </form>
        </div>
    );
}

export default Login;