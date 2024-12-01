import {useSelector} from "react-redux";
import {NavLink} from "react-router-dom";


function HomePage() {
    const sessionUser = useSelector((store) => store.session.user);

    return (
      <>
        <h1>Welcome to Tunes and More</h1>
          {!sessionUser &&<p><NavLink to="/signup">Sign up</NavLink> or  <NavLink to="/login"> login </NavLink> to get started!</p>}
      {sessionUser && <p>You are logged in as {sessionUser.username}.</p>}
    </>
    )
}

export default HomePage;