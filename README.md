# VettMe

VettMe is a pre-employment validation platform built with Next.js for verifying candidate identity and contact details before an interview. The system checks key applicant information such as name, NIN, BVN, phone number, email, and state of origin to reduce hiring risk and improve recruitment trust.

## Overview

This project is designed for HR teams and hiring managers who want a faster, more reliable way to validate applicant data before scheduling interviews. It combines frontend validation, auth flows, and backend record tracking into a single app.

## Features

- Candidate vetting workflow with form-based validation
- Name and NIN/BVN verification checks
- Phone and email validation with formatting rules
- State-of-origin verification logic
- Secure authentication using JWT-based sessions
- Vetting history and result tracking
- API endpoints for validation and verification status
- Responsive landing page and dashboard UI

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- MongoDB with Mongoose
- JWT for session auth
- Lucide React for icons

## Project Structure

```bash
vett-app/
├── app/
│   ├── api/
│   ├── auth/
│   ├── dashboard/
│   ├── history/
│   ├── verify/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
├── lib/
│   ├── models/
│   ├── validators/
│   ├── auth.ts
│   ├── db.ts
│   └── didit.ts
├── middleware.ts
├── next.config.ts
├── package.json
├── tsconfig.json
├── .gitignore
├── README.md
└── .env.example
```

## Prerequisites

Before running the project, make sure you have:

- Node.js 20+
- npm
- MongoDB connection string (optional for local testing, but recommended)
- DIDIT API key and workflow ID if you want full verification flow enabled

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/vett-app.git
cd vett-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root of the project and add the required values.

```bash
cp .env.example .env.local
```

Example configuration:

```bash
MONGODB_URI=mongodb://localhost:27017/vettme
JWT_SECRET=your_super_secret_key
APP_URL=http://localhost:3000
DIDIT_API_KEY=your_didit_api_key
DIDIT_WORKFLOW_ID=your_didit_workflow_id
```

> Keep these values private and never commit real secrets to a public repository.

### 4. Run the development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser to view the app.

### 5. Build for production

```bash
npm run build
npm run start
```

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `MONGODB_URI` | Yes for DB-backed mode | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key used to sign auth tokens |
| `APP_URL` | Recommended | Base URL for app callbacks and redirect flows |
| `DIDIT_API_KEY` | Optional | API key for external verification integration |
| `DIDIT_WORKFLOW_ID` | Optional | DIDIT workflow used for verification flow |

## Available Scripts

```bash
npm run dev     # start local development server
npm run build   # create production build
npm run start   # run production build locally
npm run lint    # run ESLint checks
```

## Notes on Security

- Use strong secrets in production
- Store all real credentials in local environment files or deployment secrets
- Do not expose API keys in public code
- If the project is made public, make sure environment variables are not committed to Git

## Publishing to GitHub

If you want to push this project to GitHub as a public repo:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/vett-app.git
git push -u origin main
```

Then go to GitHub and change the repository visibility to Public in the repository settings.

## License

This project does not currently include a license file. If you plan to make it public, it is recommended to add an open-source license such as MIT before releasing it publicly.

## Contributing

Contributions are welcome. If you want to improve the project, please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

## Contact

For questions or collaboration, reach out through your GitHub profile or project maintainer contact.
