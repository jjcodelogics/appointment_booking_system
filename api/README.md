# API Directory

This directory contains Vercel serverless functions.

## Files

- **index.js**: Main API entry point. Wraps the Express server for serverless deployment.

## How it works

Vercel automatically converts files in the `api/` directory into serverless functions. Each file exports a default function that handles HTTP requests.

The routing is configured in `vercel.json`.
