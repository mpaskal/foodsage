import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import { loggedInUserState } from "../../recoil/userAtoms";
import Layout from "../../components/Layout/LayoutApp";
import { Alert, Spinner } from "react-bootstrap";

import VegetablesInsightsImg from "../../assets/images/vegetables-insights.jpg";
import TableReduceFoodWasteImg from "../../assets/images/table_reduce_food_waste.png";

const WasteInsightsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useRecoilValue(loggedInUserState);

  useEffect(() => {
    // Simulate content loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "80vh" }}
        >
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Alert variant="danger" className="m-3">
          <Alert.Heading>Error loading content</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container my-5 waste-insights-container">
        <h1 className="mb-4">Waste Insights</h1>
        {user && (
          <Alert variant="info" className="mb-4">
            Welcome, {user.firstName}! Here are some insights to help you reduce
            food waste.
          </Alert>
        )}

        <img
          src={VegetablesInsightsImg}
          alt="Insights on Vegetables"
          className="full-width-image"
        />

        <section className="mb-5">
          <h2 className="h2-name">
            A resource for understanding and reducing food waste
          </h2>
          <p>
            Food waste is a significant global issue, with major environmental,
            economic, and social implications. Here, we empower you with
            valuable information, tools, and inspiration to make the most of
            your food, save money, and contribute to a more sustainable
            world.Every year, millions of tons of food go to waste, impacting
            our environment and our wallets. At FoodSage, we believe that small
            changes in our daily habits can make a big difference. The Waste
            Insights page is designed to help you track your food waste, learn
            about its effects, and discover practical ways to minimize it.
          </p>
        </section>

        <div className="row">
          <section className="col-md-6 mb-5">
            <h2 className="h2-name2">Understanding Food Waste</h2>
            <p>
              Food waste can be categorized into several types, including
              spoilage, overproduction, expiration, and plate waste.
              Understanding the common causes of food waste, such as improper
              storage, buying too much, and poor meal planning, is the first
              step towards reducing it.Moreover, engaging in food waste
              reduction practices can inspire innovations in food storage,
              distribution, and consumption, paving the way for a more efficient
              and equitable food system. By collectively addressing the issue of
              food waste, we can help ensure that the resources used in food
              production are utilized to their fullest potential, ultimately
              contributing to a healthier planet and society.
            </p>
          </section>
          <section className="col-md-6 mb-5">
            <h2 className="h2-name2">
              Tips and Strategies for Reducing Food Waste
            </h2>

            <ul>
              <li>
                Plan your meals and grocery shopping to avoid buying more than
                you need.
              </li>
              <li>Store food properly to extend its shelf life.</li>
              <li>
                Use up leftover ingredients and repurpose food creatively.
              </li>
              <li>
                Learn to interpret expiration dates and recognize when food is
                still safe to consume.
              </li>
            </ul>
          </section>
        </div>

        <section className="h2-name2">
          <h2 className="h2-name">5 Ways to Reduce Food Waste</h2>

          <img
            src={TableReduceFoodWasteImg}
            alt="Table of Reducing Food Waste"
            className="full-width-image"
          />
        </section>

        <div className="row">
          <section className="col-md-4 mb-5">
            <h2 className="h2-name">Composting and Disposal</h2>
            <p className="h2-name-text">
              Composting food waste can significantly reduce the amount of waste
              going to landfills and create nutrient-rich soil for your garden.
              For non-compostable food waste, proper disposal methods are
              essential.
            </p>
            <a href="#" className="btn btn-primary">
              Learn More About Composting
            </a>
          </section>
          <section className="col-md-4 mb-5">
            <h2 className="h2-name">Community Engagement</h2>
            <p className="h2-name-text">
              Many local organizations and initiatives are working to address
              food waste in our communities. Explore opportunities to get
              involved and make a positive impact.
            </p>
            <a href="#" className="btn btn-primary">
              Find Local Food Donation Programs
            </a>
          </section>
          <section className="col-md-4 mb-5">
            <h2 className="h2-name">Reducing Food Waste in Ontario</h2>

            <p className="h2-name-text">
              Programs like Toronto's Green Bin Program and Ottawa's Composting
              Programs provide residents with the tools and knowledge needed to
              divert organic waste from landfills and turn it into valuable
              compost. Additionally, supporting local food banks and donation
              initiatives can ensure that surplus food reaches those in need
              rather than going to waste. Together, we can make a substantial
              impact on reducing food waste and fostering a greener future for
              Ontario.
            </p>
            <a
              href="https://www.toogoodtogo.com/en-ca/look-smell-taste?gad_source=1&gclid=Cj0KCQjwhb60BhClARIsABGGtw_uvsfzJDYudYQKqeZ_GKdK0sSiS-gSmgrZrLrb2_RjX0EEZlcKGIYaAjfzEALw_wcB"
              className="btn btn-primary"
            >
              Learn More About Reducing Food Waste in Ontario
            </a>
          </section>
        </div>

        <section className="mb-5">
          <h2 className="h2-name2">Create Dishes from Leftovers</h2>
          <p>
            Got leftovers in your freezer? Turn them into delicious meals with
            these helpful resources:
          </p>
          <ul>
            <li>
              <a
                href="https://www.allrecipes.com/recipes/1947/everyday-cooking/more-meal-ideas/leftovers/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="file-name">Allrecipes Leftovers</span>:
                Discover a variety of recipes using your leftover ingredients.
              </a>
            </li>
            <li>
              <a
                href="https://www.supercook.com/#/recipes"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="file-name">SuperCook</span>: Enter your
                ingredients and find recipes that match what you have on hand.
              </a>
            </li>
            <li>
              <a
                href="https://www.lovefoodhatewaste.com/recipe"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="file-name">Love Food Hate Waste Recipes</span>:
                Explore recipes designed to reduce food waste and make the most
                of your leftovers.
              </a>
            </li>
          </ul>
        </section>
      </div>
    </Layout>
  );
};

export default WasteInsightsPage;
