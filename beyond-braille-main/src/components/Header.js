import logo from "../assets/logo.png";

import { Link } from "react-router-dom";
import "./Header.scss";

const Header = () => {
  return (
    <header>
      <Link to="/">
        <img src={logo} alt="logo" />
      </Link>

      <nav>
        <Link to="/">Home</Link>
        <Link to="/assessment">Assessment</Link>
      </nav>
    </header>
  );
};

export default Header;
