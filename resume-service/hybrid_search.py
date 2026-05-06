from rank_bm25 import BM25Okapi


class HybridSearcher:
    def __init__(self):
        self.bm25 = None
        self.documents = []
        self.corpus = []

    def fit(self, documents: list, text_fields: list):
        if not documents:
            return

        def extract_text(val):
            if isinstance(val, list):
                parts = []

                for item in val:
                    if isinstance(item, dict):
                        parts.extend(
                            [str(v) for k, v in item.items() if k != "_class"]
                        )
                    else:
                        parts.append(str(item))

                return " ".join(parts)

            return str(val)

        self.documents = documents

        self.corpus = [
            " ".join(
                [extract_text(doc.get(field, "")) for field in text_fields]
            )
            for doc in documents
        ]

        tokenized_corpus = [
            doc.lower().split()
            for doc in self.corpus
        ]

        self.bm25 = BM25Okapi(tokenized_corpus)

    def search(
        self,
        query: str,
        top_k: int = 3,
        min_score: float = 0.0,
        bm25_weight: float = 0.5,
        semantic_weight: float = 0.5
    ):
        if not self.documents:
            return []

        tokenized_query = query.lower().split()

        scores = self.bm25.get_scores(tokenized_query)

        ranked = sorted(
            zip(self.documents, scores),
            key=lambda x: x[1],
            reverse=True
        )

        results = []

        for doc, score in ranked[:top_k]:

            if score < min_score:
                continue

            results.append({
                "document": doc,
                "score": float(score),
                "lexical_score": float(score),
                "semantic_score": 0.0
            })

        return results