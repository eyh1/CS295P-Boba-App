import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import petr from './assets/petr.jpg'
import './App.css'
import RestaurantList from './RestaurantList'

function App() {
  const [count, setCount] = useState(0)
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    getRestaurants()
  }, []);

  const getRestaurants = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000//api/restaurants");
      const data = await response.json();
      setRestaurants(data.restaurants);

    } catch (error){
      console.log(error)
      alert(error)
    }
    
  };

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
        <RestaurantList restaurants ={restaurants} />
      </div>
    </div>
    </>
  )
}

export default App
