import React from "react";
import "./about.css";
import portrait from "../extras/portraitImg.jpeg";

const About = () => {
  return (
    <>
      <section className="container-fluid about-bg" id="about">
        <div className="container d-flex flex-column justify-content-center align-items-center text-center position-relative">
          <div className="row container d-flex flex-column flex-lg-row mb-5 align-items-center justify-content-center gap-5 p-0">
            <div className="col d-flex flex-column justify-content-start align-items-start pt-1 w-auto text-start px-0">
              <p className="about-description-title text-center text-lg-start m-0 w-100">
                A LITTLE ABOUT ME
              </p>
              <div className="w-100 d-flex flex-column align-items-center align-items-lg-start text-center text-lg-start">
                <p className="about-description m-0">
                  Hello, I am Daniel, I am currently a second-year computer
                  science student at Loughborough University hoping to establish
                  a career as a web developer. I had previously spent time
                  trying to find the right programming language for myself until
                  I stumbled on the website development languages (HTML, CSS,
                  JavaScript) and decided to try it, now I am in love with them
                  and constantly honing my skills and learning new things.{" "}
                  <br /> <br /> I am an avid tv show binger, just do not expect
                  me to have fully finished the show. I am currently watching
                  'New Girl' and I absolutely love it. I sometimes play first
                  person's shooters like apex and rainbow six siege with a
                  friend of mine (whenever we can find the time that is).
                </p>
                <hr />
              </div>
              <div className="d-flex flex-column gap-2 mt-3 w-100">
                <p className="technology-title m-0 text-center text-lg-start">
                  Technologies
                </p>
                <ul className="technology-desc technology-list text-center text-lg-start p-0 d-flex flex-wrap justify-content-center justify-content-lg-start gap-3">
                  <li className="technology-list-item">Html</li>
                  <li className="technology-list-item">JavaScript</li>
                  <li className="technology-list-item">CSS</li>
                  <li className="technology-list-item">React</li>
                  <li className="technology-list-item">Bootstrap</li>
                  <li className="technology-list-item">Php</li>
                  <li className="technology-list-item">Python</li>
                  <li className="technology-list-item">Java</li>
                  <li className="technology-list-item">MySQL</li>
                </ul>
              </div>
            </div>
            <div className="col container w-auto">
              <div className="about-img-content">
                <img
                  className="about-img d-none d-lg-inline"
                  src={portrait}
                  alt="self-Portrait"
                />
                <div className="about-caption-overlay d-none d-lg-inline">
                  <p
                    className="about-caption text-center m-0"
                    readOnly
                    disabled
                  >
                    Daniel Adenusi <br />
                    19 Years Old <br />
                    Bsc Computer Science
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
