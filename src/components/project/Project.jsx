import React from "react";
import "./project.css";
import projectChain from "../extras/project-link.svg";
import dashboard from "../extras/make-it-all/make-dashboard.png";
import login from "../extras/make-it-all/make-login.png";
import project from "../extras/make-it-all/make-project.png";
import register from "../extras/make-it-all/make-register.png";
import tasks from "../extras/make-it-all/make-tasks.png";
import toDo from "../extras/make-it-all/make-to-do.png";
import Carousel from "react-bootstrap/Carousel";

const Project = () => {
  return (
    <>
      <section className="container-fluid project-bg py-5" id="project">
        <div className="container d-flex flex-column justify-content-center align-items-center text-center position-relative py-5">
          <div className="featured-project d-flex flex-column align-items-start text-start w-100 gap-3">
            <div className="row d-flex gap-3 py-2">
              <div className="featured-project-header">
                <p className="featured-project-header-subtitle">
                  Featured Project
                </p>
                <div className="d-flex flex-row gap-1 align-items-center">
                  <p className="featured-project-header-title">Make-It-All</p>
                  <a href="#project" className="featured-project-link">
                    <div className="featured-project-link-container ">
                      <img src={projectChain} alt="Project Link" />
                    </div>
                  </a>
                </div>
              </div>
              <p className="featured-project-desc lh-3 lh-sm-0">
                Designed and developed a personal portfolio website to showcase
                my skills and projects. Utilized HTML, CSS, and JavaScript to
                create an interactive and visually appealing site. Implemented
                responsive design principles for ideal viewing on a range of
                devices.
              </p>
            </div>
            <div className="row w-100 py-2">
              <div className="col">
                <p className="featured-project-title">Tech Stack</p>
                <ul className="featured-project-list ">
                  <li className="featured-project-list-item">HTML</li>
                  <li className="featured-project-list-item">CSS</li>
                  <li className="featured-project-list-item">JAVASCRIPT</li>
                  <li className="featured-project-list-item">PHP</li>
                  <li className="featured-project-list-item">BOOTSTRAP</li>
                  <li className="featured-project-list-item">JQUERY</li>
                </ul>
              </div>
              <div className="col">
                <p className="featured-project-title">Project Type</p>
                <ul className="featured-project-list ">
                  <li className="featured-project-list-item">Fullstack</li>
                </ul>
              </div>
              <div className="col">
                <p className="featured-project-title">Timeline</p>
                <ul className="featured-project-list ">
                  <li className="featured-project-list-item">
                    October 2023 - Present
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="row justify-content-between w-100">
            <div className="col d-flex flex-column w-100 p-0">
              <Carousel
                data-bs-theme="dark"
                className="d-none d-lg-inline-block"
              >
                <Carousel.Item interval={2500}>
                  <div className="project-img-content">
                    <img src={login} alt="" className="project-img" />
                    <div className="project-caption-overlay d-inline">
                      <p
                        className="project-caption text-center m-0"
                        readOnly
                        disabled
                      >
                        Login
                        <br />
                      </p>
                    </div>
                  </div>
                  <Carousel.Caption></Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item interval={2500}>
                  <div className="project-img-content">
                    <img src={register} alt="" className="project-img" />
                    <div className="project-caption-overlay d-inline">
                      <p
                        className="project-caption text-center m-0"
                        readOnly
                        disabled
                      >
                        Register
                      </p>
                    </div>
                  </div>
                  <Carousel.Caption></Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item interval={2500}>
                  <div className="project-img-content">
                    <img src={dashboard} alt="" className="project-img" />
                    <div className="project-caption-overlay d-inline">
                      <p
                        className="project-caption text-center m-0"
                        readOnly
                        disabled
                      >
                        Manager Dashboard
                      </p>
                    </div>
                  </div>
                  <Carousel.Caption></Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item interval={2500}>
                  <div className="project-img-content">
                    <img src={tasks} alt="" className="project-img" />
                    <div className="project-caption-overlay d-inline">
                      <p
                        className="project-caption text-center m-0"
                        readOnly
                        disabled
                      >
                        Tasks
                      </p>
                    </div>
                  </div>
                  <Carousel.Caption></Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item interval={2500}>
                  <div className="project-img-content">
                    <img src={project} alt="" className="project-img" />
                    <div className="project-caption-overlay d-inline">
                      <p
                        className="project-caption text-center m-0"
                        readOnly
                        disabled
                      >
                        Projects
                      </p>
                    </div>
                  </div>
                  <Carousel.Caption></Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item interval={2500}>
                  <div className="project-img-content">
                    <img src={toDo} alt="" className="project-img" />
                    <div className="project-caption-overlay d-inline">
                      <p
                        className="project-caption text-center m-0"
                        readOnly
                        disabled
                      >
                        To-Do List
                      </p>
                    </div>
                  </div>
                  <Carousel.Caption></Carousel.Caption>
                </Carousel.Item>
              </Carousel>
              <div className="featured-mobile col d-lg-none  ">
                <div className="featured-mobile-img-content">
                  <p className="featured-mobile-caption m-0" readOnly disabled>
                    Login
                  </p>
                  <img src={login} alt="" className="featured-mobile-img" />
                </div>
                <hr />
                <div className="featured-mobile-img-content">
                  <p className="featured-mobile-caption m-0" readOnly disabled>
                    Register
                  </p>
                  <img src={register} alt="" className="featured-mobile-img" />
                </div>
                <hr />
                <div className="featured-mobile-img-content">
                  <p className="featured-mobile-caption m-0" readOnly disabled>
                    Dashboard
                  </p>
                  <img src={dashboard} alt="" className="featured-mobile-img" />
                </div>
                <hr />
                <div className="featured-mobile-img-content">
                  <p className="featured-mobile-caption  m-0" readOnly disabled>
                    Tasks
                  </p>
                  <img src={tasks} alt="" className="featured-mobile-img" />
                </div>
                <hr />
                <div className="featured-mobile-img-content">
                  <p className="featured-mobile-caption m-0" readOnly disabled>
                    Projects
                  </p>
                  <img src={project} alt="" className="featured-mobile-img" />
                </div>
                <hr />
                <div className="featured-mobile-img-content">
                  <p className="featured-mobile-caption m-0" readOnly disabled>
                    To-Do
                  </p>
                  <img src={toDo} alt="" className="featured-mobile-img" />
                </div>
              </div>
            </div>
          </div>
          <div className="row justify-content-between w-100">
            {/* <p className="project-title m-0">Project</p> */}
          </div>
        </div>
      </section>
    </>
  );
};

export default Project;
