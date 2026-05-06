from rank_bm25 import BM25Okapi
from sentence_transformers import SentenceTransformer
import numpy as np
import chromadb
from chromadb.utils import embedding_functions
import os

class HybridSearcher:
    def __init__(self, model_name='all-MiniLM-L6-v2', persist_directory="./chroma_db", collection_name="interview_experiences"):
        """Initializes the hybrid search engine with BM25 and a Persistent ChromaDB."""
        # Check if we are in a limited RAM environment
        self.model = SentenceTransformer(model_name)
        self.bm25 = None
        self.documents = []
        self.corpus = []

        # Initialize ChromaDB
        self.chroma_client = chromadb.PersistentClient(path=persist_directory)
        self.embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(model_name=model_name)
        self.collection = self.chroma_client.get_or_create_collection(
            name=collection_name,
            embedding_function=self.embedding_fn
        )

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

        # 1. Fit BM25
        tokenized_corpus = [doc.lower().split() for doc in self.corpus]
        self.bm25 = BM25Okapi(tokenized_corpus)

        # 2. Add to ChromaDB (Persistent)
        existing_ids = set(self.collection.get()["ids"])

        ids_to_add = []
        docs_to_add = []
        metadatas_to_add = []

        for i, doc in enumerate(documents):
            doc_id = str(doc.get("id") or doc.get("_id") or f"doc_{i}")
            if doc_id not in existing_ids:
                ids_to_add.append(doc_id)
                docs_to_add.append(self.corpus[i])
                metadatas_to_add.append({"source": "mongodb", "original_id": doc_id})

        if ids_to_add:
            print(f"  [ChromaDB] Adding {len(ids_to_add)} new experiences to vector store...")
            self.collection.add(
                ids=ids_to_add,
                documents=docs_to_add,
                metadatas=metadatas_to_add
            )

    def search(self, query: str, top_k: int = 3, min_score: float = 0.0,
               bm25_weight: float = 0.5, semantic_weight: float = 0.5):
        """Performs a hybrid search using BM25 and ChromaDB."""
        if not self.documents or not self.bm25:
            return []

        # 1. BM25 Scores
        tokenized_query = query.lower().split()
        bm25_scores = self.bm25.get_scores(tokenized_query)
        bm25_max = np.max(bm25_scores)
        if bm25_max > 0:
            bm25_scores = bm25_scores / bm25_max

        # 2. ChromaDB Semantic Scores
        results_chroma = self.collection.query(
            query_texts=[query],
            n_results=len(self.documents)
        )

        # Map Chroma results back to similarity (1 - distance)
        # Note: ChromaDB distances are often L2 or squared L2, but similarity function helps
        chroma_id_map = {id: 1.0 - dist for id, dist in zip(results_chroma['ids'][0], results_chroma['distances'][0])}

        semantic_scores = []
        for i, doc in enumerate(self.documents):
            doc_id = str(doc.get("id") or doc.get("_id") or f"doc_{i}")
            score = chroma_id_map.get(doc_id, 0.0)
            semantic_scores.append(max(0.0, score))

        semantic_scores = np.array(semantic_scores)

        # 3. Hybrid Score
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