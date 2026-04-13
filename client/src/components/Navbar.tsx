import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav>
      <Link to="/">Home</Link>
      {" | "}
      <Link to="/search">Search</Link>
      {" | "}
      <Link to="/library">Library</Link>
    </nav>
  );
}
