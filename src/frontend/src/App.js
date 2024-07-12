
import React from "react";
import {Routes ,Route} from 'react-router-dom';
import Home from'./Component/Home';
import Data from'./Component/Data';
import Info from'./Component/Info';
import Error from'./Component/Error';
import Navigation from './Component/Navigation';
import Line from './Component/Line';
import Footer from './Component/Footer';


const App = function() {
  return(
    <>
    <Line/>
    <Navigation/>
      <Routes>
        <Route exact path='/' element={<Home/>}/>
        <Route path='/data' element={<Data/>}/>
        <Route path='/info' element={<Info/>}/>
        <Route path='*' element={<Error/>}/>
      </Routes>
      <Footer/>
    </>
  )
}
export default App;

/*import './App.css';

function App() {
  return (
  );
}

export default App;*/
