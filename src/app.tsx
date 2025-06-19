import "./app.css";
import { CurrencySwap } from "@/components/currency-swap";
import { GlobalStyles } from "@/assets/styles/global-styles";

function App() {
  return (
    <>
      <GlobalStyles />
      <div className="App">
        <CurrencySwap />
      </div>
    </>
  );
}

export default App;
