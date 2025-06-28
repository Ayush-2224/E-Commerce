import schedule, time, subprocess

def retrain():
    print("🔄 Running scheduled retraining...")
    subprocess.run(["python", "train/generate_embeddings.py"])
    print("✅ Retraining complete.")

schedule.every(10).hours.do(retrain)

if __name__ == "__main__":
    retrain()  
    while True:
        schedule.run_pending()
        time.sleep(60)
