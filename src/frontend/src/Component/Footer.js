import React from "react";
import "../css/FooterStyle.css"
import idea from '../Images/idea.png'

const Footer = function() {
    return(
      <footer>
        <div className="container container-flex">
            <div className="imageContainer">
                <img src={idea} alt="..." className="image"/> 
            </div>
        <div className="footerText">
            ALL RIGHTS RESERVED
        </div>
        </div>
      </footer>
    )
  }
export default Footer;