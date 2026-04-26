# Placement Syndicate - Benchmark Report
Generated : 2026-04-26 20:17:31
Samples   : 100/endpoint | 500-req load test | 20 DB writes | 50 DB reads

---

## Numbers

| Metric                              | Value                                  |
|-------------------------------------|----------------------------------------|
| Throughput (500 req, 20 workers)    | 583.4 req/sec                          |
| Avg latency under load              | 29.98 ms  (p99: 50.29 ms)     |
| Load test success rate              | 100%                              |
| Authenticated endpoint avg          | 30.58 ms  (GET /api/users/me)      |
| Keycloak JWT token issue time       | 214.5 ms                           |
| AI resume pipeline (end-to-end)     | 5.3s                               |
| NLP top-match relevance score       | 60.5%                             |
| MongoDB read avg  (50 reads)        | 9.56 ms                              |
| MongoDB write avg (20 inserts)      | 39.44 ms                              |
| Services registered in Eureka       | 4                            |

---

## Resume Bullets

* Built a 4-microservice platform (Spring Boot 3 + FastAPI) sustaining 583.4 req/sec
  at 29.98ms avg / p99 50.29ms with 100% success under 500-req concurrent load.

* Secured APIs via Spring Cloud Gateway + Keycloak OAuth2/OIDC; JWT tokens in 214.5ms,
  authenticated endpoints served in 30.58ms avg.

* Built async AI resume pipeline (FastAPI + RabbitMQ + Hybrid NLP + Groq LLM)
  delivering ranked feedback in 5.3s with 60.5% top NLP relevance score.

* Polyglot persistence — MySQL (JPA) + MongoDB — 9.56ms reads / 39.44ms writes,
  auto-discovered across 4 services via Netflix Eureka.
