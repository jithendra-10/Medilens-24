from sqlalchemy import text
from app.db.database import engine
from app.db import models

def fix():
    # Ensure all tables exist (e.g. profiles)
    models.Base.metadata.create_all(bind=engine)
    
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE reports ADD COLUMN profile_id INTEGER REFERENCES profiles(id);"))
            conn.commit()
            print("Successfully added profile_id to reports")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    fix()
