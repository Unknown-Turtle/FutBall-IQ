import React, { useState, useEffect } from 'react';
import './MainContent.css';
import axios from 'axios';

function MainContent() {

  return (
    <main className="main-content">
      <hr className="divider"/>
      <section className="placeholder">
        <h2>Placeholder</h2>
        <div className="articles">
          <article>
            <h3>INFO</h3>
          </article>
          <article>
            <h3>EXTRA INFO</h3>
          </article>
        </div>
      </section>
      <hr className="divider"/>
    </main>
  );
}

export default MainContent;
