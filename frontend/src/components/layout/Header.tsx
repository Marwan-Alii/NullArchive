import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/explore", label: "Explore" },
  { to: "/submit", label: "Submit Research" },
  { to: "/about", label: "About" },
];

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur border-b border-line">
      <div className="container-page flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="w-7 h-7 rounded-sm bg-navy text-white flex items-center justify-center font-mono text-xs font-medium">
            N∅
          </span>
          <span className="font-serif text-lg font-semibold tracking-tight text-ink">
            NullArchive
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? "text-navy" : "text-inkmute hover:text-ink"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to={`/profile/${user.id}`}
                className="hidden sm:inline text-sm font-medium text-inkmute hover:text-ink"
              >
                {user.name.split(" ")[0]}
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="text-sm font-medium border border-line px-4 py-2 rounded-sm hover:border-navy hover:text-navy transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden sm:inline text-sm font-medium text-inkmute hover:text-ink"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium bg-navy text-white px-4 py-2 rounded-sm hover:bg-navy-dark transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
