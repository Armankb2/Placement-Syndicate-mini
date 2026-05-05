import os
import json
from groq import Groq
from dotenv import load_dotenv

# Load environment variables (API Key)
load_dotenv(override=True)

class LLMClient:
    def __init__(self):
        """Initializes the Groq client with the configured model."""
        self.api_key = os.getenv("GROQ_API_KEY")
        self.model = os.getenv("LLM_MODEL", "llama3-70b-8192")

        if not self.api_key or self.api_key == "your_groq_api_key_here":
            print("⚠️ GROQ_API_KEY not found in .env. LLM will be disabled.")
            self.client = None
        else:
            self.client = Groq(api_key=self.api_key)

    def generate_feedback(self, resume_text, matches):
        """
        Generates grounded, factual career advice based on resume and DB matches.
        
        Critical design rule: The LLM must ONLY reference data from the provided
        matches. It must never invent skills, companies, or questions not in the data.
        """
        if not self.client:
            feedback = "### 🤖 Rule-Based Analysis (LLM Offline)\n\n"
            feedback += "You can enable full AI analysis by adding a `GROQ_API_KEY` to your `.env` file. In the meantime, here is a summary based on your top matches:\n\n"
            
            for match in matches:
                doc = match["document"]
                company = doc.get("companyName", "Unknown")
                score = match["score"]
                feedback += f"#### 🎯 {company} (Match Score: {score:.2f})\n"
                
                questions = doc.get("quetions", "Not provided")
                if questions != "Not provided":
                    feedback += f"- **Key Topics to Prepare:** {questions}\n"
                
                tips = doc.get("tips", "Not provided")
                if tips != "Not provided":
                    feedback += f"- **Candidate Tip:** \"{tips}\"\n"
                
                feedback += "\n"
            
            feedback += "### 💡 Preparation Strategy\n"
            feedback += "Based on these matches, you should focus on the common technical topics listed above. Practice explaining your projects in the context of these specific company requirements."
            return feedback

        if not matches:
            return (
                "**No Matching Experiences Found**\n\n"
                "Our database doesn't have enough interview experiences yet that match your profile. "
                "Please check back after more students share their experiences."
            )

        # Build clean match context with only real DB fields
        match_context = []
        for i, match in enumerate(matches, 1):
            doc = match["document"]
            match_context.append({
                "rank": i,
                "company": doc.get("companyName", "Unknown"),
                "role": doc.get("role", "Unknown"),
                "difficulty": str(doc.get("difficultyLevel", "Unknown")),
                "questions_asked": doc.get("quetions", "Not provided"),
                "tips_from_candidate": doc.get("tips", "Not provided"),
                "similarity_score": f"{match['score']:.2f}",
                "semantic_score": f"{match.get('semantic_score', 0):.2f}",
                "keyword_score": f"{match.get('lexical_score', 0):.2f}",
            })

        # The grounded, factual system prompt
        system_prompt = """You are a technical career advisor at 'Placement Syndicate'.

STRICT RULES — VIOLATION IS NOT ACCEPTABLE:
1. You MUST ONLY use the data explicitly provided in the MATCHED EXPERIENCES section.
2. You MUST NEVER invent skills, projects, companies, or questions that are not in the provided data.
3. You MUST NEVER make up statistics, percentages, or claims not derivable from the data.
4. If the resume text is unclear or incomplete, say "Cannot determine from resume provided" — do not guess.
5. If the match data has "Not provided" for a field, do NOT fabricate a replacement — skip that field.
6. Keep advice specific and directly traceable to the provided data."""

        # The user prompt — grounded and structured
        user_prompt = f"""
=== STUDENT RESUME (RAW EXTRACTED TEXT) ===
{resume_text[:2500]}

=== TOP MATCHED INTERVIEW EXPERIENCES FROM DATABASE ===
{json.dumps(match_context, indent=2)}

=== YOUR TASK ===
Perform a gap analysis comparing this specific student's resume against these specific matched experiences.
Base EVERY point you make on the data above. Do not add generic career advice.

FORMAT YOUR RESPONSE AS FOLLOWS:

### 🎯 Match Summary
State which companies/roles matched and their similarity scores (use the scores from the data above).
If the highest similarity_score is below 0.35, add a note: "⚠️ Low confidence match — limited experiences in database."

### 🔍 Skill Gaps (Evidence-Based)
List only gaps you can DIRECTLY identify by comparing the resume text with the questions_asked field.
Format each gap as: "Gap: [specific skill] — Evidence: [company X asked about Y, your resume doesn't mention it]"
If you cannot identify a clear gap from the data, write: "Insufficient data to identify specific gaps."

### 💡 Preparation Recommendations
Based ONLY on the tips_from_candidate field in the matches above.
Quote the actual tips. Do not add external advice.
If tips field says "Not provided", skip this section.

### 🎯 Interview Strategy
Based ONLY on the questions_asked field from the matched companies.
List the actual question topics. Do not invent new questions.

### ⚠️ Confidence Disclaimer
State: "This analysis is based on [N] interview experience(s) in our database matching your profile. 
Similarity score: [highest score]. [If score < 0.35: Results may not be highly accurate due to limited matching data.]"
"""

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                model=self.model,
                temperature=0.2,   # Low temp = factual, deterministic, less hallucination
                max_tokens=900,
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            return f"Error from LLM Advisor: {e}"


if __name__ == "__main__":
    # Test block
    client = LLMClient()
    test_matches = [
        {
            "document": {
                "companyName": "Google",
                "role": "SDE-1",
                "difficultyLevel": "HARD",
                "quetions": "System design, DSA on arrays and graphs, behavioral STAR format",
                "tips": "Practice LeetCode Hard, know your resume projects deeply"
            },
            "score": 0.78,
            "semantic_score": 0.80,
            "lexical_score": 0.76
        }
    ]
    print(client.generate_feedback("I am a Java developer with Spring Boot experience", test_matches))
