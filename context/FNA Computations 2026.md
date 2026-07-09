---
title: FNA Computations
tags:
  - sunlife
  - sales
  - fna
  - computations
version: 1.5
updated: 20260617
author: Ronald Gonzales
---

# **Financial Needs Analysis (FNA)**

---

## **Description**
These are the basic FNA calculations which I have been using as a [[Sun Life]] Financial Advisor since 2016.

---

## **Initial Requirements for the Computations**
The following are the initial requirements that would be required to generate the FNA computation:

Name of the Client
Age of the Client - Note that this cannot be less than 18 years of age. 


## **1. Insurance Protection**

### **Purpose**

To determine how much life insurance coverage a person needs to replace income and pay off liabilities in the event of death. There are two common approaches to compute for the basic insurance requirement.

---

### Required Inputs: 
- Monthly Expenses
- Interest Rate
- Liabilities
- Emergency Fund
- Final Expenses
- Existing Coverage
- Savings


### **Formula 1: Comprehensive Computation**

A detailed formula for determining total insurance protection, taking into account annual living expenses, income replacement, liabilities, assets, and existing insurance coverage.

1. **Annual Living Expenses:**  
    `annual_expenses = monthly_expenses × 12`
    
2. **Capital Needed to Provide Income (Income Replacement):**  
    `amount_needed_to_provide = annual_expenses ÷ (interest_rate ÷ 100)`  
    → This **capitalization formula** determines how much money must be invested to generate the required annual income.
    
3. **Total Liabilities:**  
    `total_liabilities = liabilities + emergency_fund + final_expenses`
    
4. **Total Available Assets:**  
    `total_cash_assets = existing_coverage + savings`
    
5. **Target Protection Fund:**  
    `target_fund = (amount_needed_to_provide + total_liabilities) − total_cash_assets`
    

---

### **Formula 2: Rule of Thumb**

A simplified approach where the required insurance coverage is estimated as **ten times the client’s annual income**, ensuring that beneficiaries have at least 10 years of income replacement.

1. **Total Protection Fund:**  
    `target_fund = ((monthly_expenses × 12) × 10) - total_cash_assets`
    

> **Note:** In both formulas, the **target fund** represents the total life insurance coverage needed to sustain the family’s lifestyle, settle debts, and cover final expenses.

---

## **2. Health Fund**

### **Purpose**

To calculate the shortfall in medical coverage for hospitalization, critical illness, and accidents. For this computation considering rising medical expenses in 2026, the desired Hospital Income Benefit (HIB), Critical Illness Benefit (CIB) and Accidental Death Benefit (ADB) riders should be at the very least 2,000,000 pesos. 

---

### Required Inputs: 
- Desired Coverage for HIB, CIB and ADB
- Existing Coverage for HIB, CIB and ADB

### **Formula**

1. **Hospital Income Benefit (HIB) Shortfall:**  
    `HIB Shortfall = Desired Coverage − Existing Coverage`
    
2. **Critical Illness Benefit (CIB) Shortfall:**  
    `CIB Shortfall = Desired Coverage − Existing Coverage`
    
3. **Accidental Death Benefit (ADB) Shortfall:**  
    `ADB Shortfall = Desired Coverage − Existing Coverage`
    
4. **Total Health Target Fund:**  
    `target_fund = HIB + CIB + ADB shortfalls`
    

> **Note:** This determines **how much additional coverage** is required across different health risks to achieve the client’s desired level of protection.

---

## **3. Retirement Fund**

### **Purpose**

To estimate how much a client needs at retirement to sustain their lifestyle, and how much of that amount is still a **shortfall** after accounting for expected retirement benefits or lump-sum pay.  
Typically, the **retirement age** used in computations is **60 or 65**.

---

### Required Inputs: 
- Current Age
- Retirement Age (If not defined compute at age 60 and 65)
- Monthly Expenses 
- Interest Rate or Inflation Rate which you can peg at 4% if undefined
- Expected Retirement Fund (or SSS/GSIS pension) which you can peg at 0 if undefined


### **Formula**

1. **Years to Retirement:**  
    `years_to_retirement = retirement_age − current_age`
    
2. **Future Annual Expenses (adjusted for inflation):**  
    `future_annual_expenses = annual_expenses × (1 + inflation_rate/100) ^ years_to_retirement`
    
3. **Target Retirement Fund:**  
    `target_retirement_fund = future_annual_expenses ÷ (interest_rate/100)`  
    → This **capitalization formula** estimates the lump sum needed to generate the required annual income.
    
4. **Shortfall:**  
    `retirement_shortfall = target_retirement_fund − expected_retirement_pay`
    
5. **Sinking Fund (Alternative Estimate):**  
    `target_sinking_fund = future_annual_expenses × 20`  
    → Represents a 20-year approximation of post-retirement living expenses.
    

---

The initial computation assumes that a lump-sum amount will be invested, and the interest it earns will be sufficient to cover the future annual expenses. This approach is known as **Living on Interest**.

The alternative computation assumes a post-retirement period of 20 years, during which the future annual expenses will be gradually withdrawn from the total retirement fund until it is fully depleted — hence the term **Sinking Fund**.

> **Note:** Both approaches estimate how much capital must be available at retirement to maintain the desired lifestyle after inflation, minus any expected benefits.

---

## **4. Education Fund**

### **Purpose**

To estimate the future cost of college education and determine the total fund required.

---

### Required Inputs: 
- Child's Current Age
- Current Annual Tuition Fee of Chosen University
- Inflation Rate for Tuition Fee Increase which you can peg at 8% if undefined

### **Formula**

1. **Years to College:**  
    `years_to_college = 18 − child_age`
    
2. **Future Tuition Fee per Year (with tuition inflation):**  
    `future_fee_yearN = current_tuition × (1 + tuition_increase_rate/100) ^ (years_to_college + N − 1)`
    
3. **Total Course Cost:**
    
    - **4-year course:** sum of first 4 years
        
    - **5-year course:** sum of all 5 years
        

> **Note:** This formula estimates **the total education fund** needed by the time the child enters college, accounting for annual tuition inflation.

---

## **5. Saving for Life Milestones**

### **Purpose**

To determine how much one must invest now or on a regular basis to reach a specific financial goal (e.g., buying a car, wedding fund, travel).

---

### Required Inputs: 
- Future Value (Goal Amount)
- Rate of Return (Expected Interest Rate)
- Years to Save (Time Horizon)

### **Formula**

1. **One-Time Investment (Lump Sum):**  
    `present_value = future_value ÷ (1 + rate/100) ^ years_to_save`
    
2. **Annual Investment (Regular Savings):**  
    `annual_investment = future_value × (rate / ((1 + rate)^years_to_save − 1))`
    

These formulas show two approaches:

- How much to invest **today** to reach the target fund, or
    
- How much to invest **annually** based on an expected rate of return.
    

---

## **Other Computations**

---

### **1. Net Worth Computation**

**Purpose:**  
To compute a person’s total net worth by subtracting all liabilities from total assets. This provides a snapshot of the client’s overall financial position.

**Required Inputs:**
- Total Assets (Cash, Real Estate, Investments, etc.)
- Total Liabilities (Loans, Debts, Mortgages, etc.)

**Formula:**  
`Net Worth = Total Assets − Total Liabilities`

---

### **2. Net Cash Flow Computation**

**Purpose:**  
To determine a person’s monthly or annual cash flow, tracking the money coming in (income) versus money going out (expenses).

**Required Inputs:**
- Total Income (Salary, Business, Passive Income, etc.)
- Total Expenses (Living Expenses, Taxes, Debt Payments, etc.)

**Formula:**  
`Net Cash Flow = Total Income − Total Expenses`