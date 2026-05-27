# Architecture

## Overview
A fully client-side web app with no backend required. All logic runs in the browser.

## Data Flow
1. User fills form on index.html
2. Form data saved to localStorage
3. On submit, user redirected to results.html
4. results.html reads localStorage, runs audit engine
5. Audit engine compares spend vs PRICING_DATA
6. Results rendered to DOM
7. API call made to Gemini for AI summary
8. Email captured via localStorage (Formspree in production)

## Stack
- Frontend: HTML + Tailwind CSS + Vanilla JS
- State: localStorage
- AI Summary: Gemini
- Deployment: Vercel / GitHub Pages

