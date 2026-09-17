# VSTAR EBO Review Dashboard

## Author

**Amina Beevi K Salim**

---

## Objective

The objective of the **VSTAR EBO Review Dashboard** is to provide a centralized web-based platform for monitoring and analyzing customer reviews across VSTAR Exclusive Brand Outlets (EBOs).

The dashboard is designed to:

- Provide a single interface to view reviews from multiple EBO locations.
- Display important review statistics and KPIs.
- Analyze customer sentiment.
- Display rating distribution.
- Monitor review reply status.
- Display suggested review replies.
- Provide EBO-level performance information.
- Reduce the need to manually check review data through the MySQL database.

The dashboard works with the existing VSTAR Review Automation system and uses the processed review data stored in MySQL.

---

## Overview

The **VSTAR EBO Review Dashboard** is a web-based dashboard developed to monitor and analyze customer reviews from VSTAR Exclusive Brand Outlets (EBOs).

It provides a centralized interface to view review statistics, sentiment information, reply status, customer reviews, and EBO performance.

The dashboard uses the existing VSTAR review database and works alongside the existing review automation system.

---

## Features

### Overview

The Overview section displays key review metrics:

- Total Reviews
- Average Rating
- Positive Reviews
- Negative Reviews
- Pending Reviews
- Posted Reviews

### Analytics

The Analytics section provides:

- Store / EBO filtering
- Sentiment filtering
- Rating filtering
- Sentiment Analysis
- Rating Distribution
- Customer Reviews

All filters work together and update the analytics and review information.

### Customer Reviews

The Customer Reviews table displays:

| Field | Description |
|---|---|
| Customer | Customer/reviewer name |
| Rating | Google rating |
| Review | Customer review text |
| Sentiment | Positive, Neutral, Negative, or Rating Only |
| Reply Status | Current reply status |
| Review Reply | Suggested reply stored in the database |

### EBO Performance

The EBO Performance section provides store-level review information to monitor review activity across VSTAR EBO locations.

### User Authentication

The dashboard includes:

- Login
- Registration
- Forgot Password
- Logout
- Switch Account

---

## Technology Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Python, Flask
- **Database:** MySQL
- **Authentication:** bcrypt

The Google Business Profile API, Hugging Face, and DistilBERT models belong to the separate VSTAR Review Automation system and are not included in this repository.

---

## Project Structure

```text
VSTAR-DASHBOARD/
│
├── app.py
│
├── dashboard.html
├── dashboard.css
├── dashboard.js
│
├── index.html
│
├── login.html
├── login.css
│
├── register.html
├── register.css
│
├── forgot_password.html
│
├── style.css
│
├── .gitignore
└── README.md
