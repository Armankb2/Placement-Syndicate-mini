import os
import json
from groq import Groq
from dotenv import load_dotenv

# Load environment variables (API Key)
load_dotenv(override=True)

class LLMClient:
    def __init__(self):
        """Initializes the Groq client for Llama 3."""
        self.api_key = os.getenv("GROQ_API_KEY")
        self.model = os.getenv("LLM_MODEL", "llama-3.1-8b-instant")
        
        if not self.api_key or self.api_key == "your_groq_api_key_here":
            print("⚠️ GROQ_API_KEY not found in .env. LLM will be disabled.")
            self.client = None
        else:
            self.client = Groq(api_key=self.api_key)

    def generate_feedback(self, resume_text, matches):
        """Generates intelligent career advice based on resume and matches."""
        if not self.client:
            return "LLM Advisor is offline. Please add your GROQ_API_KEY to the .env file."

        # Simplify match data for the prompt
        match_context = []
        for match in matches:
            doc = match["document"]
            match_context.append({
                "company": doc.get("companyName"),
                "role": doc.get("role"),
                "questions": doc.get("quetions"),
                "tips": doc.get("tips")
            })

        # The Master Prompt for the Career Advisor
        prompt = f"""
        You are a world-class Technical Recruiter and Career Coach at the 'Placement Syndicate'.
        
        USER RESUME (EXTRACTED TEXT):
        ---
        {resume_text[:2000]}
        ---

        SUCCESSFUL INTERVIEW MATCHES FROM OUR DATABASE:
        ---
        {json.dumps(match_context, indent=2)}
        ---

        GOAL:
        Perform a professional gap-analysis. Compare the user's resume against these successful candidates.
        
        INSTRUCTIONS:
        1. Be encouraging but direct.
        2. Format your response into:
           - ### 🚀 Overall Match Assessment (Score out of 100)
           - ### 🔍 Key Gaps (What's missing compared to successful candidates?)
           - ### 💡 Recommended Projects/Skills to Add
           - ### 🎯 Tailored Interview Strategy (Based on the matched questions)
        3. Use professional tone and clear markdown formatting.
        4. Keep it concise (approx 300 words).
        """

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a professional technical recruiter."},
                    {"role": "user", "content": prompt}
                ],
                model=self.model,
                temperature=0.7,
                max_tokens=1024,
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            return f"Error from LLM Advisor: {e}"

if __name__ == "__main__":
    # Test block
    client = LLMClient()
    print(client.generate_feedback("I am a java dev", []))
