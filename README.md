# fastfood-cicd-project
FastFood CI/CD Project
This project demonstrates a CI/CD pipeline for a Fast Food web application using Jenkins and AWS services.

📌 Overview
The application is built with Node.js and is automatically built and deployed to AWS EC2 whenever code is pushed to GitHub.

🛠️ Tech Stack
HTML, CSS, JavaScript
Node.js (Express)
Git & GitHub
Jenkins
AWS EC2, CodeBuild, CodeDeploy

📂 Project Structure

fastfood-cicd-project/
├── scripts/
├── Jenkinsfile
├── buildspec.yml
├── appspec.yml
├── server.js
├── index.html
├── style.css
├── package.json
└── README.md

🔁 CI/CD Flow
Code pushed to GitHub
Jenkins triggers the pipeline
AWS CodeBuild builds the app
AWS CodeDeploy deploys to EC2
Application goes live
🚀 Run Locally
npm install
node server.js
Visit: http://localhost:3000

👨‍💻 Author
Vikas Yadav
