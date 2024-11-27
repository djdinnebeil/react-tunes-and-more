import { NavLink } from "react-router-dom";
import "./Navigation.css";
import {useSelector} from "react-redux";
import { thunkLogout } from "../../redux/session";
import { useDispatch } from "react-redux";


function Navigation() {
  const user = useSelector((store) => store.session.user);
  const dispatch = useDispatch();

  const logout = (e) => {
    e.preventDefault();
    dispatch(thunkLogout());
  };

  return (
    <header>
      <nav>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/upload">Upload Song</NavLink>
        <NavLink to="/songs">Music Player</NavLink>
        <NavLink to="/history">Listening History</NavLink>
        {!user &&
          <div>
            <NavLink to="/login">Login</NavLink>
            <span style={{ margin: '0 0.5rem', color: 'white'}}> / </span>
            <NavLink to="/signup">Sign Up</NavLink>
          </div>
        }
        {user && <NavLink to="/logout" onClick={logout}>Logout</NavLink>
        }
      </nav>
    </header>
  );
}

export default Navigation;
