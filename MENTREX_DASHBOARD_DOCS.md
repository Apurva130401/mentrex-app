# Mentrex Dashboard Knowledge Base

## Overview
The Mentrex Dashboard is a comprehensive command center for AI-powered development. It provides access to billing, API key management, automated workflows, and getting support.

## Core Features/Pages

### 1. **My Automations (Workflows)**
*   **Path**: `/dashboard/workflows`
*   **Purpose**: Manage and monitor automated development workflows.
*   **Features**:
    *   **Dashboard View**: Shows a grid of all created workflows with their status (Active/Draft) and last updated date.
    *   **Create New**: Users can create new workflows by clicking the "New Workflow" button.
    *   **Builder Interface**: Clicking a workflow opens a node-based editor (Workflows Builder) to visually design automation logic (nodes and edges).
    *   **Draft/Active Status**: Green dot indicates Active, Grey dot indicates Draft.

### 2. **API Keys**
*   **Path**: `/dashboard/keys`
*   **Purpose**: Authenticate the Mentrex CLI and VS Code Extension.
*   **Security**:
    *   Keys are displayed **only once** upon creation.
    *   Stored securely as SHA-256 hashes in the database.
    *   Users are limited to **one active key** at a time.
*   **Actions**:
    *   **Generate Key**: Creates a new `sk_live_...` key.
    *   **Revoke Key**: Deletes the current key, immediately disabling all connected apps.
    *   **Copy**: One-click copy button for the newly generated key.

### 3. **Billing & Credits**
*   **Path**: `/dashboard/billing`
*   **Purpose**: Manage account credits and view transaction history.
*   **Top Up Options**:
    *   **$10**: Adds 10 credits.
    *   **$50**: Adds 50 credits.
    *   **$100**: Adds 100 credits.
*   **Payment History**: A table showing all past transactions including Date, Amount (USD), Credits purchased, and Status.

### 4. **Account Settings**
*   **Path**: `/dashboard/settings`
*   **Purpose**: Manage personal profile and identities.
*   **Features**:
    *   **Profile Info**: Edit Display Name, view Email (read-only).
    *   **Connected Identities**: View connected OAuth providers (Google, GitHub, Discord). Badges light up if connected.
    *   **Danger Zone**: Option to permanently delete the account (requires support contact).

### 5. **Support**
*   **Path**: `/dashboard/support`
*   **Purpose**: Get help from the team or community.
*   **Channels**:
    *   **Email Support**: `support@mentrex.shop` for billing/technical issues. Typical response time is **24-48 hours**.
    *   **Discord Community**: Link to the official discord server for chatting with devs. Best for **quick questions**.
    *   **GitHub Issues**: Direct link to the `mentrex-issues` repo to report bugs.

## Technical Details for AI
*   **Tech Stack**: Next.js 14, Supabase (Auth & Database), Tailwind CSS, Framer Motion.
*   **Authentication**: Strictly OAuth (Google, GitHub, Discord). No passwords.
*   **Styling**: Dark mode by default, utilizing glassmorphism/transparency effects.

## Common User Questions
*   **"How do I get my API key?"**: Go to `/dashboard/keys`, click "Generate Secret Key". Copy it immediately as you won't see it again.
*   **"How do I delete my account?"**: Go to `/dashboard/settings` -> Danger Zone. Currently, you need to contact support.
*   **"Where can I report a bug?"**: Go to `/dashboard/support` and click the GitHub Issues card.
*   **"Why is my workflow not running?"**: Check if it is set to "Active" in `/dashboard/workflows`. Draft workflows do not execute automatically.
*   **"Where can I view the detailed documentation?"**: You can read the full documentation at https://docs.mentrex.shop
*   **"Where can I see the latest updates?"**: View the changelogs at https://changelog.mentrex.shop
