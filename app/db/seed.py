import json
import os
from sqlalchemy import select, func
from .neon import AsyncSessionLocal
from .models import Patient


async def seed_all():
    """Seed demo patients into NeonDB if table is empty."""
    async with AsyncSessionLocal() as session:
        count = await session.scalar(select(func.count()).select_from(Patient))
        if count and count > 0:
            print(f"Patients table already has {count} rows, skipping seed.")
            return

        seed_path = os.path.join(os.path.dirname(__file__), "..", "..", "seed", "patients.json")
        seed_path = os.path.abspath(seed_path)
        with open(seed_path, "r") as f:
            patients = json.load(f)

        for p in patients:
            patient = Patient(
                patient_id=p["patient_id"],
                name=p["name"],
                age=p["age"],
                record=p,  # store entire JSON as the record
            )
            session.add(patient)

        await session.commit()
        print(f"Seeded {len(patients)} demo patients.")


async def seed_drug_labels(collection):
    """Seed FDA drug label chunks into ChromaDB collection."""
    seed_path = os.path.join(os.path.dirname(__file__), "..", "..", "seed", "drug_labels.json")
    seed_path = os.path.abspath(seed_path)
    with open(seed_path, "r") as f:
        labels = json.load(f)

    ids = []
    documents = []
    metadatas = []

    for i, label in enumerate(labels):
        ids.append(f"drug_{i:03d}")
        documents.append(label["text"])
        metadatas.append({
            "drug_name": label["drug_name"],
            "section": label["section"],
        })

    collection.add(ids=ids, documents=documents, metadatas=metadatas)
    print(f"Seeded {len(labels)} drug label chunks into ChromaDB.")
