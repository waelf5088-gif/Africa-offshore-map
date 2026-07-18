import json
import os

def remove_inland_concessions():
    path = "src/data/mining_terminals.json"
    if not os.path.exists(path):
        print(f"Error: {path} not found.")
        return False
        
    with open(path, "r", encoding="utf-8") as f:
        terminals = json.load(f)
        
    # Inland Eramet IDs to remove
    to_remove = ["GAB-MOANDA-ERAMET", "GAB-NDJOLE-ERAMET", "CMR-AKONOLINGA-ERAMET"]
    
    # Filter out the inland ones
    filtered_terminals = [t for t in terminals if t["id"] not in to_remove]
    
    with open(path, "w", encoding="utf-8") as f:
        json.dump(filtered_terminals, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully removed inland Eramet concessions. Retained GCO Senegal.")
    return True

if __name__ == "__main__":
    remove_inland_concessions()
