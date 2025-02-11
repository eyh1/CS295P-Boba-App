import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import petr from './assets/petr.jpg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [restaurants, setRestaurants] = useState([]);

  // useEffect(() => {
  //   getRestaurants()
  // }, []);

  // const getRestaurants = async () => {
  //   const response = await fetch("http://127.0.0.1:5000//api/restaurants");
  //   const data = await response.json();
  //   setRestaurants(data.restaurants);
  // };

  return (
    <>
    <div className = "background">

      <div>
        <a target="_blank">
          <img src={petr} className="Petr logo" />
        </a>
      </div>
      <h1 className = "textZoba">Zoba</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </div>
    </>
  )
}

export default App
