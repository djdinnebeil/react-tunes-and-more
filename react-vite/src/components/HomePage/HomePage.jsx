import {useSelector} from "react-redux";


function HomePage() {
    const sessionUser = useSelector((store) => store.session.user);

    return (
      <>
        <h1>Welcome to Tunes and More</h1>
      {sessionUser && <p>You are logged in as {sessionUser.username}</p>}
    </>
    )
}

export default HomePage;