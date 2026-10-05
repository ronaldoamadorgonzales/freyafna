# Functional Requirements Specification (FRS)
## Project Kintsugi — Financial Needs Analysis (FNA) Platform
**Document Version:** 1.0  
**Target Release:** Phase 1 Production  
**Last Updated:** September 2026

---

## 1. Document Overview & Conventions

### 1.1 Purpose & Scope
This document specifies the complete functional and non-functional requirements for **Project Kintsugi**. It defines calculation formulas, input constraints, API contracts, security controls, and state transitions for engineering implementation and QA validation.

### 1.2 ID Numbering Schema
* **`FR-xxx`**: Functional Requirements (Feature logic, state machines, user interfaces).
* **`NFR-xxx`**: Non-Functional Requirements (Performance, security, privacy, scalability).
* **`API-xxx`**: API Endpoint Interface Specifications.

---

## 2. Module-by-Module Functional Requirements

### 2.1 Module 1: Interactive Calculation Engines (`FR-100` to `FR-105`)

#### `FR-101`: Insurance & Income Protection Engine
* **Description**: Computes the capital fund required to sustain a family's lifestyle if the primary earner passes away or becomes disabled.
* **Input Fields**:
  * Monthly Living Expenses ($E_{mo}$, PHP): Range $\ge 0$, Default ₱50,000.
  * Assumed Safe Yield / Inflation-Adjusted Interest Rate ($r$, %): Range 1%–15%, Default 4%.
  * Outstanding Liabilities / Debts ($L$, PHP): Range $\ge 0$.
  * Emergency Fund Target ($EF$, PHP): Range $\ge 0$.
  * Final Expenses / Funeral Buffer ($FE$, PHP): Range $\ge 0$.
  * Existing Life Insurance Coverage ($C_{exist}$, PHP): Range $\ge 0$.
  * Current Liquid Savings ($S$, PHP): Range $\ge 0$.
* **Mathematical Formula**:
  $$\text{Capital Needed to Provide} = \frac{E_{mo} \times 12}{r / 100}$$
  $$\text{Total Liabilities} = L + EF + FE$$
  $$\text{Total Existing Assets} = C_{exist} + S$$
  $$\text{Target Insurance Protection Gap} = \max(0, (\text{Capital Needed} + \text{Total Liabilities}) - \text{Total Existing Assets})$$

#### `FR-102`: Education Planning Engine
* **Description**: Projects future university tuition costs considering education inflation and computes the monthly savings required.
* **Input Fields**:
  * Current Annual Tuition ($T_{curr}$, PHP): Range $\ge 0$.
  * Child's Current Age ($A_{curr}$): 0–17 years.
  * College Entry Age ($A_{entry}$): Default 18 years.
  * Years in College ($N_{years}$): Default 4 years.
  * Education Inflation Rate ($i_{edu}$, %): Range 1%–15%, Default 6%.
  * Projected Investment Return ($r_{inv}$, %): Range 1%–15%, Default 8%.
  * Existing Education Fund ($EF_{exist}$, PHP): Range $\ge 0$.
* **Mathematical Formula**:
  $$t_{prep} = A_{entry} - A_{curr}$$
  $$\text{Projected Total College Cost} = (T_{curr} \times N_{years}) \times (1 + i_{edu})^{t_{prep}}$$
  $$\text{Future Value of Existing Fund} = EF_{exist} \times (1 + r_{inv})^{t_{prep}}$$
  $$\text{Net Education Gap} = \max(0, \text{Projected Cost} - \text{FV Existing Fund})$$
  $$\text{Required Monthly Investment} = \frac{\text{Net Education Gap} \times (r_{inv}/12)}{(1 + r_{inv}/12)^{t_{prep} \times 12} - 1}$$

#### `FR-103`: Retirement Planning Engine
* **Description**: Projects retirement corpus requirements based on desired monthly retirement income and years in retirement.
* **Formula & Outputs**: Evaluates future value of ordinary annuity based on retirement horizon, life expectancy, and pre/post-retirement investment yields.

#### `FR-104`: Health & Critical Illness Shortfall Engine
* **Description**: Evaluates critical illness recovery fund gap against recommended medical benchmarks.
* **Default Benchmark**: Default recommended medical coverage $\text{PHP } 2,000,000.00$.
* **Formula**: $\text{Health Shortfall} = \max(0, \text{Desired Coverage} - \text{Existing Coverage})$.

#### `FR-105`: Milestone Savings Calculator
* **Description**: Calculates monthly savings required to fund custom milestone goals (e.g. House Downpayment, Wedding, Business Capital).

---

### 2.2 Module 2: Soft Gate Lead Capture (`FR-200`)

* **`FR-201` Soft Gate Trigger**:
  * A guest user is granted full interactive access to **one** calculator module of their choice without registration.
  * Attempting to access remaining modules, the overall FNA summary score, or the PDF download triggers the Soft Gate modal.
* **`FR-202` Mandatory Data Fields**:
  * Full Name (String, 2–255 chars, required).
  * Email Address (Valid RFC 5322 format, required, unique check).
  * Mobile Number (Valid Philippine/International format, optional).
  * Age (Integer, 18–80, required).
  * Marital Status (`SINGLE`, `MARRIED`, `DIVORCED`, `WIDOWED`, required).
  * Dependents Count (Integer $\ge 0$, required).
  * Monthly Income Range (Select: `< ₱30k`, `₱30k–₱50k`, `₱50k–₱100k`, `₱100k–₱250k`, `> ₱250k`, required).
  * Current Liquid Savings (Numeric, required).
  * Desired Retirement Age (Integer, 40–80, required).

---

### 2.3 Module 3: Dynamic Lead Scoring Algorithm (`FR-300`)

* **`FR-301` Scoring Rules (0 to 100 Points)**:
  1. **Income Bracket Weight (Max 30 pts)**:
     * `> ₱250k`: 30 pts | `₱100k–₱250k`: 25 pts | `₱50k–₱100k`: 18 pts | `₱30k–₱50k`: 10 pts | `< ₱30k`: 5 pts.
  2. **Total Identified Financial Gap Weight (Max 40 pts)**:
     * Gap $> \text{PHP } 5\text{M}$: 40 pts | ₱2M–₱5M: 30 pts | ₱500k–₱2M: 20 pts | $< \text{PHP } 500\text{k}$: 10 pts.
  3. **Engagement Depth & Dependents (Max 30 pts)**:
     * Dependents $\ge 2$: 15 pts | Dependents = 1: 10 pts | Dependents = 0: 5 pts.
     * Mobile number provided: +15 pts.
* **`FR-302` Category Classification**:
  * **`HOT`**: Score $\ge 70$ points (Immediate advisor dispatch priority).
  * **`WARM`**: Score $45 - 69$ points.
  * **`COLD`**: Score $< 45$ points.

---

### 2.4 Module 4: Vector PDF Summary Generator (`FR-400`)

* **`FR-401` PDF Content Structure**:
  * **Header**: Project Kintsugi branding, generated timestamp, reference ID.
  * **Client Summary**: Name, age, monthly income tier, dependent count.
  * **Consolidated Financial Health Radar**: Table of all 5 modules with current protection vs. target need.
  * **Recommended Action Steps**: Bulleted priorities based on largest financial gaps.
  * **Advisor Details & Disclaimer**: Assigned advisor contact card and mandatory statutory disclaimer.
* **`FR-402` Zero-Dependency Execution**: Must render synchronously as binary stream with zero external browser processes.

---

### 2.5 Module 5: Advisor Management Portal (`FR-500`)

* **`FR-501` Advisor Authentication**:
  * Password verification via native async `scrypt`.
  * Secure HTTP-only JWT session cookie (`12h` expiry, `SameSite=Lax`, `Secure`).
* **`FR-502` Lead Management Table**:
  * Filter leads by status (`PENDING`, `CONTACTED`, `CONVERTED`, `LOST`) and category (`HOT`, `WARM`, `COLD`).
  * Search by Lead Name, Email, or Mobile.
* **`FR-503` Detailed Profile View & Status Update**:
  * Expand lead to view exact calculator inputs/outputs submitted in JSONB format.
  * Ability to update outreach status and record consultation timestamp notes.

---

## 3. API Endpoint Specifications

| Endpoint | Method | Auth | Description | Status Codes |
| :--- | :---: | :---: | :--- | :--- |
| `/api/leads` | `POST` | Public | Submits soft-gate profile, creates lead, calculates score, and auto-assigns advisor. | `200`, `400`, `409`, `500` |
| `/api/pdf` | `POST` | Public/Lead | Generates and streams down the synchronous vector PDF summary. | `200`, `400`, `500` |
| `/api/auth/login` | `POST` | Public | Authenticates advisor and sets secure session cookie. | `200`, `400`, `401`, `429`, `500` |
| `/api/auth/logout` | `POST` | Advisor | Invalidates advisor session cookie. | `200` |
| `/api/portal/leads` | `GET` | Advisor | Lists assigned leads with filtering, pagination, and full module inputs. | `200`, `401`, `403` |
| `/api/portal/leads/[id]` | `PATCH` | Advisor | Updates lead outreach status (`CONTACTED`, `CONVERTED`, `LOST`) and notes. | `200`, `400`, `401`, `404` |

---

## 4. Non-Functional Requirements (NFRs)

* **`NFR-01` Real-Time Client Math Latency**: Slider input updates in calculator modules must compute and re-render charts within $\le 16\text{ms}$ (60 FPS).
* **`NFR-02` PDF Generation Speed**: Synchronous vector PDF generation must stream complete documents within $\le 300\text{ms}$.
* **`NFR-03` Login Rate Limiting**: Limit advisor login attempts to 5 failures per 60-second window per IP.
* **`NFR-04` Session Security**: All advisor authentication tokens must be AES-GCM encrypted and stored exclusively in HTTP-only, SameSite=Lax cookies.
* **`NFR-05` Regulatory Data Privacy**: Clear disclaimer banners displayed on all calculator pages and PDF summaries stating projections are for illustrative and educational purposes only.

---

## 5. Error Handling & Validation Rules Matrix

| Error Condition | Trigger | System Response | User-Facing Message |
| :--- | :--- | :--- | :--- |
| **Invalid Email Format** | Submitting ill-formed email at Soft Gate. | `HTTP 400 Bad Request` | "Please enter a valid email address." |
| **Duplicate Lead Email** | Submitting existing email. | `HTTP 200 / Update` | Updates existing lead profile smoothly without blocking user. |
| **Invalid Slider Number** | Negative or NaN input to calculator. | Fallback to Default Min | Auto-clamps to minimum valid non-negative integer. |
| **Unauthenticated Portal** | Accessing `/portal` without cookie. | `HTTP 302 Redirect` | Redirects to `/portal/login`. |
| **Brute Force Login** | $\ge 5$ failed attempts in 1 min. | `HTTP 429 Too Many Requests` | "Too many failed attempts. Please retry in X seconds." |
