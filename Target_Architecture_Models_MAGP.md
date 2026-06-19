# Target Application and Technology Architecture Models
## Maliba AI Governance Platform (MAGP)

---

## 1. Document Overview

This document defines the **Target Application Architecture Model** and **Target Technology Architecture Model** for the Maliba AI Governance Platform (MAGP). The models are described using **ArchiMate 3.2** terminology and concepts to provide an end-to-end, enterprise-level view of the system.

---

## 2. Target Application Architecture Model

The Application Architecture models the software applications, their interactions, and the data they manage.

### 2.1 ArchiMate Application Concepts

| ArchiMate Concept | Elements in MAGP | Description |
| :--- | :--- | :--- |
| **Application Component** | • React SPA (Frontend)<br>• FastAPI Server (Backend) | Encapsulates application functionality and data. |
| **Application Interface** | • RESTful API (HTTPS)<br>• Vendor Portal UI<br>• Ministry Dashboard UI | The point of access where application services are made available to users or other applications. |
| **Application Service** | • Submission Service<br>• Bias Check Service<br>• Policy Evaluator Service<br>• Audit Log Service<br>• Authentication Service | An externally visible unit of functionality provided by one or more components. |
| **Application Function** | • Form Data Validation<br>• AI Model Output Analysis<br>• Rule-based Policy Checking<br>• Hash-chaining | Internal behavior performed by an Application Component. |
| **Data Object** | • User Profile<br>• AI System Record<br>• Bias Check Result<br>• Policy Evaluation Result<br>• Audit Log Entry<br>• Legal Document (CBA/SCC) | Data structured for automated processing. |

### 2.2 Application Architecture Viewpoint

```mermaid
flowchart TD
    %% Styling based on ArchiMate Application Layer (Light Blue)
    classDef appComponent fill:#b5ffff,stroke:#000,stroke-width:1px
    classDef appInterface fill:#b5ffff,stroke:#000,stroke-width:1px,rx:15,ry:15
    classDef appService fill:#b5ffff,stroke:#000,stroke-width:1px,rx:15,ry:15
    classDef dataObject fill:#b5ffff,stroke:#000,stroke-width:1px

    subgraph UserInterfaces [Application Interfaces]
        UI1([Vendor Portal UI]):::appInterface
        UI2([Ministry Dashboard UI]):::appInterface
        UI3([Registry Viewer UI]):::appInterface
    end

    subgraph AppComponents [Application Components]
        SPA[<<Application Component>>\nReact Single Page App]:::appComponent
        FastAPI[<<Application Component>>\nFastAPI Application Server]:::appComponent
    end

    subgraph AppServices [Application Services]
        S1([Submission Service]):::appService
        S2([Bias Check Service]):::appService
        S3([Policy Evaluator Service]):::appService
        S4([Audit Log Service]):::appService
        S5([Authentication Service]):::appService
    end

    subgraph DataObjects [Data Objects]
        D1[User Profile]:::dataObject
        D2[AI System Record]:::dataObject
        D3[Bias Check Result]:::dataObject
        D4[Policy Evaluation Result]:::dataObject
        D5[Audit Log Entry]:::dataObject
    end

    API([REST API Interface]):::appInterface

    %% Relationships
    UserInterfaces -->|Serves| SPA
    SPA -->|Accesses| API
    API -->|Exposes| FastAPI
    
    FastAPI -->|Realizes| S1
    FastAPI -->|Realizes| S2
    FastAPI -->|Realizes| S3
    FastAPI -->|Realizes| S4
    FastAPI -->|Realizes| S5

    S1 -->|Accesses| D2
    S2 -->|Accesses| D3
    S3 -->|Accesses| D4
    S4 -->|Accesses| D5
    S5 -->|Accesses| D1
```

---

## 3. Target Technology Architecture Model

The Technology Architecture models the software and hardware infrastructure required to support the Application Layer.

### 3.1 ArchiMate Technology Concepts

| ArchiMate Concept | Elements in MAGP | Description |
| :--- | :--- | :--- |
| **Node** | • Deployment Server<br>• Client Device | A computational or physical resource that hosts, manipulates, or interacts with other computational or physical resources. |
| **Device** | • Server Hardware (VM/Bare Metal)<br>• Desktop/Laptop/Mobile | A physical IT resource upon which system software and artifacts may be stored or deployed. |
| **System Software** | • Linux OS (Ubuntu)<br>• Nginx (Reverse Proxy)<br>• Uvicorn (ASGI Server)<br>• SQLite 3 (DBMS)<br>• Web Browser | Software environment for specific types of components and data objects. |
| **Technology Interface** | • Port 443 (HTTPS)<br>• File System I/O | Point of access where technology services are offered. |
| **Artifact** | • React Build Bundle (JS/CSS/HTML)<br>• Python Codebase (`.py` files)<br>• SQLite File (`magp.db`)<br>• `maliba_proxy_dataset.csv` | A piece of data that is used or produced in a software development process, or by deployment and operation of a system. |
| **Communication Network** | • The Internet<br>• Internal LAN / Localhost | A set of structures that connects computer systems or other electronic devices for transmission of data. |

### 3.2 Technology Architecture Viewpoint

```mermaid
flowchart TD
    %% Styling based on ArchiMate Technology Layer (Light Green)
    classDef techNode fill:#c9e7b7,stroke:#000,stroke-width:1px
    classDef techDevice fill:#c9e7b7,stroke:#000,stroke-width:1px
    classDef sysSoftware fill:#c9e7b7,stroke:#000,stroke-width:1px
    classDef artifact fill:#c9e7b7,stroke:#000,stroke-width:1px
    classDef network fill:#c9e7b7,stroke:#000,stroke-width:1px,stroke-dasharray: 5 5

    subgraph ClientEnv [Client Environment Node]
        CD[<<Device>>\nClient Desktop/Laptop]:::techDevice
        Browser[<<System Software>>\nWeb Browser]:::sysSoftware
        ReactArt[<<Artifact>>\nReact Build Bundle]:::artifact
        
        CD --- Browser
        Browser -->|Hosts| ReactArt
    end

    Net[<<Communication Network>>\nThe Internet / HTTPS]:::network

    subgraph ServerEnv [Single-Server Deployment Node]
        Host[<<Device>>\nVirtual Machine / Server]:::techDevice
        OS[<<System Software>>\nLinux OS]:::sysSoftware
        Nginx[<<System Software>>\nNginx Reverse Proxy]:::sysSoftware
        
        subgraph AppEnvironment [Application Execution Environment]
            Uvicorn[<<System Software>>\nUvicorn ASGI Server]:::sysSoftware
            PythonArt[<<Artifact>>\nFastAPI Python Codebase]:::artifact
            ProxyData[<<Artifact>>\nmaliba_proxy_dataset.csv]:::artifact
        end
        
        subgraph DataEnvironment [Data Storage Environment]
            SQLiteSW[<<System Software>>\nSQLite 3 DBMS]:::sysSoftware
            DBFile[<<Artifact>>\nmagp.db]:::artifact
            FileStore[<<Artifact>>\nUploaded Documents Storage]:::artifact
        end
        
        Host --- OS
        OS --- Nginx
        OS --- Uvicorn
        OS --- SQLiteSW
        
        Uvicorn -->|Hosts| PythonArt
        PythonArt -->|Reads| ProxyData
        SQLiteSW -->|Manages| DBFile
        
        PythonArt -->|Accesses| SQLiteSW
        PythonArt -->|Reads/Writes| FileStore
    end

    ReactArt -->|Communicates over| Net
    Net -->|Connects to port 443| Nginx
    Nginx -->|Proxies to| Uvicorn
```

---

## 4. Alignment Between Application and Technology Layers

The following demonstrates how the Application Architecture maps onto the Technology Architecture (Cross-Layer Dependencies):

1. **Frontend Hosting**: The **React SPA (Application Component)** is realized by the **React Build Bundle (Artifact)**, which is hosted within the **Web Browser (System Software)** running on the **Client Device (Device)**.
2. **Backend Execution**: The **FastAPI Application Server (Application Component)** and its associated **Application Services** (Submission, Bias Check, Policy, Audit, Auth) are realized by the **FastAPI Python Codebase (Artifact)**. This artifact is executed by **Uvicorn (System Software)** on the **Deployment Server (Node)**.
3. **Data Persistence**: The **Data Objects** (Submissions, Results, Audit Logs) are realized by the **magp.db (Artifact)**, which is managed by **SQLite 3 (System Software)**. 
4. **Proxy Dataset**: The **Bias Check Service (Application Service)** accesses the **maliba_proxy_dataset.csv (Artifact)** directly from the file system to execute algorithmic fairness tests.
5. **Secure Communication**: The **REST API (Application Interface)** is realized by the **HTTPS Connection** over **The Internet (Communication Network)**, securely terminated by **Nginx (System Software)**.

---

## 5. Summary of Architecture Decisions

* **Monolithic Single-Server Architecture**: Aligns with LMIC context constraints (low infrastructure overhead). The entire Application and Technology stack resides on a single Node.
* **Embedded Database**: SQLite represents a lightweight System Software choice that avoids the need for dedicated DBMS nodes, fitting perfectly into the single-node deployment target.
* **Decoupled Client-Server**: React SPA strictly consumes a standard REST API, ensuring that future integration points (e.g., mobile apps) can utilize the same underlying Application Services.
* **Immutable Storage via Application Logic**: The Audit Log Service guarantees immutability through hash-chaining at the Application Layer rather than relying on complex Distributed Ledger Technology (DLT) at the Technology Layer.
