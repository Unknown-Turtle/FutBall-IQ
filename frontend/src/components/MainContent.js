import React from 'react';
import './MainContent.css';

function MainContent() {
  return (
    <main className="main-content">
      <section className="welcome">
        <h2>Welcome</h2>
        <p>placeholder</p>
        <img src="path/to/image" alt="Severance" />
      </section>
      <hr className="divider"/>
      <section className="featured-articles">
        <h2>placeholder</h2>
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