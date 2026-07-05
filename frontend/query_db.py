
import sqlite3

db_path = r'd:\Projects\24_LIRA\frontend\prisma\dev.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("--- Searching for Mock Reports (14/2) ---")
cursor.execute("SELECT id, userId, patientName, totalTests, abnormalTests, overallRisk FROM Report WHERE totalTests = 14 AND abnormalTests = 2")
rows = cursor.fetchall()
for row in rows:
    print(f"FOUND MOCK REPORT: id={row[0]} user={row[1]} patient={row[2]}")

print("\n--- All Reports for user 'Nandala' (if name matches) ---")
cursor.execute("SELECT id, userId, patientName, totalTests, abnormalTests, overallRisk FROM Report WHERE patientName LIKE '%Nandala%'")
rows = cursor.fetchall()
for row in rows:
    print(f"REPORT: id={row[0]} user={row[1]} patient={row[2]} total={row[3]} abnormal={row[4]} risk='{row[5]}'")

conn.close()
