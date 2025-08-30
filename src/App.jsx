import { BrowserRouter as Router } from "react-router-dom";
import AppContent from "../src/context/AppContext.jsx"; // move the big code into a separate file if needed

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
