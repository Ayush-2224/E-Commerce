import os
import pandas as pd
import numpy as np
import joblib
from sentence_transformers import SentenceTransformer
from pymongo import MongoClient

MODEL_DIR = os.path.join(os.path.dirname(__file__), "../models")
os.makedirs(MODEL_DIR, exist_ok=True)

def get_products_df():
    client = MongoClient("mongodb+srv://Ayush2362:0U2rQ3vNdaF6hKIQ@cluster0.2uuts.mongodb.net/X_db?retryWrites=true&w=majority&appName=Cluster0")
    db = client["X_db"]  # CHANGE THIS
    docs = list(db.products.find({}, {
        "_id": 1,
        "title": 1,
        "brand": 1,
        "category": 1,
        "description": 1
    }))
    df = pd.DataFrame(docs)
    df["_id"] = df["_id"].astype(str)

    df["title"] = df["title"].fillna("")
    df["brand"] = df["brand"].fillna("")
    df["category"] = df["category"].fillna("")
    df["description"] = df["description"].apply(lambda desc: " ".join(
        [block.get("text", "") for block in desc]) if isinstance(desc, list) else "")

    return df

def generate_weighted_embeddings(df, model):
    title_emb = model.encode(df["title"].tolist(), show_progress_bar=True)
    brand_emb = model.encode(df["brand"].tolist(), show_progress_bar=True)
    category_emb = model.encode(df["category"].tolist(), show_progress_bar=True)
    desc_emb = model.encode(df["description"].tolist(), show_progress_bar=True)

    final_emb = (
        0.4 * np.array(title_emb) +
        0.3 * np.array(brand_emb) +
        0.1 * np.array(category_emb) +
        0.2 * np.array(desc_emb)
    )
    return final_emb

def main():
    print("📦 Fetching product data...")
    df = get_products_df()
    print("🤖 Loading MiniLM model...")
    model = SentenceTransformer("all-MiniLM-L6-v2")
    print("🔍 Generating embeddings...")
    final_embeddings = generate_weighted_embeddings(df, model)
    print("💾 Saving artifacts...")
    joblib.dump(final_embeddings, os.path.join(MODEL_DIR, "embeddings.pkl"))
    joblib.dump(df["_id"].tolist(), os.path.join(MODEL_DIR, "product_ids.pkl"))
    df[["_id", "category"]].to_csv(os.path.join(MODEL_DIR, "product_data.csv"), index=False)
    print("✅ Embeddings saved.")

if __name__ == "__main__":
    main()
