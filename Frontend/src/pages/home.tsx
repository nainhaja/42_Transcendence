import React from "react";
import { Link } from 'react-router-dom';

const Home = () => {

    return(
        <>
            <Link to="/game">
                game
            </Link>
            <Link to="/watch">
                watch
            </Link>
        </>
    )
}

export default Home