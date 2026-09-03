import { BrowserRouter } from "react-router-dom";
import Navigation from "./components/Navigation";

function App(){
  return(
    <div>
      <BrowserRouter>
        <Navigation/>
      </BrowserRouter>
    </div>
  );
}

export default App;