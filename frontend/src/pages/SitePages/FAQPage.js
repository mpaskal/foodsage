import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import { loggedInUserState } from "../../recoil/userAtoms";
import Layout from "../../components/Layout/LayoutApp";
import { Alert, Spinner, Accordion, Card } from "react-bootstrap";

const FAQPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useRecoilValue(loggedInUserState);

  useEffect(() => {
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
      <div className="container my-5 faq-container">
        <h1 className="display-4 text-center mb-5">
          Frequently Asked Questions
        </h1>

        {user && (
          <Alert variant="info" className="mb-4">
            Welcome, {user.firstName}! Here are some common questions and
            answers about our app.
          </Alert>
        )}

        <div className="row mb-5">
          <div className="col-lg-8 mx-auto">
            <p className="lead text-center">
              Our app is a personal inventory management system designed to help
              you track your belongings. Here are some of the most common
              questions our users ask about the app and its features.
            </p>
          </div>
        </div>

        <Accordion>
          <Accordion.Item eventKey="0">
            <Accordion.Header>
              What is this app and what does it do?
            </Accordion.Header>
            <Accordion.Body>
              This app is a personal inventory management system designed to
              help you track your belongings, particularly items you frequently
              misplace or need to keep organized. It allows you to catalog your
              items, record their locations, and easily retrieve this
              information when needed.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="1">
            <Accordion.Header>
              How do I add an item to my inventory?
            </Accordion.Header>
            <Accordion.Body>
              To add an item:
              <ol className="faq-add-item">
                <li>Navigate to the "Add Item" page</li>
                <li>Enter the item's name</li>
                <li>Select or create a category</li>
                <li>Specify the location</li>
                <li>Add any additional details (optional)</li>
                <li>Click "Save" to add the item to your inventory</li>
              </ol>
            </Accordion.Body>
          </Accordion.Item>
          {/* Add more Accordion.Items for the remaining questions */}
        </Accordion>

        <div className="row mb-5">
          <div className="col-md-6 mb-4">
            <Card>
              <Card.Body>
                <Card.Title as="h2">Using the Dashboard</Card.Title>
                <Card.Text>
                  The dashboard is your app's home page. It provides an overview
                  of your inventory, including:
                </Card.Text>
                <ul>
                  <li>Total number of items</li>
                  <li>Items by category</li>
                  <li>Recently added items</li>
                  <li>Items you've marked as needing attention</li>
                </ul>
                <Card.Link href="#" className="btn btn-outline-primary">
                  Learn More About the Dashboard
                </Card.Link>
              </Card.Body>
            </Card>
          </div>
          <div className="col-md-6 mb-4">
            <Card>
              <Card.Body>
                <Card.Title as="h2">Getting the Most Out of the App</Card.Title>
                <Card.Text>To maximize the benefits of this app:</Card.Text>
                <ul>
                  <li>Regularly update your inventory</li>
                  <li>Use consistent naming conventions</li>
                  <li>Utilize custom fields for specialized information</li>
                  <li>Check the dashboard regularly</li>
                  <li>Use search and filter features effectively</li>
                </ul>
                <Card.Link href="#" className="btn btn-outline-primary">
                  View Advanced Tips
                </Card.Link>
              </Card.Body>
            </Card>
          </div>
        </div>

        <div className="text-center mb-5">
          <h2 className="h3 mb-4">Still Have Questions?</h2>
          <p>
            If you couldn't find the answer to your question, please don't
            hesitate to reach out to our support team. We're here to help!
          </p>
          <a href="mailto:support@inventoryapp.com" className="btn btn-primary">
            Contact Support
          </a>
        </div>
      </div>
    </Layout>
  );
};

export default FAQPage;
