import React from "react";
import "./home.css";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import About from "../about/About";
import Project from "../project/Project";
import Contact from "../contact/Contact";

const Home = () => {
  return (
    <>
      <Header />
      <main className="container d-flex flex-column justify-content-center align-items-center align-items-lg-start text-center text-lg-start">
        <p className="intro m-0 fw-thin fs-5">
          👋🏿 Hi, I'm<b className="m-0 intro-2 fw-semibold"> Daniel Adenusi</b>
        </p>
        <h1 className="title m-0 lh-1 fw-lighter">
          Front-End
          <br />
          <p className="title-2 m-0">Web Developer</p>
        </h1>
        <p className="info my-3 fw-light">
          I am seeking the opportunity to gain real-world experience <br />
          in the web development field.
        </p>
        <a href="#project" className="btn-dark btn-discover">
          Discover My Projects
        </a>
      </main>
      <About />
      <Project />
      <Contact />
      <Footer />
    </>
  );
};

export default Home;
