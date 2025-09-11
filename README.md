# Student Hiring System – Frontend (React + FastAPI)

![Azure](https://img.shields.io/badge/hosted%20on-Azure_Static_Web_Apps-blue)

## Live Application

* **Frontend**: [Live Site](https://blue-moss-0cf2b2f10.1.azurestaticapps.net/)
* **Backend (Swagger UI)**: [FastAPI Docs](https://studenthiringapp-d8cxb6h0e8eyevhf.westus-01.azurewebsites.net/docs)
* **Student Data**: [Testing Data – Student Lookup Use Case](https://github.com/user-attachments/files/21176231/StudentData.pdf)
* **Bulk Upload Template**: [View](./assets/csv/BulkUploadTemplate.csv) • [Download](https://github.com/TroyJLorents-GH/ui-student-py/raw/main/assets/csv/BulkUploadTemplate.csv)
* **Bulk Upload Data Ready File**: [View](./assets/csv/BulkUploadExample.csv) • [Download](https://github.com/TroyJLorents-GH/ui-student-py/blob/main/assets/csv/BulkUploadExample.csv?raw=1)
* **Instructor Test Info**: [View](./assets/csv/Instructor_Info.csv) • [Download](https://github.com/TroyJLorents-GH/ui-student-py/blob/main/assets/csv/Instructor_Info.csv?raw=1)



---

## About Me

I'm **Troy Lorents**, a full-stack engineer with 7+ years of experience building secure, scalable systems.
This project demonstrates a **React.js frontend** powered by a **FastAPI backend**, deployed to Azure with CI/CD pipelines.

---

## Overview

A full-stack web application that manages **student hiring**. The frontend provides HR staff, admins, and the public with a clean dashboard for student assignments. The backend, written in Python with FastAPI, handles all compensation, cost center, and bulk processing logic.

---

## Tech Stack

* **Frontend**: React.js, Material UI (MUI X Pro DataGrid), Axios, Lucide-React
* **Backend**: FastAPI (Python), SQLAlchemy ORM, Azure SQL
* **Hosting**: Azure Static Web Apps (frontend) + Azure App Service (backend)
* **CI/CD**: GitHub Actions (auto-deploy on push to main)
* **Other Tools**: Swagger / OpenAPI, Power Automate (Forms → DB), Git

---

## Features

* 🔍 **Student Lookup** – Search by ASU ID or ASURITE
* 📚 **Class Assignment** – Use cascading dropdowns to select and assign classes
* 🖥️ **Master Dashboard** – HR/admin-only overview of all hires
* 🌎 **Public Dashboard** – Public-facing view with limited student assignment data
* 📑 **Student Summary** – View all assignments for a student, track hours across sessions, and edit details
* 📂 **Bulk Upload** – Upload student hires from CSV:

  * Backend auto-calculates **Compensation** & **Cost Center Key**
  * Use **Calibrate Preview** to validate before final insert
* 🖨️ **Print Confirmation** – Generate printable hiring confirmation
* 🛠️ **Manage Assignments** – Instructors can view and update their class assignments

---

## Bulk Upload

The system supports batch uploads via CSV.

* **Template CSV**: [BulkUploadTemplate.csv](./BulkUploadTemplate.csv)
* **Example CSV**: [BulkUploadExample.csv](./BulkUploadExample.csv)

### Template Fields:

| Field                                        | Required | Description                          |
| -------------------------------------------- | -------- | ------------------------------------ |
| `Position`                                   | ✅        | Position type (IA, Grader, TA, etc.) |
| `FultonFellow`                               | Optional | Defaults to "No" if blank            |
| `WeeklyHours`                                | ✅        | Hours per week (5, 10, 15, 20)       |
| `Student_ID (ID number OR ASUrite accepted)` | ✅        | Either 10-digit ASU ID or ASURITE    |
| `ClassNum`                                   | ✅        | Target class number                  |

The backend will:

* Validate students/classes
* Enrich with **Student Info** and **Class Info**
* Auto-calculate **Compensation** and **Cost Center Key**

---

## Dev Highlights

* ✅ **MUI X Pro DataGrid** – Editable rows, detail panels, highlighting changed fields
* ✅ **Public vs Private Dashboards** – Different access levels (secure vs open)
* ✅ **Compensation Formula** – Handles hourly rate, session multipliers, and fellowship status
* ✅ **Secure Secrets** – Managed via `.env` + GitHub Actions secrets
* ✅ **CORS Config** – Allows safe cross-origin API access between frontend/backend
* ✅ **CI/CD** – Auto-deploy pipeline with GitHub Actions

---

## Live Demo

* **Frontend**: [blue-moss-0cf2b2f10.1.azurestaticapps.net](https://blue-moss-0cf2b2f10.1.azurestaticapps.net/)
* **Backend (Swagger UI)**: [FastAPI Docs](https://studenthiringapp-d8cxb6h0e8eyevhf.westus-01.azurewebsites.net/docs)

---

### Created by Troy Lorents | @TroyJLorents-GH

 Licensed under MIT

