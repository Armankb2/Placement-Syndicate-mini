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

        def extract_text(val):
            if isinstance(val, list):
                parts = []
                for item in val:
                    if isinstance(item, dict):
                        parts.extend([str(v) for k, v in item.items() if k != "_class"])
                    else:
                        parts.append(str(item))
                return " ".join(parts)
            return str(val)

        self.documents = documents
        self.corpus = [
            " ".join([extract_text(doc.get(field, "")) for field in text_fields])
            for doc in documents
        ]

        # Fit BM25
        tokenized_corpus = [doc.lower().split() for doc in self.corpus]
        self.bm25 = BM25Okapi(tokenized_corpus)

        # Fit Sentence Transformer
        self.embeddings = self.model.encode(self.corpus, convert_to_tensor=True)

    def search(self, query: str, top_k: int = 3, min_score: float = 0.0,
               bm25_weight: float = 0.5, semantic_weight: float = 0.5):
        """
        Performs a hybrid search (BM25 + Semantic) for the given query.

        Args:
            query:          The search query text.
            top_k:          Maximum number of results to return.
            min_score:      Minimum hybrid score threshold (0.0 = no filter).
                            Results below this score are excluded as weak matches.
            bm25_weight:    Weight for the BM25 (keyword) component.
            semantic_weight: Weight for the semantic (vector) component.
        """
        if not self.documents:
            return []

        # 1. BM25 Scores (Lexical / Keyword)
        # Good at catching exact technical terms: "CUDA", "gRPC", "Spring Boot", etc.
        tokenized_query = query.lower().split()
        bm25_scores = self.bm25.get_scores(tokenized_query)
        # Normalize BM25 scores to [0, 1]
        bm25_max = np.max(bm25_scores)
        if bm25_max > 0:
            bm25_scores = bm25_scores / bm25_max

        # 2. Semantic Scores (Vector / Contextual)
        # Good at understanding meaning: "backend dev" ≈ "server-side engineer"
        query_embedding = self.model.encode(query, convert_to_tensor=True)
        semantic_scores = util.cos_sim(query_embedding, self.embeddings).cpu().numpy()[0]

        # 3. Hybrid Score (Weighted Sum)
        # Weights are passed in from the caller (nlp_engine adjusts based on corpus size)
        hybrid_scores = (bm25_weight * bm25_scores) + (semantic_weight * semantic_scores)

        # Sort descending
        top_indices = np.argsort(hybrid_scores)[::-1][:top_k]

        results = []
        for idx in top_indices:
            score = float(hybrid_scores[idx])

            # Apply minimum score threshold — skip weak/irrelevant matches
            if score < min_score:
                continue

            results.append({
                "document": self.documents[idx],
                "score": score,
                "lexical_score": float(bm25_scores[idx]),
                "semantic_score": float(semantic_scores[idx])
            })

        return results
