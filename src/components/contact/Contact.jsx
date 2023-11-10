import React, { useState, useRef } from "react";
import Toast from "react-bootstrap/Toast";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import "./contact.css";
import { Form } from "react-bootstrap";
import emailjs from "emailjs-com";

const Contact = () => {
  const [show, setShow] = useState(false);
  const [toastActive, setToastActive] = useState(false);
  const form = useRef();

  var [title, setTitle] = useState("");
  var [message, setMessage] = useState("");

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleToastShow = () => setToastActive(true);

  function sendEmail(e) {
    e.preventDefault(); //This is important, i'm not sure why, but the email won't send without it

    emailjs
      .sendForm(
        "service_3882cy8",
        "template_uxv6ft8",
        form.current,
        "dtQeqjYmCJivh7EE3"
      )
      .then(
        (result) => {
          console.log(result.text);

          const handleTitle = () => setTitle("Success");
          const handleMessage = () =>
            setMessage(
              "Message has been received. Expect a reply in 3-5 days."
            );
          handleTitle();
          handleMessage();

          handleClose();
          handleToastShow();

          // setTimeout(function () {
          //   window.location.reload();
          // }, 2000);
          // window.location.reload(); //This is if you still want the page to reload (since e.preventDefault() cancelled that behavior)
        },
        (error) => {
          console.log(error.text);

          const handleTitle = () => setTitle("Error");
          const handleMessage = () =>
            setMessage("Error in sending the message.");
          handleTitle();
          handleMessage();

          handleClose();
          handleToastShow();
        }
      );
  }

  return (
    <>
      <div
        className="container-fluid contact-bg py-5 d-flex align-items-center justify-content-center"
        id="contact"
      >
        <div className="container py-5">
          <div className="d-flex flex-column text-center  align-items-center gap-3">
            <p className="contact-title m-0">GET IN TOUCH</p>
            <p className="contact-desc my-1 mb-2">
              Whether you are starting a project, have business inquiries or
              just want to say hi, my inbox is always open so feel free to reach
              out and I will get back to you as soon as possible.
            </p>
            <Button className="btn-dark" onClick={handleShow}>
              Reach out
            </Button>
          </div>
          <Modal
            show={show}
            onHide={handleClose}
            style={{ zIndex: "9999" }}
            animation={false}
            className="contact-btn-close"
          >
            <Form
              ref={form}
              className="container contact-form"
              onSubmit={sendEmail}
            >
              <Modal.Header closeButton className="modal-lg border-0">
                <Modal.Title className="container modal-title p-0">
                  Contact Me
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {/* Email */}
                <Form.Group className="mb-3">
                  <Form.Label
                    htmlFor="sender_email"
                    className="modal-sub-title"
                  >
                    Email Address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="name@example.com"
                    name="sender_email"
                    id="sender_email"
                    pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
                    required
                    autoComplete="email"
                    autoFocus
                    className="modal-input"
                  />
                </Form.Group>
                {/* First Name */}
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="first_name" className="modal-sub-title">
                    First Name
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="first_name"
                    id="first_name"
                    minLength={4}
                    required
                    autoComplete="given-name"
                    placeholder="John"
                    className="modal-input"
                  />
                </Form.Group>
                {/* Last Name */}
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="last_name" className="modal-sub-title">
                    Last Name
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="last_name"
                    id="last_name"
                    minLength={4}
                    required
                    autoComplete="family-name"
                    placeholder="Doe"
                    className="modal-input"
                  />
                </Form.Group>
                {/* Comments */}
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="message" className="modal-sub-title">
                    Comment
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="message"
                    id="message"
                    className="modal-input"
                  />
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button className="btn-dark w-100 " type="submit">
                  Submit
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>
          <div className="toast-container position-fixed bottom-0 end-0 p-3 border border-0 text-start">
            <Toast
              onClose={() => setToastActive(false)}
              show={toastActive}
              delay={2000}
              autohide
              className="toast-bg-dark w-auto"
            >
              <Toast.Header>
                <strong className="me-auto">{title}</strong>
              </Toast.Header>
              <Toast.Body>{message}</Toast.Body>
            </Toast>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
