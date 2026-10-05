# Agile User Stories & Acceptance Criteria
## Project Kintsugi — Financial Needs Analysis (FNA) Platform
**Document Version:** 1.0  
**Target Release:** Phase 1 Sprints  
**Last Updated:** September 2026

---

## 1. User Personas

| Persona | Role & Demographics | Goals & Motivations | Pain Points |
| :--- | :--- | :--- | :--- |
| **Alex (Prospect User)** | 32-year-old married professional with 1 child. | Wants to understand how much life insurance and college savings he needs without being pressured by pushy sales tactics. | Hates long intrusive forms; distrusts generic marketing claims without seeing data. |
| **Sarah (Financial Advisor)** | Licensed Insurance & Wealth Consultant. | Wants high-quality, pre-qualified leads with context on their financial shortfalls so consultations are productive. | Wastes time cold calling leads who have no budget or clear financial need. |
| **Marcus (Agency Admin)** | Branch Manager / Agency Principal. | Wants visibility into lead intake, advisor response times, and conversion rates from lead to closed client. | Lacks centralized reporting on lead follow-ups and advisor accountability. |

---

## 2. Epics Breakdown

* **Epic 1: Interactive Financial Calculators (Public Funnel)**
* **Epic 2: Soft Gate & Prospect Registration**
* **Epic 3: Unified FNA Health Dashboard & PDF Engine**
* **Epic 4: Dynamic Lead Scoring & Advisor Routing**
* **Epic 5: Advisor Workspace & Lead Management Portal**

---

## 3. User Stories & Gherkin Acceptance Criteria

### Epic 1: Interactive Financial Calculators

#### `US-101`: Interactive Income Protection Calculator
* **User Story**: *As a prospective client (Alex), I want to adjust sliders for my monthly expenses, debts, and existing coverage, so that I can instantly visualize my family's income protection shortfall.*
* **Priority**: **Must Have (MoSCoW)** | **Complexity**: **5 Story Points**
* **Acceptance Criteria**:
  * **Scenario 1: Happy Path Calculation**
    * **Given** Alex is on the Income Protection calculator page,
    * **When** he sets Monthly Living Expenses to ₱60,000, Liabilities to ₱500,000, and Existing Coverage to ₱1,000,000 at a 4% yield,
    * **Then** the system must calculate and display an Insurance Need of ₱17,500,000 and a net Protection Shortfall of ₱17,000,000 in real time ($\le 16\text{ms}$).
  * **Scenario 2: Zero Shortfall Condition**
    * **Given** Alex enters existing insurance coverage that exceeds his total liabilities and income replacement requirement,
    * **Then** the shortfall metric must display ₱0.00 with a congratulatory message indicating full coverage.
  * **Scenario 3: Mobile Viewport Reactivity**
    * **Given** Alex accesses the tool on a smartphone,
    * **When** he drags the input sliders,
    * **Then** the charts and summary numbers must resize and update smoothly without horizontal page scrolling.

---

#### `US-102`: Education Planning Calculator
* **User Story**: *As a parent, I want to calculate the future college tuition cost for my child and the monthly savings required today, so that I can prepare for tuition inflation.*
* **Priority**: **Must Have** | **Complexity**: **5 Story Points**
* **Acceptance Criteria**:
  * **Scenario 1: Accurate Inflation-Adjusted Compounding**
    * **Given** a child age 3, college entry age 18, 4 years of college, current annual tuition ₱150,000, and 6% education inflation,
    * **When** the calculator computes the projected cost,
    * **Then** it must output a total college cost of approximately ₱1,437,934 and display the required monthly investment at an 8% return rate.

---

### Epic 2: Soft Gate & Prospect Registration

#### `US-201`: Value-First Soft Gate Lead Capture
* **User Story**: *As the platform owner, I want to allow users to view one free calculation and require registration to unlock the full 5-module dashboard, so that we convert high-intent prospects into qualified leads.*
* **Priority**: **Must Have** | **Complexity**: **8 Story Points**
* **Acceptance Criteria**:
  * **Scenario 1: First Module Unrestricted Access**
    * **Given** a new visitor lands on the site,
    * **When** they select and complete the Education module,
    * **Then** the system shows complete results without asking for an email.
  * **Scenario 2: Soft Gate Trigger on Second Module or Dashboard**
    * **Given** the user has completed 1 module,
    * **When** they click "Unlock Full FNA Report" or attempt to switch to a second calculator,
    * **Then** a modal appears requesting Full Name, Email, Phone, Age, Marital Status, and Income Range.
  * **Scenario 3: Form Validation Error Handling**
    * **Given** the user inputs an invalid email format (e.g. `alex@invalid`),
    * **When** they click "Submit & Unlock",
    * **Then** the form highlights the email field with "Please enter a valid email address" and halts submission.
  * **Scenario 4: Successful Submission & State Transition**
    * **Given** valid form inputs,
    * **When** the user clicks "Submit & Unlock",
    * **Then** the system sends a `POST /api/leads`, saves the profile, unlocks all 5 modules, and navigates the user to the unified FNA Dashboard.

---

### Epic 3: Unified FNA Health Dashboard & PDF Engine

#### `US-301`: Multi-Module Financial Health Radar
* **User Story**: *As a registered prospect, I want to see a consolidated overview of my financial standing across Education, Retirement, Health, and Income Protection, so that I understand my overall priorities.*
* **Priority**: **Must Have** | **Complexity**: **8 Story Points**
* **Acceptance Criteria**:
  * **Scenario 1: Comprehensive Financial Health Score Display**
    * **Given** a prospect has completed multiple calculator modules,
    * **When** they view the FNA Dashboard,
    * **Then** the system displays a unified Financial Health Score (0–100%) and highlights their single largest financial gap in red.

---

#### `US-302`: Instant Vector PDF Download
* **User Story**: *As a prospect, I want to download a clean, branded PDF summary of my FNA report, so that I can review it offline or share it with my spouse.*
* **Priority**: **Must Have** | **Complexity**: **5 Story Points**
* **Acceptance Criteria**:
  * **Scenario 1: Instant PDF Generation**
    * **Given** a registered user on the dashboard,
    * **When** they click "Download PDF Report",
    * **Then** the system generates and downloads `Financial_Needs_Analysis_<LeadName>.pdf` within $\le 300\text{ms}$ containing all module calculations and advisor contact details.
  * **Scenario 2: Statutory Disclaimers**
    * **Given** any generated PDF,
    * **Then** the footer must contain the mandatory regulatory disclaimer stating outputs are projections for educational purposes only.

---

### Epic 4: Lead Scoring & Advisor Routing

#### `US-401`: Dynamic Hot/Warm/Cold Lead Categorization
* **User Story**: *As a financial advisor, I want incoming leads to be scored and categorized based on income and gap size, so that I can prioritize high-urgency prospects immediately.*
* **Priority**: **Must Have** | **Complexity**: **5 Story Points**
* **Acceptance Criteria**:
  * **Scenario 1: Hot Lead Scoring Classification**
    * **Given** a lead with monthly income $> \text{PHP } 250,000$, financial gaps $> \text{PHP } 5,000,000$, and a valid phone number,
    * **When** the lead is registered,
    * **Then** the scoring engine calculates a score $\ge 70$ and tags the lead as `HOT`.
  * **Scenario 2: Automatic Advisor Assignment**
    * **Given** an active advisor in the system,
    * **When** a lead is created,
    * **Then** a `lead_assignments` record is generated with status `PENDING` linked to the designated advisor.

---

### Epic 5: Advisor Workspace & Lead Management Portal

#### `US-501`: Advisor Secure Login & Session Guard
* **User Story**: *As an advisor (Sarah), I want to securely log into my portal, so that unauthorized users cannot access sensitive prospect financial records.*
* **Priority**: **Must Have** | **Complexity**: **5 Story Points**
* **Acceptance Criteria**:
  * **Scenario 1: Successful Login**
    * **Given** valid advisor credentials,
    * **When** Sarah submits `/portal/login`,
    * **Then** the system sets an HTTP-only secure cookie and redirects to `/portal/leads`.
  * **Scenario 2: Brute Force Protection**
    * **Given** 5 consecutive failed login attempts from the same IP,
    * **When** a 6th attempt is made within 60 seconds,
    * **Then** the system returns `HTTP 429 Too Many Requests` with a retry countdown.

---

#### `US-502`: Lead Management & Status Updating
* **User Story**: *As an advisor, I want to view my assigned leads, inspect their calculator inputs, and update their outreach status (`CONTACTED`, `CONVERTED`, `LOST`), so that I can track my sales pipeline.*
* **Priority**: **Must Have** | **Complexity**: **8 Story Points**
* **Acceptance Criteria**:
  * **Scenario 1: Lead Detail Inspection**
    * **Given** an advisor viewing the lead table,
    * **When** she clicks on a lead row,
    * **Then** the detail view displays the prospect's demographics, lead score, and the exact inputs/outputs for all 5 modules.
  * **Scenario 2: Outreach Status Progression**
    * **Given** an assigned lead in `PENDING` status,
    * **When** Sarah logs a call and selects `CONTACTED` with notes,
    * **Then** the system updates the database via `PATCH /api/portal/leads/[id]` and updates the timeline.
