import React from "react";
import Layout from "../../components/Layout/LayoutSite";
import HeroImg from "../../assets/images/about_page.jpg";

const AboutPage = () => {
  return (
    <Layout>
      <div className="about">
        <header className="about-header">
          <img
            src={HeroImg}
            alt="Vegetables and fruits"
            className="header-image"
          />
          <h1 className="header-text">About our company</h1>
        </header>
        <div className="about-content">
          <p>
            <span className="icon">🍏</span> GreenDuo is a software development
            company founded in 2024 to tackle a critical social impact project:
            reducing food waste in Canada. Did you know that $49 billion worth
            of food is wasted or lost in Canada each year? That's enough to feed
            every Canadian for five months! Moreover, the annual cost of food
            waste for each household is $1,766.
          </p>
          <p>
            <span className="icon">🍏</span> Our mission is to develop
            innovative solutions to address this pressing issue.
          </p>
          <p>
            <span className="icon">🍏</span> Our flagship project, FoodSage,
            aims to reduce food waste by 5% among households, small businesses,
            and organizations.
          </p>
          <p>
            <span className="icon">🍏</span> We offer comprehensive services,
            from project coordination to implementation, and beyond, including
            post-deployment support and maintenance, to ensure our solutions
            deliver long-term value.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;
