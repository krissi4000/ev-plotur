export function LoginPage() {
  return (
    <html>
      <body>
        <h1>Login</h1>
        <form method="post" action="/auth/login">
          <input name="username" placeholder="Username" required />
          <input name="password" type="password" placeholder="Password" required />
          <button type="submit">Login</button>
        </form>
        <a href="/auth/github">Login with GitHub</a>
        <br />
        <a href="/auth/google">Login with Google</a>
        <br />
        <a href="/auth/register">Create an account</a>
      </body>
    </html>
  );
}

export function RegisterPage() {
  return (
    <html>
      <body>
        <h1>Register</h1>
        <form method="post" action="/auth/register">
          <input name="username" placeholder="Username" required />
          <input name="email" type="email" placeholder="Email (optional)" />
          <input name="password" type="password" placeholder="Password" required />
          <button type="submit">Register</button>
        </form>
        <a href="/auth/login">Already have an account?</a>
      </body>
    </html>
  );
}

export function ErrorMessage({ message }: { message: string }) {
  return <p>{message}</p>;
}
