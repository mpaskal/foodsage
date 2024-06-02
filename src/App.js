import logo from "./logo.png";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          FoodSage
        </a>
      </header>
      <body>
        <h1>FoodSage</h1>
        <p>
          FoodSage is a web application that helps you use food without waste.
        </p>
        <p>
          It also provides you with the ways to use your food smart: reduce
          waste, save money, share food with others.
        </p>
      </body>
    </div>
  );
}

export default App;
