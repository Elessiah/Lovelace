# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview
Lovelace is a platform designed to showcase female role models in scientific careers to inspire young girls. It's a Next.js application with a MySQL database, user authentication, and email confirmation system. The project addresses the visibility gap of female scientists by creating spaces for direct interaction between role models and youth.

## Development Commands

### Development Server
```bash
npm run dev          # Start development server with Turbopack
```
The development server runs on http://localhost:3000 by default.

### Build & Production
```bash
npm run build        # Build for production with Turbopack
npm start           # Start production server on port 9000 (listens on all interfaces)
```

### Linting
```bash
npm run lint        # Run ESLint with Next.js configuration
```

### Docker Development
```bash
# Full stack with all services
docker compose up --build

# Development mode (detached)
docker compose up -d

# Stop all services
docker compose down

# Rebuild specific services (excluding certbot)
docker compose up -d --build nextjs nginx mysql phpmyadmin

# Build only Next.js service
docker compose build nextjs
```

### SSL Certificate Management
```bash
# Renew SSL certificates (requires HTTP-only nginx config first)
docker compose down
docker compose up -d nginx nextjs
docker compose run --rm certbot
```

## Architecture Overview

### Application Structure
- **Frontend**: Next.js 15.5.4 with React 19, TypeScript, and Turbopack
- **Backend**: Next.js API routes for server-side logic
- **Database**: MySQL with connection pooling via mysql2/promise
- **Authentication**: bcryptjs for password hashing, JWT tokens for session management
- **Email**: Nodemailer for user confirmation emails
- **Deployment**: Docker containerization with nginx reverse proxy

### Key Directories
- `src/app/`: Next.js App Router pages and API routes
- `src/lib/`: Shared utilities (database connection, email service)
- `nginx/`: nginx configuration for reverse proxy and SSL
- `certbot/`: Let's Encrypt SSL certificate management

### User Roles & Access Control
The application supports two user types:
- **Users (Utilisateur)**: Regular users who can browse and interact
- **Ambassadors (Ambassadrice)**: Female role models who can be contacted

Role-based access is enforced at the page level:
- `dashboard_user/`: Only accessible to authenticated users with "user" status
- `dashboard_amba/`: Only accessible to authenticated users with "ambassador" status

### Database Schema
The application uses a MySQL database with at least a `Users` table containing:
- `email`, `first_name`, `last_name`: User information
- `hash`: bcrypt-hashed password
- `token`: Email confirmation token
- `status`: User role ("Utilisateur" or "Ambassadrice")

### API Endpoints
- `POST /api/signup`: User registration with email confirmation
- `POST /api/login`: User authentication (currently basic implementation)
- `POST /api/chat`: Basic chat/messaging functionality
- `GET /api/dashboard_user`: User dashboard data
- `GET /api/dashboard_amba`: Ambassador dashboard data
- `POST /api/confirm`: Email confirmation handling
- `POST /api/private_chat`: Private messaging system

### Environment Configuration
Required environment variables:
- `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`: Database connection
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`: Email service configuration
- `NEXT_PUBLIC_URL`: Application URL for email confirmation links

## Development Guidelines

### Client-Side Components
Always use `"use client"` directive for page.tsx files that require client-side interactivity, as noted in the project documentation.

### Path Resolution
The project uses TypeScript path mapping with `@/*` pointing to `src/*` for clean imports.

### Code Style
- ESLint configuration extends Next.js core web vitals and TypeScript rules
- Turbopack is used for faster builds and development
- French language is used for user-facing text (email confirmations, etc.)

### Docker Services
The docker-compose stack includes:
- **nextjs**: Application server (port 9000)
- **nginx**: Reverse proxy with SSL termination (ports 80/443)
- **mysql**: Database server (port 3306)
- **phpmyadmin**: Database administration (port 8000)
- **certbot**: SSL certificate management

### Development Workflow
1. Use `npm run dev` for local development
2. Test with full Docker stack using `docker compose up --build`
3. Database can be accessed via phpMyAdmin at http://localhost:8000
4. Production deployment uses nginx with Let's Encrypt SSL certificates

## Current Implementation Status
Based on the codebase analysis, several features are in development:
- Basic user registration with email confirmation is implemented
- Login system exists but needs completion
- Dashboard pages are placeholder implementations
- Chat/messaging system is in early stages
- User profile pages use dynamic routing (`/user/[id_user]`)

When working on this project, prioritize completing the authentication flow and user management systems before adding new features.