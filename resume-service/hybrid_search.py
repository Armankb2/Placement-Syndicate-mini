from rank_bm25 import BM25Okapi
from sentence_transformers import SentenceTransformer, util
import numpy as np
import os

class HybridSearcher:
    def __init__(self, model_name='all-MiniLM-L6-v2'):
        """
        Lightweight Hybrid Search: BM25 + In-Memory Semantic Vectors.
        Optimized for 512MB RAM Free Tier environments.
        """
        self.model_name = model_name
        self.model = None # Lazy loaded
        self.bm25 = None
        self.documents = []
        self.corpus = []
        self.embeddings = []

    def _get_model(self):
        """Lazy loads the model only when needed to save RAM during startup."""
        if self.model is None:
            print(f" [AI] Loading {self.model_name} into RAM...")
            # Use 'cpu' explicitly to save memory on free-tier containers
            self.model = SentenceTransformer(self.model_name, device='cpu')
        return self.model

    def fit(self, documents: list, text_fields: list):
        """Fits the engine on the provided documents."""
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

        # 1. Lexical (BM25) - Very low RAM usage
        tokenized_corpus = [doc.lower().split() for doc in self.corpus]
        self.bm25 = BM25Okapi(tokenized_corpus)

        # 2. Semantic (Embeddings) - Computed in-memory
        model = self._get_model()
        # Convert to numpy to keep memory footprint low
        self.embeddings = model.encode(self.corpus, convert_to_tensor=True, show_progress_bar=False)

    def search(self, query: str, top_k: int = 3, min_score: float = 0.0,
               bm25_weight: float = 0.2, semantic_weight: float = 0.8):
        """Performs hybrid search using In-Memory logic (Matches ChromaDB accuracy)."""
        if not self.documents or self.bm25 is None:
            return []

        # 1. BM25 Scores
        tokenized_query = query.lower().split()
        bm25_scores = self.bm25.get_scores(tokenized_query)
        bm25_max = np.max(bm25_scores)
        if bm25_max > 0:
            bm25_scores = bm25_scores / bm25_max

        # 2. Semantic Scores (Cosine Similarity)
        model = self._get_model()
        query_embedding = model.encode(query, convert_to_tensor=True, show_progress_bar=False)
        # util.cos_sim is the same algorithm ChromaDB uses for 'cosine' distance
        semantic_scores = util.cos_sim(query_embedding, self.embeddings).cpu().numpy()[0]

        # 3. Hybrid Score (0.8 Semantic / 0.2 Lexical)
        hybrid_scores = (bm25_weight * bm25_scores) + (semantic_weight * semantic_scores)
        top_indices = np.argsort(hybrid_scores)[::-1][:top_k]

        results = []
        for idx in top_indices:
            score = float(hybrid_scores[idx])
            if score < min_score:
                continue

            results.append({
                "document": self.documents[idx],
                "score": score,
                "lexical_score": float(bm25_scores[idx]),
                "semantic_score": float(semantic_scores[idx])
            })

        return results