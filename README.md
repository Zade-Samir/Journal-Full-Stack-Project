# Journal Application - Full Stack Project

A full-stack, distributed microservices journal application built with Spring Boot, Spring Cloud, React, and MySQL. It features daily logs saving, active goal tracking, emotional baseline analytics, and aggregated reviews.

---

## 🏛️ Microservices Architecture

Below is the high-level architecture diagram showing how the frontend, API Gateway, Eureka discovery server, backing services, and databases interact.

```
       +---------------------------------------------+
       |               React Client                  |
       |                (Vite App)                   |
       +----------------------+----------------------+
                              |
                              | Port 8080 (REST Requests)
                              v
       +---------------------------------------------+
       |                API Gateway                  |
       |            (Spring Cloud Gateway)           |
       +-------+-----------------------------+-------+
               |                             |
               | Fetch Register              |
               v                             |
  +------------+------------+                |
  |     Eureka Server       |                | Forward Route
  |   (Service Registry)    |                | (X-User-Email, X-User-Role)
  |       Port 8761         |                |
  +-------------------------+                |
               +-----------------------------+
               |                             |
               v Port 8082                   v Port 8081
  +------------+------------+    +-----------+------------+
  |       Auth Service      |    |     Journal Service    |
  |  (Spring Boot Security) |    |  (Spring Boot / JPA)   |
  +------------+------------+    +-----------+------------+
               |                             |
               v                             v
  +------------+------------+    +-----------+------------+
  |    JournalAuthDB        |    |       journalDB        |
  |       (MySQL)           |    |        (MySQL)         |
  +-------------------------+    +------------------------+
```

---

## 🛠️ Technology Stack

### Backend Services
- **Java version**: 17
- **Core Framework**: Spring Boot 3.2.5
- **Service Registration & Discovery**: Netflix Eureka Server
- **Routing & Authentication Filter**: Spring Cloud Gateway
- **ORM & Data Persistence**: Spring Data JPA & Hibernate
- **Database**: MySQL (Connector/J)
- **DTO Mappers**: MapStruct 1.5.5
- **Boilerplate Reduction**: Lombok

### Frontend Client
- **Runtime**: React 18 & Vite
- **Styling**: Vanilla CSS & Tailwind CSS
- **Routing**: React Router DOM v6
- **Icons**: Lucide React

---

## 🚀 How to Run the Project

The workspace includes automated startup scripts for both **macOS** (`start.sh`) and **Windows** (`start.bat`) to launch all services sequentially.

### Prerequisites
1. **Java Development Kit (JDK 17)** installed and configured.
2. **Node.js** (v18+) installed.
3. **MySQL Server** running locally on port `3306`.
4. Ensure you have created the schema databases (Hibernate compiles them automatically if `createDatabaseIfNotExist=true` is present in URLs):
   - `journalDB`
   - `JournalAuthDB`

---

### macOS Quick Start
1. Open a terminal and navigate to the project root directory.
2. Make the script executable:
   ```bash
   chmod +x start.sh
   ```
3. Run the script:
   ```bash
   ./start.sh
   ```
   *The script will prompt for your MySQL root password, configure local JWT development secrets, and open individual Terminal windows for each microservice.*

---

### Windows Quick Start
1. Double-click the `start.bat` file in the project root.
2. Enter your MySQL root password when prompted.
   *This starts the Eureka Server, pauses for 12 seconds, then launches the remaining services and the Vite frontend in separate Command Prompt windows.*

---

