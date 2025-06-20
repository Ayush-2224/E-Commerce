from flask import Flask, request, jsonify
import joblib
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
import os

app = Flask(__name__)
MODEL_DIR = "models"

def load_resources():
    tfidf_matrix = joblib.load(os.path.join(MODEL_DIR, "tfidf_matrix.pkl"))
    product_ids = pd.read_csv(os.path.join(MODEL_DIR, "product_ids.csv"))["_id"].astype(str)
    return tfidf_matrix, product_ids

@app.route("/recommend/<string:product_id>", methods=["GET"])
def recommend_by_id(product_id):
    try:
        tfidf_matrix, product_ids = load_resources()
        df_meta = pd.read_csv(os.path.join(MODEL_DIR, "product_data.csv"))  # for fallback

        try:
            index = product_ids[product_ids == product_id].index[0]
            cosine_sim = cosine_similarity(tfidf_matrix[index], tfidf_matrix).flatten()
            similar_indices = cosine_sim.argsort()[::-1][1:6]
            recommended_ids = product_ids.iloc[similar_indices].tolist()

            return jsonify({
                "status": "success",
                "recommended": recommended_ids
            })

        except IndexError:
            print(f"⚠️ Product ID {product_id} not found in model, using fallback")

            # Fallback: recommend based on same category
            df_meta["_id"] = df_meta["_id"].astype(str)
            product_row = df_meta[df_meta["_id"] == product_id]

            if product_row.empty:
                return jsonify({"error": "Product not found for fallback"}), 404

            category = product_row.iloc[0]["category"]
            fallback_ids = (
                df_meta[(df_meta["category"] == category) & (df_meta["_id"] != product_id)]
                .head(5)["_id"].tolist()
            )

            return jsonify({
                "status": "fallback",
                "recommended": fallback_ids
            })

    except Exception as e:
        print("Error during recommendation:", e)
        return jsonify({"error": "Internal server error"}), 500

@app.route("/retrain", methods=["POST"])
def retrain_from_node():
    try:
        from retrain_model import retrain_model
        data = request.get_json()
        products = data["products"]
        print("Received products for retraining:", products[0])
        retrain_model(products)

        return jsonify({"message": "Retrained successfully."})
    except Exception as e:
        print("Retrain error:", e)
        return jsonify({"error": "Retraining failed"}), 500

if __name__ == "__main__":
    app.run(port=5000)
