import { Link } from "react-router-dom";

function BrandLogo() {
  return (
    <Link className="public-brand" to="/login">
      <span className="public-brand-mark">TM</span>

      <span className="public-brand-text">
        <strong>TREKMATE</strong>
      </span>
    </Link>
  );
}

export default BrandLogo;