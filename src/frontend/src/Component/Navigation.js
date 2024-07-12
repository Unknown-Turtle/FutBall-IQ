import React from "react";
import {NavLink} from "react-router-dom";
import SearchIcon from '@mui/icons-material/Search';
import '../css/NavigationStyle.css';
//import logo from '../Images/logo.png'

const Navigation = function() {
    return(
      <header>
        <div className="container container-flex">
          <div className="logocontainer"> 
            <img src="../Images/logo.png" alt="Logo" className="logo"/> 
            <>logo</>
          </div>
          <nav>
            <div className="list">
            <NavLink exact to='/' className="listItem" activeClassName="active">Home</NavLink>
            <NavLink exact to='/data' className="listItem" activeClassName="active">Data</NavLink>
            <NavLink exact to='/info' className="listItem" activeClassName="active">Info</NavLink>
            </div>
          </nav>
          <div className="icons">
            <SearchIcon className="icon"/>
          </div>
        </div>
      </header>
    )
  }
export default Navigation;