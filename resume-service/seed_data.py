from pymongo import MongoClient
import time

def seed_data():
    """Populates MongoDB with comprehensive, multi-round sample interview experiences for testing."""
    client = MongoClient("mongodb://localhost:27017")
    db = client["experiencedb"]
    collection = db["experience"]

    # This metadata is CRITICAL for Spring Data MongoDB to map the documents back to Java objects
    JAVA_CLASS_META = "com.mini.experience_service.Model.Experience"
    ROUND_CLASS_META = "com.mini.experience_service.Model.Round"

    samples = [
        {
            "_class": JAVA_CLASS_META,
            "companyName": "Google",
            "role": "Software Engineer (Backend) L4",
            "year": 2024,
            "createdBy": "Admin",
            "difficultyLevel": "HARD",
            "quetions": "1. Implement a distributed rate limiter. 2. Graph traversal algorithm to find the shortest path in a weighted grid with obstacles. 3. System design of Google Drive. 4. Behavioral: Tell me about a time you missed a deadline and how you handled it.",
            "tips": "Google focuses heavily on LeetCode Medium/Hard for coding rounds, especially Dynamic Programming, Graphs, and Trees. For system design, ensure you understand consistent hashing, distributed file systems, and database sharding. Always state time/space complexity without being asked. Be very explicit with your STAR method for the Googlyness round.",
            "rounds": [
                {"roundName": "Phone Screen (Coding)", "description": "45 mins. Asked a sliding window problem (LeetCode Medium) followed by a follow-up asking to optimize space complexity. Passed by writing clean, bug-free Python code and explaining edge cases."},
                {"roundName": "Onsite 1 (Coding)", "description": "45 mins. Focused on Graph algorithms. Was asked to find the number of connected components in a grid, then a follow-up involving shortest path. I used BFS and then Dijkstra's."},
                {"roundName": "Onsite 2 (Coding)", "description": "45 mins. Dynamic programming question similar to 'Word Break'. Struggled a bit initially but the interviewer provided a hint, after which I got the O(N^2) solution."},
                {"roundName": "Onsite 3 (System Design)", "description": "45 mins. Design Google Drive/Dropbox. We spent most of the time discussing chunking files, block storage, and how to handle concurrent edits/syncing conflicts."},
                {"roundName": "Onsite 4 (Googlyness & Leadership)", "description": "45 mins. Standard behavioral round. Questions on resolving conflicts with team members, handling constructive feedback, and mentoring juniors."}
            ]
        },
        {
            "_class": JAVA_CLASS_META,
            "companyName": "Amazon",
            "role": "SDE-II",
            "year": 2024,
            "createdBy": "Admin",
            "difficultyLevel": "MEDIUM",
            "quetions": "1. Design Amazon's checkout service. 2. Implement an LRU Cache. 3. Behavioral: Tell me about a time you disagreed with your manager. 4. Behavioral: Tell me about a time you dove deep into a complex problem.",
            "tips": "Amazon is all about the 16 Leadership Principles (LPs). Every single round has 15-20 minutes dedicated to behavioral questions based on LPs. Have at least 6-8 distinct stories prepared using the STAR format. For coding, focus on object-oriented design and standard data structures like Heaps, HashMaps, and Linked Lists.",
            "rounds": [
                {"roundName": "Online Assessment (OA)", "description": "90 mins. Two coding questions on HackerRank. One was related to sliding window, the other was a heap problem (Top K frequent elements). Passed all test cases."},
                {"roundName": "Phone Interview", "description": "60 mins. First 20 mins: 2 LP questions (Customer Obsession, Invent and Simplify). Last 40 mins: Coding question involving a Binary Search Tree traversal."},
                {"roundName": "Virtual Onsite - Round 1", "description": "60 mins. System Design. Design a scalable URL shortener. Focused a lot on database choices and partitioning."},
                {"roundName": "Virtual Onsite - Round 2", "description": "60 mins. Object-Oriented Design. Design a parking lot system. Had to write working code for the classes and interfaces."},
                {"roundName": "Virtual Onsite - Bar Raiser", "description": "60 mins. Very intense behavioral questions focusing on 'Deliver Results' and 'Have Backbone; Disagree and Commit'. The interviewer probed very deeply into my stories."}
            ]
        },
        {
            "_class": JAVA_CLASS_META,
            "companyName": "Meta",
            "role": "Frontend Developer (E4)",
            "year": 2023,
            "createdBy": "Admin",
            "difficultyLevel": "HARD",
            "quetions": "1. Build a nested comment system in React. 2. Flatten a deeply nested JavaScript object. 3. Write a polyfill for Promise.all(). 4. Describe a conflict you had with a designer.",
            "tips": "Meta expects extreme speed and accuracy in their coding rounds. You need to write bug-free code quickly. For frontend, deeply understand JavaScript core concepts (closures, event loop, prototypes, promises) and React internals (hooks, reconciliation, context). Be prepared to build UI components without any external libraries.",
            "rounds": [
                {"roundName": "Initial Screen", "description": "45 mins. Two quick JS coding questions. One on array manipulation (similar to Array.prototype.reduce) and another on DOM traversal."},
                {"roundName": "Onsite - Coding 1", "description": "45 mins. React focused. Asked to build an autocomplete component from scratch, handling debouncing, race conditions, and keyboard navigation."},
                {"roundName": "Onsite - Coding 2", "description": "45 mins. Vanilla JS focused. Asked to implement a custom event emitter and a deep clone function handling circular references."},
                {"roundName": "Onsite - System Design (Frontend)", "description": "45 mins. Design the Facebook News Feed frontend. Discussed state management, infinite scrolling, pagination, image lazy loading, and performance profiling."},
                {"roundName": "Onsite - Behavioral", "description": "45 mins. Discussed past projects, dealing with ambiguous requirements, and how I collaborate with backend teams and designers."}
            ]
        },
        {
            "_class": JAVA_CLASS_META,
            "companyName": "Microsoft",
            "role": "Software Engineer II",
            "year": 2024,
            "createdBy": "Admin",
            "difficultyLevel": "MEDIUM",
            "quetions": "1. Design a real-time collaborative text editor. 2. Detect a cycle in a directed graph. 3. Merge K sorted lists. 4. Behavioral: How do you handle changing requirements?",
            "tips": "Microsoft interviews are very team-dependent, but generally focus on clean, production-ready code. Write tests for your code during the interview! They appreciate candidates who think out loud and discuss edge cases before writing code. Familiarity with Azure concepts helps but isn't strictly required.",
            "rounds": [
                {"roundName": "First Round", "description": "45 mins. Basic algorithm question (Merge Intervals) on Codility. Discussed time complexity and space optimizations."},
                {"roundName": "Onsite 1 (Coding)", "description": "1 hour. Linked List question (Reverse nodes in k-group). Wrote code, dry ran it with a complex example, and wrote unit tests."},
                {"roundName": "Onsite 2 (System Design)", "description": "1 hour. Design a distributed cache. Discussed cache eviction policies, consistent hashing, and how to handle hot keys."},
                {"roundName": "Onsite 3 (Hiring Manager / Behavioral)", "description": "1 hour. Deep dive into my resume. Asked about architectural decisions I made in previous roles, how I handle technical debt, and mentorship."}
            ]
        },
        {
            "_class": JAVA_CLASS_META,
            "companyName": "Netflix",
            "role": "Senior Software Engineer",
            "year": 2023,
            "createdBy": "Admin",
            "difficultyLevel": "HARD",
            "quetions": "1. Design a globally distributed video streaming architecture. 2. How do you handle CDN failures? 3. Behavioral: Describe a time you took a calculated risk and failed. 4. Behavioral: How do you handle 'Freedom and Responsibility'?",
            "tips": "Netflix interviews are incredibly intense on culture fit. Read the Netflix Culture Deck multiple times. They don't typically ask standard LeetCode algorithm questions; instead, they focus on practical, real-world engineering problems and deep system architecture. Be highly opinionated but open to debate.",
            "rounds": [
                {"roundName": "Recruiter Screen", "description": "30 mins. Assessing basic culture fit and compensation expectations. Very direct conversation."},
                {"roundName": "Technical Screen", "description": "60 mins. High-level architecture discussion. Not a whiteboard coding round, but a deep dive into microservices, gRPC, and Kafka."},
                {"roundName": "Onsite - Architecture", "description": "90 mins. Design a service to track movie view counts globally with sub-second latency. We debated Cassandra vs DynamoDB heavily."},
                {"roundName": "Onsite - Problem Solving", "description": "60 mins. Given a buggy piece of open-source code, find the bug, explain why it happens (race condition), and fix it."},
                {"roundName": "Onsite - Culture 1", "description": "60 mins. Pure behavioral round with a Director. Focused on extreme ownership, radical candor, and giving/receiving feedback."},
                {"roundName": "Onsite - Culture 2", "description": "60 mins. Another behavioral round with HR/Engineering leaders. Focused on past failures and learning."}
            ]
        },
        {
            "_class": JAVA_CLASS_META,
            "companyName": "Uber",
            "role": "Backend Engineer",
            "year": 2024,
            "createdBy": "Admin",
            "difficultyLevel": "HARD",
            "quetions": "1. Design the Uber driver dispatch system. 2. Implement a concurrent rate limiter in Go. 3. Find the longest palindromic substring. 4. Behavioral: How do you prioritize tasks under tight deadlines?",
            "tips": "Uber emphasizes scalable, distributed systems and high concurrency. For backend, strong knowledge of Go or Java concurrency is essential. In system design, you must understand geospatial indexing (e.g., S2 geometry, Geohash) and how to handle massive throughput and pub/sub systems.",
            "rounds": [
                {"roundName": "CodeSignal OA", "description": "70 mins. 4 questions. Very challenging. Included a 2D matrix problem and a complex string manipulation task."},
                {"roundName": "Technical Screen", "description": "60 mins. Discussed my background, then a coding question on graph BFS (finding shortest path for a driver to a rider)."},
                {"roundName": "Onsite - Architecture", "description": "60 mins. Design the location tracking service for Uber. Discussed WebSockets, UDP vs TCP, and database writes at scale."},
                {"roundName": "Onsite - Machine Coding", "description": "90 mins. Was asked to implement an in-memory cache with TTL and specific eviction policies in my language of choice. Must be thread-safe and compile/run."},
                {"roundName": "Onsite - Deep Dive", "description": "60 mins. Deep dive into my most complex project. Interviewer pushed hard on why I chose specific technologies over alternatives."}
            ]
        },
        {
            "_class": JAVA_CLASS_META,
            "companyName": "Airbnb",
            "role": "Full Stack Engineer",
            "year": 2023,
            "createdBy": "Admin",
            "difficultyLevel": "MEDIUM",
            "quetions": "1. Build a simplified Airbnb search filter UI. 2. Design the backend for a calendar booking system. 3. Detect overlapping intervals (bookings). 4. Behavioral: Tell me about a time you helped a teammate succeed.",
            "tips": "Airbnb values candidates who care about user experience, even if interviewing for a backend role. The 'Cross-Functional' and 'Core Values' rounds are very important. They look for empathy, collaboration, and a passion for travel/hospitality. Technical rounds are usually practical and involve pair programming rather than abstract algorithms.",
            "rounds": [
                {"roundName": "Phone Screen", "description": "60 mins. Practical coding on HackerRank. Given a CSV of listing data, parse it, filter it based on certain criteria, and return JSON."},
                {"roundName": "Onsite - Frontend", "description": "60 mins. Pair programming in React. Built a date picker component that handles blackout dates and pricing variations."},
                {"roundName": "Onsite - Backend/Architecture", "description": "60 mins. System design of the booking flow. Discussed handling concurrent bookings for the same listing (pessimistic vs optimistic locking)."},
                {"roundName": "Onsite - Cross-Functional", "description": "60 mins. Interviewed by a product manager and a designer. Discussed product sense, measuring success, and handling trade-offs."},
                {"roundName": "Onsite - Core Values", "description": "60 mins. Behavioral interview focused on Airbnb's core values like 'Be a Cereal Entrepreneur' and 'Embrace the Adventure'."}
            ]
        },
        {
            "_class": JAVA_CLASS_META,
            "companyName": "Apple",
            "role": "Software Engineer (Cloud/Infra)",
            "year": 2024,
            "createdBy": "Admin",
            "difficultyLevel": "HARD",
            "quetions": "1. Design iCloud photo sync. 2. Implement a thread-safe singleton in C++. 3. Explain how TLS 1.3 works. 4. Behavioral: Tell me about a time you had to reverse-engineer a system.",
            "tips": "Apple teams are highly siloed, so the interview process depends heavily on the specific team. For infrastructure, expect deep dives into OS internals, networking protocols (TCP/IP, TLS), and low-level system design. They value people who understand exactly how things work under the hood.",
            "rounds": [
                {"roundName": "Phone Screen 1", "description": "45 mins. Basic OS questions (processes vs threads, virtual memory, paging) and a simple string manipulation coding question."},
                {"roundName": "Phone Screen 2", "description": "60 mins. Networking deep dive. Asked to explain the lifecycle of an HTTP request down to the packet level."},
                {"roundName": "Onsite 1 (Coding)", "description": "60 mins. Implemented a custom memory allocator. Focused heavily on pointer arithmetic and preventing memory leaks."},
                {"roundName": "Onsite 2 (System Design)", "description": "60 mins. Design a distributed object storage system (like Amazon S3 or Apple iCloud). Discussed erasure coding and replication."},
                {"roundName": "Onsite 3 (Domain Knowledge)", "description": "60 mins. Deep dive into Kubernetes and container orchestration, as the team was heavily reliant on it."},
                {"roundName": "Onsite 4 (Manager)", "description": "45 mins. Behavioral round discussing team fit, handling pressure, and secrecy/confidentiality expectations."}
            ]
        },
        {
            "_class": JAVA_CLASS_META,
            "companyName": "Stripe",
            "role": "Backend Engineer",
            "year": 2024,
            "createdBy": "Admin",
            "difficultyLevel": "HARD",
            "quetions": "1. Implement an API rate limiter. 2. Design an idempotent payment processing API. 3. Find a bug in this open-source Ruby codebase. 4. Behavioral: How do you prioritize technical debt vs new features?",
            "tips": "Stripe's interviews are notoriously practical. They rarely ask LeetCode questions. Instead, you'll be debugging real code bases, writing production-ready APIs, and discussing system design with a strong focus on data consistency, idempotency, and financial correctness. Be very familiar with API design principles.",
            "rounds": [
                {"roundName": "Take-Home Assignment", "description": "Took about 4 hours. Write a script to parse a custom log file format, compute aggregates, and output JSON. Graded on code cleanliness, tests, and error handling."},
                {"roundName": "Onsite - Integration", "description": "90 mins. Given a poorly documented, slightly buggy external API, write a client to interact with it, handle pagination, and retry logic gracefully."},
                {"roundName": "Onsite - Bug Squash", "description": "60 mins. Given a local repo for a web server with a known bug. Had to read the code, reproduce the bug, write a failing test, and fix it."},
                {"roundName": "Onsite - System Design", "description": "60 mins. Design a ledger system for tracking user balances. Emphasized double-entry accounting, database transactions, and exactly-once processing."},
                {"roundName": "Onsite - Behavioral", "description": "45 mins. Standard behavioral questions but focused on engineering rigor and operating with high agency."}
            ]
        },
        {
            "_class": JAVA_CLASS_META,
            "companyName": "LinkedIn",
            "role": "Data Engineer",
            "year": 2023,
            "createdBy": "Admin",
            "difficultyLevel": "MEDIUM",
            "quetions": "1. Design the 'People You May Know' recommendation pipeline. 2. Write an optimized SQL query for finding top K rolling averages. 3. How does Kafka replication work? 4. Behavioral: Describe a time you dealt with a massive data outage.",
            "tips": "LinkedIn is the birthplace of Kafka, so expect heavy questions on streaming architectures, message queues, and big data processing. Strong SQL and Python/Java skills are required. For system design, understand the trade-offs between batch and stream processing.",
            "rounds": [
                {"roundName": "Phone Screen", "description": "45 mins. Two SQL questions involving window functions and a basic Python coding question on dictionary manipulation."},
                {"roundName": "Onsite 1 (Coding)", "description": "60 mins. Data structures round. Implement a hash map from scratch and discuss collision resolution strategies."},
                {"roundName": "Onsite 2 (Data Modeling)", "description": "60 mins. Design the database schema for LinkedIn posts and comments. Discussed normalization vs denormalization."},
                {"roundName": "Onsite 3 (System Design)", "description": "60 mins. Design an analytics pipeline to track job post views in real-time. Discussed Kafka, Flink, and Druid/Pinot."},
                {"roundName": "Onsite 4 (Hiring Manager)", "description": "45 mins. Discussed my previous data projects, data quality testing, and career aspirations."}
            ]
        },
        {
            "_class": JAVA_CLASS_META,
            "companyName": "Databricks",
            "role": "Software Engineer (Platform)",
            "year": 2024,
            "createdBy": "Admin",
            "difficultyLevel": "HARD",
            "quetions": "1. Implement a lock-free queue. 2. Design a distributed task scheduler (like Celery/Airflow). 3. Explain how Spark handles shuffled data. 4. Behavioral: How do you approach debugging distributed systems?",
            "tips": "Extremely high bar for system design and concurrent programming. You need a very strong grasp of operating systems, multithreading, and distributed systems consensus protocols (Paxos, Raft). The interviewers are brilliant and will probe deeply into your technical choices.",
            "rounds": [
                {"roundName": "Technical Screen", "description": "60 mins. Concurrency focused coding question. Implemented a read-write lock from scratch using primitives."},
                {"roundName": "Onsite - Coding 1", "description": "60 mins. Advanced algorithms. Segment tree problem regarding range queries on an array."},
                {"roundName": "Onsite - Coding 2", "description": "60 mins. Practical coding. Parse a custom binary format and aggregate the data efficiently."},
                {"roundName": "Onsite - System Architecture", "description": "60 mins. Design a highly available, multi-tenant control plane for launching Spark clusters. Deep dive into state management and failure recovery."},
                {"roundName": "Onsite - Values/Behavioral", "description": "45 mins. Discussed customer obsession, technical truth, and handling disagreements with senior engineers."}
            ]
        },
        {
            "_class": JAVA_CLASS_META,
            "companyName": "Snowflake",
            "role": "Database Engineer",
            "year": 2024,
            "createdBy": "Admin",
            "difficultyLevel": "HARD",
            "quetions": "1. Implement a B-Tree structure. 2. How does columnar storage improve query performance? 3. Explain vectorization in database execution engines. 4. Behavioral: Tell me about a time you optimized a system for extreme performance.",
            "tips": "You must deeply understand database internals. Read papers on modern data warehouses (like the Snowflake paper). Understand columnar formats (Parquet), SIMD instructions, query optimization, and cost-based routing. C++ or Rust proficiency is highly valued.",
            "rounds": [
                {"roundName": "Phone Screen", "description": "60 mins. C++ coding question focusing on pointers, memory management, and cache locality."},
                {"roundName": "Onsite - DB Internals", "description": "60 mins. Deep dive into how database engines execute joins (Hash Join vs Sort-Merge Join) and how memory is allocated during execution."},
                {"roundName": "Onsite - Coding", "description": "60 mins. Implement a specialized trie data structure for fast prefix matching over strings."},
                {"roundName": "Onsite - System Design", "description": "60 mins. Design a distributed metadata store for a cloud data warehouse. Discussed FoundationDB and transaction isolation levels."},
                {"roundName": "Onsite - Behavioral", "description": "45 mins. Focused on teamwork, taking ownership of massive projects, and attention to detail."}
            ]
        },
        {
            "_class": JAVA_CLASS_META,
            "companyName": "Atlassian",
            "role": "Backend Engineer",
            "year": 2023,
            "createdBy": "Admin",
            "difficultyLevel": "MEDIUM",
            "quetions": "1. Design Jira's issue tracking backend. 2. Implement a rate limiter. 3. Code a simplified version of a JSON parser. 4. Behavioral: Tell me about a time you showed 'Open company, no bullshit'.",
            "tips": "Atlassian's interview process is very well structured. The System Design round usually focuses on designing a component of one of their products (Jira, Confluence, Trello). The 'Values Fit' round is critical; ensure you know their core values and have stories that map to them.",
            "rounds": [
                {"roundName": "HackerRank OA", "description": "90 mins. Three questions. Mostly medium difficulty algorithms (Maps, Arrays, Strings)."},
                {"roundName": "Onsite - Data Structures", "description": "60 mins. A practical coding question involving tree traversal to compute permissions for users in a hierarchy."},
                {"roundName": "Onsite - System Design", "description": "60 mins. Design the notification system for Jira. Focused heavily on deduplication and delivery guarantees."},
                {"roundName": "Onsite - Code Review", "description": "60 mins. Given a pull request with messy code. Had to leave comments, identify security flaws, and suggest refactoring."},
                {"roundName": "Onsite - Values Fit", "description": "60 mins. Behavioral interview focused heavily on Atlassian's values. Very conversational and relaxed."}
            ]
        },
         {
            "_class": JAVA_CLASS_META,
            "companyName": "ByteDance (TikTok)",
            "role": "Software Engineer",
            "year": 2024,
            "createdBy": "Admin",
            "difficultyLevel": "HARD",
            "quetions": "1. Design the TikTok video recommendation feed. 2. Hard LeetCode on Dynamic Programming (Edit Distance). 3. Hard LeetCode on Graphs (Word Ladder). 4. Behavioral: Why ByteDance?",
            "tips": "ByteDance expects extremely fast coding. They often ask 2 Hard LeetCode questions in a 45-minute round. You need to be a competitive programming expert. System design focuses on massive scale, low latency, and handling viral bursts of traffic.",
            "rounds": [
                {"roundName": "Phone Screen", "description": "45 mins. Two LeetCode Mediums. Solved both in 30 mins, interviewer asked a follow-up optimization for the second one."},
                {"roundName": "Onsite 1 (Coding)", "description": "45 mins. Heavy DP question. Took 25 mins to solve. Second question was a Tree serialization problem."},
                {"roundName": "Onsite 2 (Coding)", "description": "45 mins. Graph problem (Alien Dictionary). Solved using Topological Sort."},
                {"roundName": "Onsite 3 (System Design)", "description": "60 mins. Design the backend for TikTok live streaming comments. Discussed WebSockets, Redis pub/sub, and dropping messages under high load."},
                {"roundName": "Onsite 4 (HR/Manager)", "description": "45 mins. Behavioral round discussing work ethic, handling high-pressure environments, and previous project impact."}
            ]
        },
        {
            "_class": JAVA_CLASS_META,
            "companyName": "Palantir",
            "role": "Forward Deployed Software Engineer (FDSE)",
            "year": 2024,
            "createdBy": "Admin",
            "difficultyLevel": "HARD",
            "quetions": "1. Parse a large, messy CSV of flight data and find anomalies. 2. Graph traversal to find connections between suspicious bank accounts. 3. System Design: Design a secure data pipeline for government data. 4. Behavioral: How do you handle a client who disagrees with your technical approach?",
            "tips": "Palantir FDSE interviews test your ability to deal with ambiguity and messy, real-world data. The 'Decomposition' round is unique: they give you an open-ended business problem and see how you break it into technical components. Strong communication skills are just as important as technical skills.",
            "rounds": [
                {"roundName": "Phone Screen", "description": "45 mins. Basic algorithm question, but contextualized within a real-world scenario (finding overlapping meeting times)."},
                {"roundName": "Onsite - Data Coding", "description": "60 mins. Given a raw dataset, had to write Python code (using Pandas/standard library) to clean it, join it with another set, and answer analytical questions."},
                {"roundName": "Onsite - Decomposition", "description": "60 mins. Given a vague prompt: 'Design a system to predict equipment failure in a factory'. Spent the hour breaking down the problem, defining data models, and outlining the pipeline."},
                {"roundName": "Onsite - System Architecture", "description": "60 mins. Design a system to ingest and query massive amounts of sensor data. Focused on security, access controls, and auditing."},
                {"roundName": "Onsite - Behavioral", "description": "45 mins. Deep dive into past client-facing experience, handling difficult stakeholders, and adapting to new environments quickly."}
            ]
        }
    ]

    for sample in samples:
        if "rounds" in sample:
            for r in sample["rounds"]:
                r["_class"] = ROUND_CLASS_META

    print(f"🌱 Seeding MongoDB with {len(samples)} highly detailed, multi-round experiences...")
    collection.delete_many({}) # Clear existing
    collection.insert_many(samples)
    print("✅ Seeding complete! Database: experiencedb, Collection: experience")

if __name__ == "__main__":
    seed_data()
