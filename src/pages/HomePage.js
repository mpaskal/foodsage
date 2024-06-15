import React from "react";
import Layout from "../components/Layout/LayoutSite";
import HeroImg from "../assets/images/home_page_main_image_sm.jpg";

const HomePage = () => {
  return (
    <Layout>
      <div className="home-page">
        <section className="hero">
          <img src={HeroImg} alt="Header" className="header-image" />
        </section>
        <section className="content">
          <div>
            <h1>Food Waste</h1>
            <p>
              Food waste is a major issue that affects the environment, economy,
              and society. According to the United Nations, about one-third of
              all food produced for human consumption
              <a href="https://www.un.org/en/sections/issues-depth/food/index.html">
                {" "}
                is lost or wasted
              </a>
              globally. This amounts to approximately 1.3 billion tons of food
              wasted each year, which has significant social, economic, and
              environmental impacts. Food waste contributes to hunger and
              malnutrition, increases greenhouse gas emissions, and wastes
              valuable resources such as water, energy, and labor. By reducing
              food waste, we can help address these issues and create a more
              sustainable food system for future generations.
            </p>
          </div>
          <div className="statistics">
            <h2>Yearly average global food loss and waste</h2>
          </div>
          <div>
            <div className="stats">
              <h3>How you can save</h3>
              <p>
                By reducing your food waste, you can save money, help the
                environment, and support your community. Here are some simple
                tips to help you reduce food waste at home:
              </p>
              <ul>
                <li>Plan your meals and make a shopping list</li>
                <li>Buy only what you need and use what you buy</li>
                <li>Store food properly to keep it fresh longer</li>
                <li>Use leftovers to create new meals</li>
                <li>Compost food scraps and other organic waste</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default HomePage;
