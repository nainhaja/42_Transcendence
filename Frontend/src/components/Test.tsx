import axios from 'axios';
import React from 'react';



class Test extends React.Component {
  componentDidMount() {
    axios.get('localhost:5000/test')
      .then(response => {
        // handle success
        console.log(response.data);
      })
      .catch(error => {
        // handle error
        console.log(error);
      })
  }

  render() {
    return (
    <h1>hello</h1>
    );
  }
}

export default Test;