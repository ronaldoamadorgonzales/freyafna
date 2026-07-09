---
title: TVM Formulas
tags: [sunlife, formula]
---

# Time Value of Money (TVM) Formulas

This reference covers the essential formulas used in TVM calculations, including lump sums, annuities, and derived values like interest rate, periods, and payments. These are the formulas that I use for [[Sun Life]]

---

## Core Formulas

### 1. Future Value of a Lump Sum
**Formula:**  
`FV = PV · (1 + r)^n`  
**Description:**  
Calculates how much a present amount will grow over time with compound interest.

---

### 2. Present Value of a Lump Sum
**Formula:**  
`PV = FV / (1 + r)^n`  
**Description:**  
Determines the current worth of a future amount discounted at a given interest rate.

---

### 3. Future Value of an Ordinary Annuity
**Formula:**  
`FV = PMT · ((1 + r)^n - 1) / r`  
**Description:**  
Projects the total value of recurring payments made at the end of each period.

---

### 4. Present Value of an Ordinary Annuity
**Formula:**  
`PV = PMT · (1 - (1 + r)^-n) / r`  
**Description:**  
Computes the current value of future recurring payments made at the end of each period.

---

### 5. Present Value of an Annuity Due
**Formula:**  
`PV = PMT · (1 - (1 + r)^-n) / r · (1 + r)`  
**Description:**  
Same as ordinary annuity, but payments occur at the beginning of each period.

---

### 6. Future Value of an Annuity Due
**Formula:**  
`FV = PMT · ((1 + r)^n - 1) / r · (1 + r)`  
**Description:**  
Same as ordinary annuity, but payments occur at the beginning of each period.

---

### 7. Solving for Number of Periods
**Formula:**  
`n = log(FV / PV) / log(1 + r)`  
**Description:**  
Solves how many periods are needed to reach a future value from a present value.

---

### 8. Solving for Payment Amount
**Formula:**  
`PMT = PV · r / [1 - (1 + r)^-n]`  
**Description:**  
Calculates the recurring payment needed to reach a future goal or repay a loan.

---

### 9. Solving for Interest Rate
**Formula:**  
Iterative or calculator-based  
**Description:**  
Finds the rate that balances PV and FV over a given number of periods.

---



