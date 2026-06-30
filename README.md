# Portfolio Website

A personal endeavour showcasing my journey as a graduate Computer Science student at Loughborough University. This repository contains the source code for my personal portfolio, which I will continually update with new projects and technical milestones.

## About Me

I am a full-stack developer with a strong focus on building Progressive Web Apps (PWAs). I enjoy combining robust backend architecture with clean, maintainable frontend code. I also have a keen interest in cybersecurity and threat modelling.

## Tech Stack

This portfolio, along with my broader projects, relies on the following technologies:

- **Frontend:** React.js, Vanilla CSS (utilising the BEM naming convention)
- **Design & UI:** Figma, favouring clean typography like Space Grotesk and Inter

## Featured Projects

Below are some of the key projects featured on this portfolio:

- **Social Fitness App:** A gamified PWA featuring real-time leaderboards and social networking elements.

## Local Development

To run this repository locally, follow these steps:

1. Clone the repository to your local machine.
2. Navigate to the root directory.
3. Run `npm install` to install all required dependencies.
4. Run `npm run build` to create a production build, or your designated dev command to start the local server.

## Blog Admin Environment

The blog admin uses server-side API routes for post management and Cloudinary image uploads. Copy `.env.example` to `.env.local` and set `BLOG_ADMIN_PASSWORD`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`. `CLOUDINARY_BLOG_FOLDER` is optional and defaults to `portfolio/blog`.
