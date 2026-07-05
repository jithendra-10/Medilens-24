import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

print(f"Connecting to: {DATABASE_URL[:40]}...")

try:
    engine = create_engine(DATABASE_URL, connect_args={"connect_timeout": 5})
    with engine.connect() as conn:
        print("Connection successful!")
        result = conn.execute(text("SELECT now();"))
        print(f"Server time: {result.fetchone()[0]}")
        
        # Check active connections if possible
        result = conn.execute(text("SELECT pid, state, query, now() - query_start AS duration FROM pg_stat_activity WHERE state != 'idle';"))
        print("\nActive Queries:")
        for row in result:
            print(f"PID: {row[0]} | State: {row[1]} | Duration: {row[3]} | Query: {row[2][:100]}")
except Exception as e:
    print(f"Connection failed: {e}")
