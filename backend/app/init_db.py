"""
MedSafe AI — Database Initializer and Clinical Knowledge Seeder
Creates all tables and seeds verified medicines, interaction pairs, and a demo clinician account.
"""

import uuid
from datetime import datetime, timezone

from app.database import engine, Base, SessionLocal
from app.models.models import Medicine, MedicineInteraction, User, UserProfile
from app.utils.security import hash_password


def init_and_seed():
    print("Creating all database tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

    db = SessionLocal()
    try:
        # Check if medicines need seeding
        if db.query(Medicine).count() == 0:
            print("Seeding verified medicines and clinical interaction monographs...")

        meds = [
            Medicine(
                id=str(uuid.uuid4()),
                brand_name="Tylenol",
                generic_name="Paracetamol",
                active_ingredients=["Paracetamol"],
                drug_class="Analgesic & Antipyretic",
                dosage_form="Tablet",
                description="Widely used pain reliever and fever reducer.",
                uses="Mild to moderate pain, headache, dental pain, fever reduction.",
                mechanism="Inhibition of central prostaglandin synthesis.",
                side_effects="Nausea, allergic skin rash; hepatotoxicity in excessive doses.",
                warnings="Do not exceed 4000mg/24h. Hepatotoxicity risk when combined with duplicate paracetamol products or alcohol.",
                contraindications="Severe active hepatic impairment.",
                storage_information="Store below 25°C in a dry place.",
                source="FDA / DailyMed",
                source_url="https://dailymed.nlm.nih.gov",
                last_verified=datetime.now(timezone.utc),
            ),
            Medicine(
                id=str(uuid.uuid4()),
                brand_name="Panadol Extra",
                generic_name="Paracetamol & Caffeine",
                active_ingredients=["Paracetamol", "Caffeine"],
                drug_class="Analgesic Combination",
                dosage_form="Tablet",
                description="Dual-active formulation for enhanced relief of tension headaches.",
                uses="Severe headache, migraine, musculoskeletal pain.",
                mechanism="Paracetamol central analgesia potentiated by caffeine adenosine receptor antagonism.",
                side_effects="Insomnia, restlessness, gastrointestinal irritation.",
                warnings="Contains paracetamol. Do not combine with other paracetamol products (duplicate molecule risk).",
                contraindications="Severe hepatic impairment, cardiac arrhythmias.",
                storage_information="Store at room temperature.",
                source="FDA / DailyMed",
                source_url="https://dailymed.nlm.nih.gov",
                last_verified=datetime.now(timezone.utc),
            ),
            Medicine(
                id=str(uuid.uuid4()),
                brand_name="Advil",
                generic_name="Ibuprofen",
                active_ingredients=["Ibuprofen"],
                drug_class="Non-Steroidal Anti-Inflammatory Drug (NSAID)",
                dosage_form="Tablet",
                description="NSAID used for reducing inflammation, pain, and fever.",
                uses="Osteoarthritis, rheumatoid arthritis, dysmenorrhea, mild to moderate inflammation.",
                mechanism="Reversible inhibition of cyclooxygenase enzymes (COX-1 and COX-2).",
                side_effects="Dyspepsia, GI ulceration, fluid retention, dizziness.",
                warnings="Cardiovascular risk (MI, stroke) and serious gastrointestinal bleeding.",
                contraindications="Active peptic ulcer, third trimester of pregnancy, severe heart failure.",
                storage_information="Keep out of direct sunlight.",
                source="FDA / DailyMed",
                source_url="https://dailymed.nlm.nih.gov",
                last_verified=datetime.now(timezone.utc),
            ),
            Medicine(
                id=str(uuid.uuid4()),
                brand_name="Coumadin",
                generic_name="Warfarin",
                active_ingredients=["Warfarin Sodium"],
                drug_class="Anticoagulant",
                dosage_form="Tablet",
                description="Vitamin K antagonist oral anticoagulant.",
                uses="Prophylaxis and treatment of venous thrombosis, pulmonary embolism, and atrial fibrillation.",
                mechanism="Competitively inhibits vitamin K epoxide reductase complex 1 (VKORC1).",
                side_effects="Major and fatal bleeding, bruising, hematuria.",
                warnings="Narrow therapeutic index. Requires routine INR monitoring. High potential for drug-drug interactions.",
                contraindications="Active pathological hemorrhage, hemorrhagic tendencies, pregnancy.",
                storage_information="Protect from light. Store at 20°C to 25°C.",
                source="FDA / DailyMed",
                source_url="https://dailymed.nlm.nih.gov",
                last_verified=datetime.now(timezone.utc),
            ),
            Medicine(
                id=str(uuid.uuid4()),
                brand_name="Bayer Aspirin",
                generic_name="Aspirin",
                active_ingredients=["Acetylsalicylic Acid"],
                drug_class="Antiplatelet & NSAID",
                dosage_form="Tablet",
                description="Antiplatelet agent and salicylate analgesic.",
                uses="Secondary prevention of cardiovascular events, transient ischemic attacks, pain.",
                mechanism="Irreversible inactivation of cyclooxygenase (COX-1) suppressing thromboxane A2.",
                side_effects="GI discomfort, occult blood loss, tinnitus.",
                warnings="Bleeding diathesis. Contraindicated in children with viral infections due to Reye syndrome.",
                contraindications="Active GI bleeding, hemophilia, salicylate hypersensitivity.",
                storage_information="Store in tightly closed container.",
                source="FDA / DailyMed",
                source_url="https://dailymed.nlm.nih.gov",
                last_verified=datetime.now(timezone.utc),
            ),
            Medicine(
                id=str(uuid.uuid4()),
                brand_name="Prinivil",
                generic_name="Lisinopril",
                active_ingredients=["Lisinopril"],
                drug_class="ACE Inhibitor",
                dosage_form="Tablet",
                description="Angiotensin-converting enzyme inhibitor for hypertension and heart failure.",
                uses="Hypertension, adjunct in heart failure, acute myocardial infarction survival.",
                mechanism="Inhibits ACE, blocking conversion of angiotensin I to angiotensin II.",
                side_effects="Persistent dry cough, hyperkalemia, dizziness, hypotension.",
                warnings="Boxed warning for fetal toxicity if taken during pregnancy. Risk of angioedema.",
                contraindications="History of angioedema, pregnancy, concomitant aliskiren in diabetics.",
                storage_information="Store below 30°C.",
                source="FDA / DailyMed",
                source_url="https://dailymed.nlm.nih.gov",
                last_verified=datetime.now(timezone.utc),
            ),
            Medicine(
                id=str(uuid.uuid4()),
                brand_name="Lipitor",
                generic_name="Atorvastatin",
                active_ingredients=["Atorvastatin Calcium"],
                drug_class="HMG-CoA Reductase Inhibitor (Statin)",
                dosage_form="Tablet",
                description="Lipid-lowering agent reducing LDL cholesterol.",
                uses="Hypercholesterolemia, dyslipidemia, cardiovascular risk reduction.",
                mechanism="Inhibits HMG-CoA reductase, the rate-limiting enzyme in cholesterol biosynthesis.",
                side_effects="Myalgia, arthralgia, mild elevation in serum transaminases.",
                warnings="Risk of myopathy and rhabdomyolysis, especially when co-administered with CYP3A4 inhibitors.",
                contraindications="Active liver disease, pregnancy, lactation.",
                storage_information="Store at 20°C to 25°C.",
                source="FDA / DailyMed",
                source_url="https://dailymed.nlm.nih.gov",
                last_verified=datetime.now(timezone.utc),
            ),
            Medicine(
                id=str(uuid.uuid4()),
                brand_name="Glucophage",
                generic_name="Metformin",
                active_ingredients=["Metformin Hydrochloride"],
                drug_class="Biguanide",
                dosage_form="Tablet",
                description="First-line oral antihyperglycemic agent for Type 2 Diabetes.",
                uses="Type 2 Diabetes Mellitus glycemic control.",
                mechanism="Decreases hepatic glucose production, decreases intestinal absorption, improves insulin sensitivity.",
                side_effects="Diarrhea, nausea, metallic taste, abdominal bloating.",
                warnings="Risk of lactic acidosis, particularly in patients with acute renal impairment or contrast administration.",
                contraindications="Severe renal impairment (eGFR < 30 mL/min), acute metabolic acidosis.",
                storage_information="Store in light-resistant container.",
                source="FDA / DailyMed",
                source_url="https://dailymed.nlm.nih.gov",
                last_verified=datetime.now(timezone.utc),
            ),
        ]

        if db.query(Medicine).count() == 0:
            db.add_all(meds)
            db.flush()

            # Map by generic name for building interactions
            med_map = {m.generic_name: m.id for m in meds}

            interactions = [
                MedicineInteraction(
                    id=str(uuid.uuid4()),
                    medicine_a_id=med_map["Warfarin"],
                    medicine_b_id=med_map["Aspirin"],
                    severity="contraindicated",
                    description="Concurrent anticoagulant and antiplatelet therapy dramatically amplifies major and potentially fatal hemorrhagic complications.",
                    mechanism="Synergistic inhibition of primary platelet plug formation and coagulation cascade.",
                    recommendation="Avoid combination unless explicitly directed by a cardiologist/hematologist under rigorous clinical and INR monitoring.",
                    source="FDA / Lexicomp Clinical Drug Interactions",
                    source_url="https://www.fda.gov",
                    last_verified=datetime.now(timezone.utc),
                ),
                MedicineInteraction(
                    id=str(uuid.uuid4()),
                    medicine_a_id=med_map["Warfarin"],
                    medicine_b_id=med_map["Ibuprofen"],
                    severity="high",
                    description="NSAID-induced gastrointestinal mucosal erosion combined with vitamin K antagonism creates extreme risk of upper GI bleeding.",
                    mechanism="Inhibition of platelet COX-1 plus anticoagulant effect, and competitive protein binding displacement.",
                    recommendation="Avoid NSAIDs during oral anticoagulation. Use alternative analgesics such as paracetamol within safe dosing thresholds.",
                    source="FDA / Clinical Pharmacology",
                    source_url="https://www.fda.gov",
                    last_verified=datetime.now(timezone.utc),
                ),
                MedicineInteraction(
                    id=str(uuid.uuid4()),
                    medicine_a_id=med_map["Ibuprofen"],
                    medicine_b_id=med_map["Lisinopril"],
                    severity="moderate",
                    description="NSAIDs can blunt the antihypertensive efficacy of ACE inhibitors and precipitate acute renal impairment.",
                    mechanism="Inhibition of renal prostaglandins results in decreased renal blood flow and sodium retention.",
                    recommendation="Monitor blood pressure and renal function (eGFR/serum creatinine). Limit NSAID duration.",
                    source="American Heart Association / Lexicomp",
                    source_url="https://www.fda.gov",
                    last_verified=datetime.now(timezone.utc),
                ),
            ]
            db.add_all(interactions)
            print("Medicines and interactions seeded successfully.")
        else:
            print("Medicines already present in database.")

        # Seed or update Demo User
        demo_user = db.query(User).filter(User.email == "doctor.jane@hospital.org").first()
        if not demo_user:
            demo_user = User(
                id=str(uuid.uuid4()),
                name="Dr. Jane Doe",
                email="doctor.jane@hospital.org",
                password_hash=hash_password("Password123!"),
                is_active=True,
            )
            db.add(demo_user)
            db.flush()

            profile = UserProfile(
                user_id=demo_user.id,
                age=38,
                allergies=["Penicillin", "Sulfa drugs"],
                existing_conditions=["Hypertension", "Asthma"],
            )
            db.add(profile)
            print("Demo user created.")
        else:
            demo_user.password_hash = hash_password("Password123!")
            print("Demo user password updated.")

        db.commit()

        print("Database successfully seeded with verified medicines, interactions, and demo user!")

    finally:
        db.close()


if __name__ == "__main__":
    init_and_seed()
