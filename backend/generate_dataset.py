import csv
import random
import os

os.makedirs('data', exist_ok=True)

age_bands = ['0-18', '19-35', '36-50', '51-65', '65+']
location_types = ['Urban', 'Rural']
equipment_tiers = ['Basic', 'Standard', 'Advanced']
genders = ['M', 'F']
ethnicities = ['Mande', 'Fula', 'Voltaic', 'Other']

data = []
for i in range(1, 1001):
    patient_id = f"P{i:05d}"
    age = random.choice(age_bands)
    loc = random.choice(location_types)
    equip = random.choice(equipment_tiers)
    gender = random.choice(genders)
    ethnicity = random.choice(ethnicities)
    
    # Introduce bias: Rural patients with Basic equipment have worse outcomes
    # Further bias: Fula and Voltaic ethnicities might have slightly different distributions
    if loc == 'Rural' and equip == 'Basic':
        true_label = random.choices([0, 1], weights=[0.2, 0.8])[0]
        prediction = random.choices([0, 1], weights=[0.4, 0.6])[0] 
        confidence = random.uniform(0.4, 0.7)
    elif ethnicity in ['Fula', 'Voltaic']:
        true_label = random.choices([0, 1], weights=[0.4, 0.6])[0]
        prediction = random.choices([0, 1], weights=[0.5, 0.5])[0] 
        confidence = random.uniform(0.6, 0.8)
    else:
        true_label = random.choices([0, 1], weights=[0.5, 0.5])[0]
        prediction = true_label if random.random() > 0.1 else (1 - true_label)
        confidence = random.uniform(0.7, 0.99)
        
    data.append([
        patient_id, age, loc, equip, gender, ethnicity, true_label, prediction, round(confidence, 3)
    ])

with open('data/maliba_proxy_dataset.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow([
        'patient_id', 'age_band', 'location_type', 
        'equipment_tier', 'gender', 'ethnicity', 'condition_label', 
        'model_prediction', 'model_confidence'
    ])
    writer.writerows(data)

print("Dataset generated at data/maliba_proxy_dataset.csv")
