import os
import pandas as pd
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer

def retrain_model(products):
    df = pd.DataFrame(products)

    df["text"] = (
        df["title"] + " " +
        df["brand"] + " " +
        df["category"] + " " +
        df["description"].apply(lambda desc: " ".join(
            [block.get("text", "") for block in desc]) if desc else "")
    )

    tfidf = TfidfVectorizer(stop_words="english")
    tfidf_matrix = tfidf.fit_transform(df["text"])

    os.makedirs("models", exist_ok=True)
    joblib.dump(tfidf, "models/tfidf_vectorizer.pkl")
    joblib.dump(tfidf_matrix, "models/tfidf_matrix.pkl")
    df[["_id"]].to_csv("models/product_ids.csv", index=False)  # keep as-is ✅

    # ✅ Add this line to support fallback by category
    df[["_id", "category"]].to_csv("models/product_data.csv", index=False)

    print("✅ TF-IDF model retrained and saved.")
