import { Outlet } from "react-router-dom";
import "./App.css";
import NavBar from "./components/Navbar/NavBar";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <header className="App-header">
          <NavBar />
          <main className="main-content">
            <Outlet />
          </main>
        </header>
      </div>
    </AuthProvider>
  );
}

export default App;
