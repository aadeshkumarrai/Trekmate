import { Link } from "react-router-dom";
import trekmateLogo from "../assets/trekmate-logo.png";

function BrandLogo({ showText = true, className = "" }) {
  return (
    <Link className={`public-brand ${className}`} to="/login">
      <img
        src={trekmateLogo}
        alt="TrekMate Logo"
        className="brand-logo-img"
      />

      {showText && (
        <span className="public-brand-text">
          <strong>TREKMATE</strong>
        </span>
      )}
    </Link>
  );
}

export default BrandLogo;