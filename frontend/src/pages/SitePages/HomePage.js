import React from "react";
import Layout from "../../components/Layout/LayoutSite";
import HeroImg from "../../assets/images/main_picture.png";
import ReduceWasteImage from "../../assets/images/reduce_waste.png";
import { Link, useNavigate } from "react-router-dom";

const HomePage = () => {
  return (
    <Layout>
      <div className="home">
        <header className="home-header">
          <img src={HeroImg} alt="Hero" className="hero-image" />
          <h1
            className="header-text"
            style={{
              position: "absolute",
              top: "39%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "#fd7565",
              fontSize: "2.5em",
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              padding: "10px 20px",
              borderRadius: "5px",
              textAlign: "center",
              width: "80%",
              maxWidth: "800px",
            }}
          >
            Set waste management and budget goals
          </h1>
        </header>
        <div className="home-content">
          <section>
            <h2 className="main-Name-title" style={{ color: "#058240" }}>
              Discover Foodsage: Your Smart Pantry Companion!
            </h2>
            <p className="main-Name">
              Unlock the full potential of your pantry with Foodsage!
            </p>
            <p className="main-Name">
              Our innovative app is designed to revolutionize the way you manage
              food at home, ensuring that nothing goes to waste.
            </p>
            <p className="main-Name">
              {" "}
              With Foodsage, you're not just organizing your kitchen—you're
              joining a movement towards sustainability and mindful consumption.
            </p>
          </section>

          <section className="features-section">
            <div className="text-block">
              <h2 className="text-block-title">Why Choose Foodsage?</h2>
              <ul>
                <li>
                  Reduce Waste: Get reminders before your food expires, so you
                  can use it just in time.
                </li>
                <li>
                  Save Money: Track your food usage and avoid buying excess
                  groceries that lead to waste.
                </li>
                <li>
                  Eat Fresh: Use our tailored recipes to turn nearing-expiration
                  ingredients into delicious meals.
                </li>
                <li>
                  Support the Community: Don’t let surplus food go to waste;
                  donate it to local food banks through our app with just a few
                  taps.
                </li>
              </ul>
            </div>
            <div className="image-block">
              <img
                src={ReduceWasteImage}
                alt="Reduce_waste"
                className="Reduce_waste"
              />
            </div>
          </section>

          <section>
            <div className="steps-container">
              <h2 className="steps-container-title">
                Start Making a Difference Today in Three Easy Steps:
              </h2>

              <h3>1. Create Your Account</h3>
              <ul>
                <li>
                  Sign Up for a new account or Log In with your existing
                  credentials, including Google account integration for quick
                  access.
                </li>
              </ul>

              <h3>2. Manage Your Inventory</h3>
              <ul>
                <li>
                  Add Items to your inventory by entering product names,
                  purchase dates, and expiration dates. Use our barcode scanner
                  for quick input!
                </li>
              </ul>

              <h3>3. Track, Donate, and Cook</h3>
              <ul>
                <li>
                  View Expiring Items: Get notifications for items nearing their
                  expiration.
                </li>
                <li>
                  Set Waste Goals: Commit to reducing your food waste through
                  achievable targets.
                </li>
                <li>
                  Donate: Easily donate items to partnered food banks right from
                  the app.
                </li>
                <li>
                  Discover Recipes: Find delicious recipes tailored to use up
                  your available ingredients.
                </li>
              </ul>

              <h3>4. Stay Informed</h3>
              <ul>
                <li>
                  Access real-time statistics about your food usage and savings.
                </li>
              </ul>
              <p>
                With Foodsage, you're not just managing your pantry; you're
                contributing to a sustainable world. Reduce waste, save money,
                and share what you can. Start today!
                <Link to="/signin">Login</Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
