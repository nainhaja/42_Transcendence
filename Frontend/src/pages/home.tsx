import React from "react";
import { Link } from 'react-router-dom';

const Homee = () => {

    return(
        <>
            <Link to="/game/1">
                game
            </Link>
            <Link to="/game/2">
                game2
            </Link>
            <Link to="/game/3">
                game3
            </Link>
            <Link to="/watch">
                watch
            </Link>
        </>
    )
}

export default Homee