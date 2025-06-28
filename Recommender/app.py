from flask import Flask, jsonify
from sklearn.metrics.pairwise import cosine_similarity
from pymongo import MongoClient
from bson import ObjectId
import joblib, pandas as pd, numpy as np, os
app = Flask(__name__)
MODEL_DIR = "models"

# Load models
embeddings = joblib.load(os.path.join(MODEL_DIR, "embeddings.pkl"))
product_ids = joblib.load(os.path.join(MODEL_DIR, "product_ids.pkl"))
df_meta = pd.read_csv(os.path.join(MODEL_DIR, "product_data.csv"))

client = MongoClient("mongodb+srv://Ayush2362:0U2rQ3vNdaF6hKIQ@cluster0.2uuts.mongodb.net/X_db?retryWrites=true&w=majority&appName=Cluster0")
db = client["X_db"]
print("Collections in X_db:", db.list_collection_names(), flush=True)
@app.route("/recommend/product/<string:product_id>", methods=["GET"])
def recommend_by_product(product_id):
    try:
        if product_id in product_ids:
            idx = product_ids.index(product_id)
            sim = cosine_similarity([embeddings[idx]], embeddings).flatten()
            top_idxs = sim.argsort()[::-1][1:11]
            return jsonify({"status": "success", "recommended": [product_ids[i] for i in top_idxs]})
        else:
            row = df_meta[df_meta["_id"] == product_id]
            if row.empty:
                print("empty")
                return jsonify({"error": "Product not found"}), 404
            cat = row.iloc[0]["category"]
            fallback = df_meta[(df_meta["category"] == cat) & (df_meta["_id"] != product_id)]["_id"].head(10).tolist()
            return jsonify({"status": "fallback", "recommended": fallback})
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

@app.route("/recommend/user/<string:user_id>", methods=["GET"])
def recommend_by_user(user_id):
    try:
        print(f"[DEBUG] Function entered with user_id={user_id}", flush=True)
        user_object_id = ObjectId(user_id)

        docs = list(db.histories.find({"userId": user_object_id}, {"_id": 0, "productId": 1}))
        watched = [str(d["productId"]) for d in docs]

        if not watched:
            print("[DEBUG] No watch history found", flush=True)
            return jsonify({"status": "no_history", "recommended": []})

        idxs = [product_ids.index(p) for p in watched if p in product_ids]

        if not idxs:
            print("[DEBUG] No valid product IDs in embedding list", flush=True)
            return jsonify({"status": "no_valid_embeddings", "recommended": []})

        user_emb = np.mean([embeddings[i] for i in idxs], axis=0).reshape(1, -1)
        sim = cosine_similarity(user_emb, embeddings).flatten()

        recs = []
        for i in sim.argsort()[::-1]:
            pid = product_ids[i]
            if pid not in watched:
                recs.append(pid)
            if len(recs) >= 10:
                break

        print(f"[DEBUG] Recommended product IDs: {recs}", flush=True)
        return jsonify({"status": "success", "recommended": recs})

    except Exception as e:
        print(f"[ERROR] Exception occurred: {e}", flush=True)
        return jsonify({"error": str(e)}), 500
   
if __name__ == "__main__":
    app.run(debug=True, port=5000)
