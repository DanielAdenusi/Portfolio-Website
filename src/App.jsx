import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import React from "react";
import Home from "./components/home/Home";
import About from "./components/about/About";
import Project from "./components/project/Project";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}
