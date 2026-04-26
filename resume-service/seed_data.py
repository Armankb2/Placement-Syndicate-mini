from pymongo import MongoClient
import time

def seed_data():
    """Populates MongoDB with sample interview experiences for testing."""
    client = MongoClient("mongodb://localhost:27017")
    db = client["experiencedb"]
    collection = db["experience"]

    # This metadata is CRITICAL for Spring Data MongoDB to map the documents back to Java objects
    JAVA_CLASS_META = "com.mini.experience_service.Model.Experience"

    samples = [
        {
            "_class": JAVA_CLASS_META,
            "companyName": "Google",
            "role": "Software Engineer (Backend)",
            "year": 2024,
            "createdBy": "Admin",
            "rounds": [{"roundName": "Coding", "description": "LeetCode Medium/Hard focused on Graphs and Dynamic Programming."}],
            "quetions": "Explain Big-O complexity. Describe a time you optimized a slow API. How do you handle distributed locking?",
            "tips": "Focus on scalability and system design. Google loves deep understanding of data structures.",
            "difficultyLevel": "HARD"
        },
        {
            "_class": JAVA_CLASS_META,
            "companyName": "Amazon",
            "role": "SDE-II",
            "year": 2023,
            "createdBy": "Admin",
            "rounds": [{"roundName": "Leadership Principles", "description": "Deep dive into Amazon's 14 LPs."}],
            "quetions": "Tell me about a time you disagreed with your manager. Describe a situation where you dove deep into a problem.",
            "tips": "Memorize the Leadership Principles! Use the STAR method for every answer.",
            "difficultyLevel": "MEDIUM"
        },
        {
            "_class": JAVA_CLASS_META,
            "companyName": "Meta",
            "role": "Frontend Developer",
            "year": 2024,
            "createdBy": "Admin",
            "rounds": [{"roundName": "UI Logic", "description": "Build a nested comment system in React."}],
            "quetions": "How does React Fiber work? Explain memoization. What are the trade-offs of using Redux?",
            "tips": "Strong hold on React performance and CSS layouts is mandatory.",
            "difficultyLevel": "HARD"
        }
    ]

    print("🌱 Seeding MongoDB with Spring-compatible experiences...")
    collection.delete_many({}) # Clear existing
    collection.insert_many(samples)
    print("✅ Seeding complete! Database: experiencedb, Collection: experience")

if __name__ == "__main__":
    seed_data()
