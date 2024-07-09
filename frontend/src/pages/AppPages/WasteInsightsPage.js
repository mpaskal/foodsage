import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import { loggedInUserState } from "../../recoil/userAtoms";
import Layout from "../../components/Layout/LayoutApp";
import { Alert, Spinner } from "react-bootstrap";

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
      <div className="container my-5">
        <h1 className="mb-4">Waste Insights</h1>

        {user && (
          <Alert variant="info" className="mb-4">
            Welcome, {user.firstName}! Here are some insights to help you reduce
            food waste.
          </Alert>
        )}

        {/* Rest of your content sections */}
        <section className="mb-5">
          <h2>Introduction</h2>
          <p>
            Food waste is a significant global issue, with major environmental,
            economic, and social implications. This page aims to provide you
            with valuable insights and practical strategies to help reduce food
            waste in your own household.
          </p>
        </section>

        <section className="mb-5">
          <h2>Understanding Food Waste</h2>
          <p>
            Food waste can be categorized into several types, including
            spoilage, overproduction, expiration, and plate waste. Understanding
            the common causes of food waste, such as improper storage, buying
            too much, and poor meal planning, is the first step towards reducing
            it.
          </p>
        </section>
        <section className="mb-5">
          <h2>5 Ways to Reduce Food Waste</h2>
          <div className="embed-responsive embed-responsive-16by9">
            <iframe
              className="embed-responsive-item"
              src="https://lovefoodhatewaste.ca/5-ways/"
              title="5 Ways to Reduce Food Waste"
              allowFullScreen
            ></iframe>
          </div>
        </section>
        <section className="mb-5">
          <h2>Tips and Strategies for Reducing Food Waste</h2>
          <ul>
            <li>
              Plan your meals and grocery shopping to avoid buying more than you
              need.
            </li>
            <li>Store food properly to extend its shelf life.</li>
            <li>Use up leftover ingredients and repurpose food creatively.</li>
            <li>
              Learn to interpret expiration dates and recognize when food is
              still safe to consume.
            </li>
          </ul>
        </section>

        <section className="mb-5">
          <h2>Composting and Disposal</h2>
          <p>
            Composting food waste can significantly reduce the amount of waste
            going to landfills and create nutrient-rich soil for your garden.
            For non-compostable food waste, proper disposal methods are
            essential.
          </p>
          <a href="#" className="btn btn-primary">
            Learn More About Composting
          </a>
        </section>

        <section className="mb-5">
          <h2>Sustainability and the Environment</h2>
          <p>
            Food waste has a significant impact on the environment, contributing
            to greenhouse gas emissions, water usage, and land degradation. By
            reducing food waste, you can support more sustainable food systems
            and play a role in protecting the planet.
          </p>
          <img
            src="sustainable-food.jpg"
            alt="Sustainable Food System"
            className="img-fluid mb-3"
          />
        </section>

        <section className="mb-5">
          <h2>Community Engagement</h2>
          <p>
            Many local organizations and initiatives are working to address food
            waste in our communities. Explore opportunities to get involved and
            make a positive impact.
          </p>
          <a href="#" className="btn btn-primary">
            Find Local Food Donation Programs
          </a>
        </section>

        <section className="mb-5">
          <h2>Resources and Further Reading</h2>
          <ul className="list-unstyled">
            <li className="mb-2">
              <button
                className="btn btn-link p-0 text-decoration-none"
                onClick={() => alert("This resource is not available yet.")}
              >
                10 Tips to Reduce Food Waste at Home
              </button>
            </li>
            <li className="mb-2">
              <button
                className="btn btn-link p-0 text-decoration-none"
                onClick={() => alert("This resource is not available yet.")}
              >
                The Environmental Impact of Food Waste
              </button>
            </li>
            <li className="mb-2">
              <button
                className="btn btn-link p-0 text-decoration-none"
                onClick={() => alert("This resource is not available yet.")}
              >
                Composting 101: A Beginner's Guide
              </button>
            </li>
          </ul>
        </section>
      </div>
    </Layout>
  );
};

export default WasteInsightsPage;
