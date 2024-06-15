import React from "react";
import Layout from "../components/Layout/LayoutSite";
import HeroImg from "../assets/images/home_page_main_image.jpg";

const HomePage = () => {
  return (
    <Layout>
      <div className="home">
        <header className="home-header">
          <img src={HeroImg} alt="Hero" className="hero-image" />
          <h1 className="header-text">Set waste management and budget goals</h1>
        </header>
        <div className="home-content">
          <section>
            <h2>Food Waste</h2>
            <p>
              Food waste is a major issue that affects the environment, economy,
              and society. According to the United Nations, about one-third of
              all food produced for human consumption is lost or wasted
              globally. This amounts to approximately 1.3 billion tons of food
              wasted each year, which has significant social, economic, and
              environmental impacts. Food waste contributes to hunger and
              malnutrition, increases greenhouse gas emissions, and wastes
              valuable resources such as water, energy, and labor. By reducing
              food waste, we can help address these issues and create a more
              sustainable food system for future generations.
            </p>
          </section>
          <section>
            <h2>Yearly average global food loss and waste</h2>
            <ul>
              <li>1/3 of the world's food</li>
              <li>1.3 billion tons</li>
              <li>1 trillion US dollars</li>
              <li>45% of all fruit and vegetables</li>
              <li>35% of all fish and seafood</li>
              <li>30% of all cereals</li>
              <li>20% of all dairy products</li>
              <li>20% of all meat and poultry</li>
            </ul>
          </section>
          <section>
            <h2>How you can save</h2>
            <p>
              By reducing your food waste, you can save money, help the
              environment, and support your community. Here are some simple tips
              to help you reduce food waste at home:
            </p>
            <ul>
              <li>Plan your meals and make a shopping list</li>
              <li>Buy only what you need and use what you buy</li>
              <li>Store food properly to keep it fresh longer</li>
              <li>Use leftovers to create new meals</li>
              <li>Compost food scraps and other organic waste</li>
            </ul>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
