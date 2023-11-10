import React from "react";
import "./footer.css";
import Contact from "../contact/Contact";
import linkedin from "../extras/linkedin.svg";
import github from "../extras/github.svg";
import email from "../extras/email.svg";

const Footer = () => {
  return (
    <footer className="container-fluid footer-bg" id="footer">
      <div className="container pt-5 text-white">
        <nav className="navbar navbar-dark d-flex justify-content-center align-items-center py-5">
          <ul className="navbar-nav d-flex flex-row gap-5 ">
            <li className="footer-nav-item">
              <a
                className="footer-link"
                href="mailto:danieladenusi26@gmail.com?subject=Getting In Touch"
              >
                <div className="footer-link-container">
                  <img src={email} alt="" />
                </div>
              </a>
            </li>
            <li className="footer-nav-item">
              <a
                className="footer-link"
                href="https://github.com/DanielAdenusi"
                target="_blank"
              >
                <div className="footer-link-container">
                  <img src={github} alt="" />
                </div>
              </a>
            </li>
            <li className="footer-nav-item">
              <a
                className="footer-link "
                href="https://www.linkedin.com/in/danieladenusi26/"
                target="_blank"
              >
                <div className="footer-link-container">
                  <img src={linkedin} alt="" />
                </div>
              </a>
            </li>
          </ul>
        </nav>
        <div className="row pt-5 m-0 text-center pb-3">
          <p className="footer-name">~ © 2023 Daniel Adenusi ~</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
