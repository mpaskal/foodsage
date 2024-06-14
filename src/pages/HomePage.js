import React from "react";
import Layout from "../components/Layout/Layout";

const HomePage = () => {
  return (
    <Layout>
      <div className="home-page">
        <section className="hero">
          <h1>Set waste management and budget goals</h1>
        </section>
        <section className="content">
          <p>
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry...
          </p>
          <div className="statistics">
            <h2>Yearly average global food loss and waste</h2>
            <div className="stats">
              <p>1/3 of the world’s food</p>
              <p>1.3 billion tons</p>
              <p>1 trillion US dollars</p>
              <ul>
                <li>45% of all fruit and vegetables</li>
                <li>35% of all fish and seafood</li>
                <li>30% of all cereals</li>
                <li>20% of all dairy products</li>
                <li>20% of all meat and poultry</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default HomePage;
