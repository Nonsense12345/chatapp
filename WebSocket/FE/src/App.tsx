import "./App.css";
import { Route, Routes } from "react-router-dom";
import ChatApp from "./page/chat/ChatApp";

function App() {
  return (
    <Routes>
      <Route path="/" element={<ChatApp />}></Route>
    </Routes>
  );
}

export default App;
