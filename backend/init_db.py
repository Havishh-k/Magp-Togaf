from database import engine, Base
import models # imports all from __init__.py

print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("Tables created successfully.")
