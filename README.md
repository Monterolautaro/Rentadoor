# Rentadoor

Rentadoor is a full-stack web platform designed as a rental management SaaS, covering the entire long-term rental lifecycle — from property listing and tenant applications to contract signing and payment validation.

This project was developed for real stakeholders and iterated weekly through demos and feedback cycles.

---

## Overview

Rentadoor centralizes the rental process into a single multi-role platform, enabling tenants, administrators, and property owners to interact through controlled workflows and permission-based access.

The system manages complex approval flows, document handling, contract signing, and payment validation while enforcing security, data integrity, and role isolation.

---

## Core Features

### Multi-Role Architecture
- **Tenant**: search properties, apply for rentals, upload documentation, track application status, sign contracts, and submit payment proofs
- **Administrator**: review applications and documents, approve or reject steps, manage users and properties, upload contracts, validate payments
- **Owner**: review pre-approved applications, access documentation, approve or reject rental requests, sign contracts.

Strict role-based access control is enforced across the platform.

---

### End-to-End Rental Workflow
1. Tenant submits a rental application
2. Administrator reviews documentation and pre-approves
3. Owner reviews and approves or rejects the application
4. Administrator uploads rental contract
5. Tenant and owner sign via DocuSign
6. Tenant submits payment proofs
7. Administrator validates payments
8. Key handoff flow becomes available

Each step updates application state and triggers notifications.

---

### Authentication & Security
- JWT-based authentication
- Email verification and password recovery
- Role-based guards and authorization middleware
- Input validation via DTOs and pipes
- Secure file handling and access restrictions
- AES-256 encryption for sensitive data

---

### Dashboards & Monitoring
- Admin dashboards with metrics (users, properties, reservations)
- Reservation and payment status tracking
- User and property moderation tools
- Audit-friendly status history

---

### Notifications
Automated email notifications for:
- Registration and email verification
- Password recovery
- Reservation status changes
- Document review updates
- Payment submission and approval

---

## Tech Stack

**Frontend**
- React
- TypeScript
- Modern component-based UI

**Backend**
- Node.js
- TypeScript
- NestJS
- Supabase (Auth, Database, Storage)
- Role-based access control
- REST APIs

**Integrations**
- DocuSign (contract signing)
- Email delivery (transactional notifications)

---

## Architecture Notes

- Designed as a multi-tenant SaaS-style platform
- Clear separation of concerns between roles
- State-driven workflows for reservations and payments
- Iterative development with weekly demos and stakeholder feedback
- Frontend and backend deployed under the same subdomain to avoid cross-origin cookie issues (Safari compatibility)

---

## Development Process

The project was structured in weekly modules:
- Authentication & session handling
- Reservations and availability
- Document uploads and approvals
- Contracts, payments, and notifications
- Dashboards, security hardening, and audits

Each module was delivered with a demo and reviewed before progressing.

---

## Status

The MVP was completed and fully functional, covering the complete rental lifecycle.

---

## Author

Developed by **Tomas Lautaro Montero**  
Full Stack Developer (TypeScript / React / Supabase)
