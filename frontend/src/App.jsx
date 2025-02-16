import { useState, useEffect } from 'react'
import petr from './assets/petrdrink.png'
import boba from './assets/chafortea.png'
import './App.css'
import TextField from "@mui/material/TextField";
import RestaurantList from './RestaurantList'

function App() {
  const [count, setCount] = useState(0)
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    getRestaurants()
  }, []);

  
  
    
  function TopBar() {
  return (
    <div style={{ 
      backgroundColor: '#529176', 
      display: 'flex',
      alignItems: 'center', // Aligns items vertically
      justifyContent: 'center', // Centers content horizontally
      height: 70,
    }}>
    
        <img src={petr} className="Petr logo" />
        <h1 className = "textZoba">Zoba</h1>
        
      
    </div>
  );
}
  function CardGrid() {
  return (
      <div className="grid-container">
      <div className="entry-card" >
          <div className="card-grid-container"><img src={boba} className="drink-cha" /> 
          <h1 className = "titleCha">Cha For Tea </h1> </div>
          
        </div>
      <div className="entry-card">Card 2</div>
      <div className="entry-card">Card 3</div>
      <div className="entry-card">Card 4</div>
    </div>
  );
}
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

      
      <TopBar></TopBar>
      
      <div className="card">
        
        <div className="search">
        <TextField
          style={{ width: 500 }}
          id="outlined-basic"
          variant="outlined"
          label="Search for a drink"
        />
        <CardGrid></CardGrid>
        <RestaurantList restaurants ={restaurants} />
      </div>
      </div>
    </div>
    </>
  )
}

export default App
