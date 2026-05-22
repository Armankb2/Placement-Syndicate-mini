import re
import nltk
from typing import List, Dict, Set

# Lightweight skill database for role-aware matching
SKILL_TAXONOMY = {
    "backend": {
        "Java", "Spring Boot", "Node.js", "Python", "Django", "Flask", "Go", "Microservices", 
        "REST API", "gRPC", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Kafka", "Docker", "Kubernetes"
    },
    "frontend": {
        "React", "Vue", "Angular", "Next.js", "TailwindCSS", "JavaScript", "TypeScript", "HTML", "CSS", "SASS", "Redux"
    },
    "ml_ai": {
        "Python", "PyTorch", "TensorFlow", "Scikit-Learn", "NLP", "Computer Vision", "Statistics", "Machine Learning", "Deep Learning", "Pandas", "NumPy"
    }
}

# Synonym mapping
SYNONYMS = {
    "backend dev": "Backend Developer",
    "backend developer": "Backend Developer",
    "ml": "Machine Learning",
    "ai": "Artificial Intelligence",
    "dsa": "Data Structures and Algorithms",
    "dbms": "Database Management System",
    "rest api": "RESTful API",
    "sql": "SQL Database"
}

class NLPEngine:
    def __init__(self):
        # Basic stop words to avoid noise
        self.stop_words = {"a", "an", "the", "in", "on", "at", "with", "for", "by", "about", "is", "are", "was", "were"}

    def clean_text(self, text: str) -> str:
        """Cleans and normalizes text for better matching."""
        if not text:
            return ""
        text = text.lower()
        # Remove special characters
        text = re.sub(r'[^\w\s]', ' ', text)
        # Normalize whitespace
        text = " ".join(text.split())
        return text

    def extract_skills(self, text: str) -> Set[str]:
        """Simple rule-based skill extraction from cleaned text."""
        cleaned = self.clean_text(text)
        found_skills = set()
        
        # Check against a broad list of technical terms (can be expanded)
        all_tech = set()
        for skills in SKILL_TAXONOMY.values():
            all_tech.update([s.lower() for s in skills])
        
        # Also check synonyms
        for syn, canonical in SYNONYMS.items():
            if syn in cleaned:
                found_skills.add(canonical)

        # Word-based matching
        words = set(cleaned.split())
        for tech in all_tech:
            if tech in cleaned: # handles multi-word skills like "spring boot"
                found_skills.add(tech.title())
                
        return found_skills

    def get_role_relevance(self, resume_skills: Set[str], role: str) -> float:
        """Computes a relevance score based on role-specific skill overlap."""
        role_key = role.lower().replace(" ", "_")
        # Try to match role to taxonomy
        target_role = None
        if "backend" in role_key: target_role = "backend"
        elif "frontend" in role_key: target_role = "frontend"
        elif "ml" in role_key or "data scientist" in role_key: target_role = "ml_ai"
        
        if not target_role:
            return 1.0 # Neutral if role is unknown
            
        required_skills = {s.lower() for s in SKILL_TAXONOMY[target_role]}
        user_skills = {s.lower() for s in resume_skills}
        
        overlap = required_skills.intersection(user_skills)
        if not required_skills: return 1.0
        
        return 1.0 + (len(overlap) / len(required_skills)) # Multiplier between 1.0 and 2.0
