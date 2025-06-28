import os
import pandas as pd
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np

def retrain_model(products):
    """Full model retraining for periodic maintenance"""
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
    df[["_id", "category"]].to_csv("models/product_ids.csv", index=False)

    print("✅ TF-IDF model retrained and saved.")

def add_single_product(product):
    """Add a single product to the existing model without full retraining"""
    try:
        # Load existing resources
        tfidf = joblib.load("models/tfidf_vectorizer.pkl")
        tfidf_matrix = joblib.load("models/tfidf_matrix.pkl")
        df_meta = pd.read_csv("models/product_ids.csv")
        
        # Check if product already exists
        if str(product["_id"]) in df_meta["_id"].astype(str).values:
            print(f"⚠️ Product {product['_id']} already exists in model")
            return False
        
        # Prepare product text
        description_text = ""
        if product.get("description"):
            description_text = " ".join([block.get("text", "") for block in product["description"]])
        
        product_text = (
            product["title"] + " " +
            product["brand"] + " " +
            product["category"] + " " +
            description_text
        )
        
        # Transform the new product text using existing vocabulary
        new_product_vector = tfidf.transform([product_text])
        
        # Append to existing matrix
        new_tfidf_matrix = np.vstack([tfidf_matrix.toarray(), new_product_vector.toarray()])
        
        # Add product metadata
        new_row = pd.DataFrame({
            "_id": [str(product["_id"])],
            "category": [product["category"]]
        })
        df_meta = pd.concat([df_meta, new_row], ignore_index=True)
        
        # Save updated resources
        joblib.dump(new_tfidf_matrix, "models/tfidf_matrix.pkl")
        df_meta.to_csv("models/product_ids.csv", index=False)
        
        print(f"✅ Product {product['_id']} added to model incrementally")
        return True
        
    except Exception as e:
        print(f"❌ Error adding product incrementally: {e}")
        return False
