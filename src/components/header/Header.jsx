import React from "react";
import "./header.css";
import cv from "../extras/PlacementCV.pdf";
import ScrollUp from "./ScrollUp";

const Header = () => {
  return (
    <>
      <header className="container py-3" id="header">
        <nav className="navbar fixed-top navbar-expand-md navbar-light position-relative p-0">
          <div className="container justify-content-end">
            <button
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              className="navbar-toggler"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div
              className="collapse navbar-collapse justify-content-end"
              id="navbarNav"
            >
              <ul className="navbar-nav gap-3 gap-lg-5 d-flex align-items-end align-items-md-center text-end mt-3 mt-md-0">
                <li className="nav-item">
                  <a href="#about" className="nav-link">
                    About
                  </a>
                </li>
                <li className="nav-item">
                  <a href="#project" className="nav-link">
                    Project
                  </a>
                </li>
                <li className="nav-item">
                  <a href="#contact" className="nav-link">
                    Contact
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    name=""
                    id=""
                    className="btn-dark"
                    href={cv}
                    target="_blank"
                    role="button"
                  >
                    Resume
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <a href="#header" id="scrollUp" title="Go to top">
          ︽
        </a>
      </header>
      <ScrollUp />
    </>
  );
};

export default Header;
