import React from "react";
import Layout from "../components/Layout/LayoutSite";

const ContactPage = () => {
  return (
    <Layout>
      <div className="contact">
        <header className="contact-header">
          <h1>Contact us</h1>
          <p>
            Email us: <a href="mailto:greenduo@gmail.com">greenduo@gmail.com</a>
          </p>
        </header>
        <div className="feedback-section">
          <h2>Give Feedback</h2>
          <p>
            We’d love to hear from you. How are you feeling about Food Sage?
          </p>
          <form className="feedback-form">
            <div>
              <input
                type="checkbox"
                id="cant-find"
                name="feedback"
                value="cant-find"
              />
              <label htmlFor="cant-find"> I can’t find something</label>
            </div>
            <div>
              <input
                type="checkbox"
                id="cant-figure-out"
                name="feedback"
                value="cant-figure-out"
              />
              <label htmlFor="cant-figure-out">
                {" "}
                I can’t figure out how to do something
              </label>
            </div>
            <div>
              <input
                type="checkbox"
                id="figured-out"
                name="feedback"
                value="figured-out"
              />
              <label htmlFor="figured-out">
                {" "}
                I figured out how to do something, but it was too hard to do
              </label>
            </div>
            <div>
              <input
                type="checkbox"
                id="love-it"
                name="feedback"
                value="love-it"
              />
              <label htmlFor="love-it"> I love it!</label>
            </div>
            <div>
              <input
                type="checkbox"
                id="something-else"
                name="feedback"
                value="something-else"
              />
              <label htmlFor="something-else"> Something else</label>
            </div>
            <div className="feedback-input">
              <label htmlFor="additional-feedback">
                Anything else you’d like to share?
              </label>
              <textarea
                id="additional-feedback"
                name="additional-feedback"
                placeholder="I have feedback on..."
              ></textarea>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;
