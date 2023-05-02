# IS27 Full Stack Developer Coding Challange

# Overview

This application is built using the following technologies:

- **Next.js**: A popular framework for building React applications, which provides server-side rendering, static site generation, and other performance optimizations.
- **tRPC**: A type-safe, end-to-end framework for building data-driven APIs with TypeScript.
- **Prisma**: A next-generation ORM for Node.js and TypeScript that makes it easy to work with databases.
- **PlanetScale**: A serverless MySQL platform
- **Vercel**: A cloud platform service for rapid development and CI/CD using next.js as web framework.

The aim of this repository is to showcase and end-to-end type-safe framework using typscript, starting from the database up to the client side. This framework aims to reduce the friction between the frontend and backend thus increasing developer productivity especially those who work on both frontend and backend aspects of the application.

# Getting Started

1. Create an account in Vercel (https://vercel.com/docs/concepts/get-started)
2. Create an account and MySQL database in PlanetScale (https://planetscale.com/docs/tutorials/planetscale-quick-start-guide). After successfully creating a MySQL database, we can use the connection string and add it to the .env file
```bash
DATABASE_URL='mysql://CONNECTION_STRING_HERE'
```
3. After cloning this repository, you can now run the following bash commands.
```bash
npm install
npm run dev
```
4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

5. For Prisma, you can initailize ORM mapping and seed data using the following commands
```bash
npx prisma db push
npx prisma db seed
```
6. For reseting the database, use the following commands
```bash
npx prisma migrate reset --skip-seed
npx prisma db push
npx prisma db seed
```

# CI/CD

Integration and deployment of new code is done very seamlessly using GitHub. Make sure you have connected your Vercel account and any commits into the repository will trigger deployment actions from GitHub to Vercel.

Application Diagram

```markdown
+------------+    +-------++------+    +-------------+
|            |    |               |    |             |
|  Frontend  +--->+  tRPC + Next  +--->+  Prisma     |
| (React.js) |    |    (Vercel)   |    |(ORM, Schema)|
|            |    |               |    |             |
+------------+    +---------------+    +-------------+
                                       |
                                       |
                                       v
                                 +-----+------+
                                 |            |
                                 | PlanetScale|
                                 |  (MySQL)   |
                                 |            |
                                 +------------+
```
