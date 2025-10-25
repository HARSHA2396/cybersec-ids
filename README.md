# cybersec-ids
Full-stack AI-driven Web App Intrusion Detection System (IDS) with React dashboard. Real-time detection of XSS, SQLi, brute force, and more. Includes analytics, IP blocking, CSV export, and a demo vulnerable app for hands-on security testing.

# 🛡️ Web Application Security Monitoring & Intrusion Detection System

A **full-stack next-gen IDS (Intrusion Detection System)** for web applications, featuring live threat detection, analytics, IP blocking, geolocation, and seamless integration with any Node.js/Express web app.

---

## 🚀 Features

- **Real-Time Intrusion Detection:**  
  Detects XSS, SQL Injection, Brute Force, Directory Traversal, Command Injection, and more.

- **Live Dashboard:**  
  Modern React dashboard with real-time threat logs, statistics, analytics, and live updates (Socket.io).

- **IP Blocking:**  
  Automatic and manual blocking/unblocking of attacking IP addresses.

- **Geolocation & Analytics:**  
  Attackers’ locations, top endpoints targeted, attack type breakdown, and rich summary statistics.

- **Demo Vulnerable Web App:**  
  Ships with an intentionally vulnerable app—attack it and see instant IDS protection in action.

- **CSV Export:**  
  Download all security logs for audit or compliance.

---

## 🏗️ Architecture

[Demo Web App] → [IDS API/Backend] → [MongoDB]
↓
[React Real-Time Dashboard]


---

## 🛠️ Setup & Usage

### 1. Clone & Install Dependencies

- git clone <your-repo-url>
- cd cybersec-ids
- cd backend
- npm install
- cd ../frontend
- npm install


### 2. Start IDS Backend

- cd ../backend
- node app.js

- Opens at: `http://localhost:5000`

### 3. Start React Dashboard

- Opens at: `http://localhost:5000`

### 3. Start React Dashboard

cd ../frontend
npm start

- Opens at: `http://localhost:3000`

### 4. (Optional) Start Demo Vulnerable Web App

cd ../backend/demo-app
npm install
node demoApp.js

- App runs at: `http://localhost:3001`

---

## 🧪 How to Demo / Test

1. **Open the dashboard:** [http://localhost:3000](http://localhost:3000)
2. **Attack the demo web app:**
   - _SQL Injection in login:_
     ```
     curl -X POST http://localhost:3001/login -H "Content-Type: application/json" -d '{"username":"admin'' OR ''1''=''1","password":"test"}'
     ```
   - _XSS in comments:_
     ```
     curl -X POST http://localhost:3001/comments -H "Content-Type: application/json" -d '{"comment":"<script>alert(''XSS'')</script>","author":"attacker"}'
     ```
   - _Directory Traversal:_
     ```
     curl "http://localhost:3001/file?path=../../etc/passwd"
     ```
   - _Command Injection:_
     ```
     curl -X POST http://localhost:3001/search -H "Content-Type: application/json" -d '{"query":"test; rm -rf /"}'
     ```
3. **See the attacks INSTANTLY appear in your dashboard!**
4. **Block/unblock IPs, simulate attacks, and export CSV logs.**

---

## ✨ Example IDS Detection Rules

| Type                  | Pattern Example                                   | Severity |
|-----------------------|---------------------------------------------------|----------|
| XSS (Comments)        | `<script>`, `onerror=`, `javascript:`             | High     |
| SQL Injection (Login) | `'`, `--`, `union select`, `drop`, `insert`       | High     |
| Directory Traversal   | `../`, `%2e%2e`, `/etc/`, `c:\windows`            | High     |
| Command Injection     | `|`, `;`, `&&`, `$()`, `\`backticks\``           | High     |
| Brute Force           | More than 5 failed logins in short period         | Medium   |
| Suspicious User-Agent | sqlmap, burp, nmap, metasploit                    | Medium   |

_Easily add more in `backend/detection/ruleEngine.js`!_

---

## 🌐 Main API Reference

| Endpoint                  | Method | Description                         |
|---------------------------|--------|-------------------------------------|
| `/api/logs`               | GET    | Fetch threat logs                   |
| `/api/logs`               | POST   | Add a new log (auto-IDS analysis)   |
| `/api/logs/stats`         | GET    | Get real-time threat summary        |
| `/api/logs/export/csv`    | GET    | Download all logs as CSV            |
| `/api/blocks`             | GET/POST/DELETE | IP blocklist management   |
| `/api/simulation/run`     | POST   | Built-in attack demo/simulation     |

---

## 🤝 Integration

- Add the provided `idsLogger` middleware to **any Express app**.
- Or: `POST` incident logs or suspicious events to `/api/logs` from any system.
- Monitor real application/system logs with a small node script or via API.

---

## 🏆 Standout Qualities

- **Production-grade detection**: Not just logging, but actual prevention, blocking, and threat analytics.
- **Real-time results:** See dashboard update immediately when demo app is attacked.
- **End-to-end:** Demo app, IDS system, and dashboard—all in one.
- **Easy to extend:** New detection rules, ML models, or API integrations possible.
- **Professional reporting:** Download attack logs for security audits.

---

## 👨‍💻 Author

Harsha Vardhan Tagirisa  
_Based on best practices in full-stack and application security._

---

## 📄 License

MIT

---
