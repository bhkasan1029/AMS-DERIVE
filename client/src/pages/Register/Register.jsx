import './Register.css';

function Register() {
  return (
    <div className="register">
      <div className="register__container">
        <h1 className="register__title">Create Account</h1>
        <form className="register__form">
          <div className="register__field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="you@example.com" />
          </div>
          <div className="register__field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" placeholder="Your password" />
          </div>
          <button type="submit" className="register__submit">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
