import React from "react";
import "./footer.css";

const Footer = () => {
  return (
    <footer className="container-fluid footer-bg" id="footer">
      <div className="container pt-5 py-0 text-white text-center">
        <div className="container pt-4">
          <section className="footer-nav mb-3 ">
            {/* <!-- Linkedin --> */}
            <a
              className="btn btn-floating m-1 footer-btn"
              href="https://www.linkedin.com/in/danieladenusi26/"
              role="button"
              data-mdb-ripple-color="dark"
              target="_blank"
              id="linkedin"
            >
              <i className="bi bi-linkedin"></i>
            </a>
            {/* <!-- Github --> */}
            <a
              className="btn btn-floating m-1 footer-btn"
              href="https://github.com/DanielAdenusi"
              role="button"
              data-mdb-ripple-color="dark"
              target="_blank"
              id="github"
            >
              <i className="bi bi-github"></i>
            </a>
            {/* <!-- Email --> */}
            <a
              className="btn text-white btn-floating m-1 footer-btn"
              href="mailto:danieladenusi26@gmail.com?subject=Getting In Touch"
              role="button"
              data-mdb-ripple-color="dark"
              target="_blank"
              id="email"
            >
              <i className="bi bi-envelope"></i>
            </a>
          </section>
        </div>
        <div className="row pt-5 m-0 text-center pb-3">
          <p className="footer-name">~ © 2023 Daniel Adenusi ~</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
