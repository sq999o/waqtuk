import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, homeForRole } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Alert, Button, Card, Input, Radio } from '../../components/ui';
import { messages as MESSAGES } from '../../utils/validators/account';
import './LoginPage.css';

export default function LoginPage() {
  const { login, register, getUser } = useData();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [account, setAccount] = useState({ role: 'student', name: '', email: '', password: '', confirmPassword: '' });
  const [loginError, setLoginError] = useState(null);
  const [registerError, setRegisterError] = useState(null);
  const loginErrorRef = useRef(null);
  const registerErrorRef = useRef(null);

  useEffect(() => { if (loginError) loginErrorRef.current?.focus(); }, [loginError]);
  useEffect(() => { if (registerError) registerErrorRef.current?.focus(); }, [registerError]);

  function enter(user) {
    signIn(user.id);
    navigate(homeForRole(user.role), { replace: true });
  }
  function submitLogin(event) {
    event.preventDefault();
    const result = login(credentials.email, credentials.password);
    if (!result.ok) { setLoginError({ message: result.error }); return; }
    enter(result.user);
  }
  function submitRegistration(event) {
    event.preventDefault();
    const result = register(account);
    if (!result.ok) { setRegisterError({ message: result.error }); return; }
    enter(result.user);
  }
  function preview(id, role) {
    const user = getUser(id);
    if (!user || user.role !== role) { setLoginError({ message: MESSAGES.accountUnavailable }); return; }
    if (user.status !== 'active') { setLoginError({ message: MESSAGES.accountSuspended }); return; }
    enter(user);
  }
  const changeLogin = field => event => {
    setCredentials(current => ({ ...current, [field]: event.target.value }));
    setLoginError(null);
  };
  const changeAccount = field => event => {
    setAccount(current => ({ ...current, [field]: event.target.value }));
    setRegisterError(null);
  };

  return <main className="wq-login-page wq-main-pad">
    <div className="wq-login-content">
      <header className="wq-login-intro">
        <h1>See where your day goes</h1>
        <p>Log your activities, set weekly goals and share progress with a mentor when you choose to.</p>
      </header>
      <div className="wq-login-cards wq-g">
        <Card title="Log in" className="wq-login-card">
          <form className="wq-login-form" aria-label="Log in" onSubmit={submitLogin} noValidate>
            {loginError && <div ref={loginErrorRef} tabIndex={-1} className="wq-login-error">
              <Alert tone="danger">{loginError.message}</Alert>
            </div>}
            <Input id="login-email" label="Email *" name="email" type="email" required
              value={credentials.email} onChange={changeLogin('email')} placeholder="name@example.com" />
            <Input id="login-password" label="Password *" name="password" type="password" required
              value={credentials.password} onChange={changeLogin('password')} placeholder="Enter your password" />
            <Button type="submit" fullWidth>Log In</Button>
          </form>
          <section className="wq-login-preview" aria-labelledby="login-preview-title">
            <h3 id="login-preview-title">Preview the other roles</h3>
            <div className="wq-login-preview-buttons">
              <Button variant="secondary" onClick={() => preview('m1', 'mentor')}>Mentor view</Button>
              <Button variant="secondary" onClick={() => preview('a1', 'admin')}>Administrator view</Button>
            </div>
          </section>
        </Card>
        <Card title="Create an account" className="wq-login-card">
          <form className="wq-login-form" aria-label="Create an account" onSubmit={submitRegistration} noValidate>
            {registerError && <div ref={registerErrorRef} tabIndex={-1} className="wq-login-error">
              <Alert tone="danger">{registerError.message}</Alert>
            </div>}
            <fieldset className="wq-login-roles">
              <legend>Register as *</legend>
              <div className="wq-login-role-options">
                <Radio label="Student" name="register-role" value="student" checked={account.role === 'student'} onChange={changeAccount('role')} />
                <Radio label="Academic Mentor" name="register-role" value="mentor" checked={account.role === 'mentor'} onChange={changeAccount('role')} />
              </div>
            </fieldset>
            <Input id="register-name" label="Full name *" name="name" required
              value={account.name} onChange={changeAccount('name')} placeholder="Your full name" />
            <Input id="register-email" label="Email *" name="email" type="email" required
              value={account.email} onChange={changeAccount('email')} placeholder="name@example.com" />
            <div className="wq-login-passwords wq-g">
              <Input id="register-password" label="Password *" name="password" type="password" required
                value={account.password} onChange={changeAccount('password')} placeholder="At least 8 characters" />
              <Input id="register-confirm" label="Confirm password *" name="confirmPassword" type="password" required
                value={account.confirmPassword} onChange={changeAccount('confirmPassword')} placeholder="Repeat password" />
            </div>
            <Button type="submit" fullWidth>Create Account</Button>
            <p className="wq-login-note">Administrator accounts are created by platform staff and cannot be registered here.</p>
          </form>
        </Card>
      </div>
    </div>
  </main>;
}
