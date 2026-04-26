from rank_bm25 import BM25Okapi
from sentence_transformers import SentenceTransformer, util
import numpy as np

class HybridSearcher:
    def __init__(self, model_name='all-MiniLM-L6-v2'):
        """Initializes the hybrid search engine with BM25 and a Sentence Transformer."""
        self.model = SentenceTransformer(model_name)
        self.bm25 = None
        self.corpus = []
        self.embeddings = []
        self.documents = []

    def fit(self, documents: list, text_fields: list):
        """Fits the engine on the provided documents and specific text fields."""
        if not documents:
            return

        self.documents = documents
        self.corpus = [
            " ".join([str(doc.get(field, "")) for field in text_fields])
            for doc in documents
        ]
        
        # Fit BM25
        tokenized_corpus = [doc.lower().split() for doc in self.corpus]
        self.bm25 = BM25Okapi(tokenized_corpus)
        
        # Fit Sentence Transformer
        self.embeddings = self.model.encode(self.corpus, convert_to_tensor=True)

    def search(self, query: str, top_k: int = 3):
        """Performs a hybrid search (BM25 + Semantic) for the given query."""
        if not self.documents:
            return []

        # 1. BM25 Scores (Lexical)
        tokenized_query = query.lower().split()
        bm25_scores = self.bm25.get_scores(tokenized_query)
        # Normalize BM25 scores
        if np.max(bm25_scores) > 0:
            bm25_scores = bm25_scores / np.max(bm25_scores)

        # 2. Semantic Scores (Vector)
        query_embedding = self.model.encode(query, convert_to_tensor=True)
        semantic_scores = util.cos_sim(query_embedding, self.embeddings).cpu().numpy()[0]

        # 3. Hybrid Score (Weighted Sum - 50/50 for now)
        hybrid_scores = (0.5 * bm25_scores) + (0.5 * semantic_scores)
        
        # Sort and return top_k
        top_indices = np.argsort(hybrid_scores)[::-1][:top_k]
        
        results = []
        for idx in top_indices:
            results.append({
                "document": self.documents[idx],
                "score": float(hybrid_scores[idx]),
                "lexical_score": float(bm25_scores[idx]),
                "semantic_score": float(semantic_scores[idx])
            })
            
        return results
