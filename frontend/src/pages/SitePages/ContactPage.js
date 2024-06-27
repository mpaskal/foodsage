import React from "react";
import Layout from "../../components/Layout/LayoutSite";

const ContactPage = () => {
  return (

      <Layout>
      <div className="contact-page">
        <div className="contact-header">
          <h1>Contact us</h1>
          <p className="email-us">Email us: <a href="mailto:greenduo@gmail.com">greenduo@gmail.com</a></p>
        </div>
        <div className="feedback-section">
          <h2 className="form-name">Give Feedback</h2>
          <p>We’d love to hear from you. How are you feeling about Food Sage?</p>
          <form className="feedback-form">
            <label>
              <input type="checkbox" name="feedback" value="cant-find" />
              I can’t find something
            </label>
            <label>
              <input type="checkbox" name="feedback" value="cant-figure-out" />
              I can’t figure out how to do something
            </label>
            <label>
              <input type="checkbox" name="feedback" value="figured-out" />
              I figured how to do something, but it was too hard to do.
            </label>
            <label>
              <input type="checkbox" name="feedback" value="love-it" />
              I love it!
            </label>
            <label>
              <input type="checkbox" name="feedback" value="something-else" />
              Something else.
            </label>
            <div className="additional-feedback">
              <label>Anything else you’d like to share?</label>
              <textarea placeholder="I have feedback on..."></textarea>
            </div>
            <button type="submit" className="submit-button">Submit</button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;
