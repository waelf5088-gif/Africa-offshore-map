import json
import os

def update_mining_terminals():
    path = "src/data/mining_terminals.json"
    if not os.path.exists(path):
        print(f"Error: {path} not found.")
        return False
        
    with open(path, "r", encoding="utf-8") as f:
        terminals = json.load(f)
        
    # Check if any Eramet concession is already there
    exists = any(t["id"].endswith("-ERAMET") for t in terminals)
    if exists:
        print("Eramet concessions already exist in mining_terminals.json.")
        return True
        
    eramet_concessions = [
      {
        "id": "GAB-MOANDA-ERAMET",
        "kind": "mining",
        "lat": -1.5600,
        "lng": 13.5000,
        "terminal_name": "Concession Minière de Moanda (Eramet / Comilog)",
        "country": "Gabon",
        "commodity": "Manganèse",
        "operator": "Compagnie Minière de l'Ogooué (COMILOG) / Eramet",
        "current_status": "Production active. Plus grand gisement mondial de manganèse à haute teneur.",
        "map_popup_interface": {
          "header_color": "#f97316",
          "tabs_content": {
            "roadmap": {
              "summary": "La mine de Moanda est exploitée à ciel ouvert. Le minerai de manganèse extrait est transporté par le Transgabonais (chemin de fer) jusqu'au port minéralier d'Owendo à Libreville pour exportation globale.",
              "key_metrics": [
                "Capacité: >7.5 Millions de tonnes/an",
                "Type: Mine à ciel ouvert géante",
                "Transport: Rail Transgabonais (650 km)"
              ]
            },
            "assets": [
              { "type": "Rail Logistics", "name": "Transgabonais Ore Trains", "spec": "Rotations ferroviaires quotidiennes de rames de minerai." },
              { "type": "Port Terminal", "name": "Owendo Mineral Port", "spec": "Quai d'exportation dédié géré par Comilog/Eramet." }
            ],
            "tenders": {
              "status_indicator": "🚀 EXPLOITATION DE PRODUCTION STABLE",
              "past_tenders": [
                { "title": "Moanda Expansion Phase 2", "date": "2023", "duration": "Complété" }
              ],
              "future_tenders": [
                { "title": "Railway Logistics Support & Heavy Haulage Maintenance", "date_estimated": "Septembre 2026", "duration": "36 mois", "platform": "COMILOG Procurement" }
              ]
            },
            "leads": {
              "target_companies": ["COMILOG Gabon", "Eramet Gabon", "Setrag"],
              "action": "Assister la logistique maritime au port d'Owendo pour les vraquiers de manganèse de la Comilog. Sécuriser les services de remorquage."
            }
          }
        }
      },
      {
        "id": "GAB-NDJOLE-ERAMET",
        "kind": "mining",
        "lat": -0.1800,
        "lng": 10.7600,
        "terminal_name": "Concession de Ndjolé (Eramet)",
        "country": "Gabon",
        "commodity": "Manganèse",
        "operator": "Eramet / COMILOG",
        "current_status": "Phase d'évaluation et de planification d'ingénierie active en 2026.",
        "map_popup_interface": {
          "header_color": "#f97316",
          "tabs_content": {
            "roadmap": {
              "summary": "Projet d'exploration et de développement d'un nouveau gisement de manganèse à proximité de la ville de Ndjolé. Complète la production historique de Moanda.",
              "key_metrics": [
                "Type: Gisement de manganèse secondaire",
                "Statut: Développement",
                "Accès: Proximité fleuve Ogooué"
              ]
            },
            "assets": [
              { "type": "Exploration Drilling", "name": "Core Drilling Rigs", "spec": "Campagne active de forages de délimitation." }
            ],
            "tenders": {
              "status_indicator": "🔥 PRE-FID ENVISAGEE EN 2027",
              "past_tenders": [],
              "future_tenders": [
                { "title": "Environmental & Hydrogeological Impact Assessment", "date_estimated": "Octobre 2026", "duration": "12 mois", "platform": "Eramet e-Sourcing" }
              ]
            },
            "leads": {
              "target_companies": ["Eramet", "COMILOG"],
              "action": "Suivre les études logistiques pour l'évacuation du minerai (option fluviale via l'Ogooué ou ferroviaire via le Transgabonais)."
            }
          }
        }
      },
      {
        "id": "SEN-DIOGO-ERAMET",
        "kind": "mining",
        "lat": 15.2200,
        "lng": -16.7500,
        "terminal_name": "Grande Côte Operations (GCO - Eramet)",
        "country": "Sénégal",
        "commodity": "Zircon & Titane",
        "operator": "Grande Côte Operations (GCO) / Eramet",
        "current_status": "Production active. Exploitation majeure de sables minéralisés le long de la côte.",
        "map_popup_interface": {
          "header_color": "#f97316",
          "tabs_content": {
            "roadmap": {
              "summary": "Exploitation par drague flottante et usine de concentration humide. Le zircon et l'ilménite sont envoyés par rail au port de Dakar pour exportation mondiale.",
              "key_metrics": [
                "Production: ~700 000 tonnes/an de concentrés",
                "Type: Drague suceuse marcheuse flottante",
                "Logistique: Usine de séparation à Diogo + Terminal minier de Dakar"
              ]
            },
            "assets": [
              { "type": "Dredger", "name": "Dredge GCO Yeene", "spec": "Drague suceuse à désagrégateur flottant." },
              { "type": "Concentrator", "name": "Floating Wet Concentrator Plant", "spec": "Unité de traitement flottante suivant la drague." }
            ],
            "tenders": {
              "status_indicator": "🚀 CONTRATS D'APPROVISIONNEMENT ET MAINTENANCE",
              "past_tenders": [
                { "title": "Dakar Port Terminal Upgrade", "date": "2022", "duration": "Complété" }
              ],
              "future_tenders": [
                { "title": "Supply of Dredge Spare Parts & Heavy Slurry Pumps", "date_estimated": "Septembre 2026", "duration": "24 mois", "platform": "GCO Senegal Sourcing" }
              ]
            },
            "leads": {
              "target_companies": ["Grande Côte Operations", "Eramet Senegal"],
              "action": "Se positionner sur le terminal minier de GCO au port de Dakar pour la manutention, le remorquage d'escorte des vraquiers."
            }
          }
        }
      },
      {
        "id": "CMR-AKONOLINGA-ERAMET",
        "kind": "mining",
        "lat": 3.7700,
        "lng": 12.2500,
        "terminal_name": "Projet Rutile Akonolinga (Eramet)",
        "country": "Cameroun",
        "commodity": "Rutile (Titane)",
        "operator": "Eramet Cameroun",
        "current_status": "Projet en phase d'appréciation et d'évaluation économique des ressources.",
        "map_popup_interface": {
          "header_color": "#f97316",
          "tabs_content": {
            "roadmap": {
              "summary": "Concession d'exploration de sables rutileux à fort potentiel dans le département du Nyong-et-Mfoumou. Eramet réalise des essais d'extraction et des caractérisations géologiques.",
              "key_metrics": [
                "Type: Gisement de rutile alluvial",
                "Status: Appraisal / Appréciation",
                "Ressources: Potentiel de classe mondiale de rutile"
              ]
            },
            "assets": [
              { "type": "Pilot Plant", "name": "Akonolinga Test Unit", "spec": "Unité pilote de concentration gravimétrique." }
            ],
            "tenders": {
              "status_indicator": "🔥 RELEVÉS GÉOPHYSIQUES ET ESSAIS PILOTES EN COURS",
              "past_tenders": [],
              "future_tenders": [
                { "title": "Feasibility Study & Logistics Corridor Evaluation", "date_estimated": "Novembre 2026", "duration": "18 mois", "platform": "Eramet Sourcing" }
              ]
            },
            "leads": {
              "target_companies": ["Eramet Cameroun", "Ministère des Mines du Cameroun"],
              "action": "Suivre le développement du corridor d'exportation vers le port de Kribi ou de Douala. Anticiper les besoins logistiques."
            }
          }
        }
      }
    ]
    
    terminals.extend(eramet_concessions)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(terminals, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully added {len(eramet_concessions)} Eramet concessions to mining_terminals.json")
    return True

def update_prospecting_signatures():
    path = "src/data/projects.json"
    if not os.path.exists(path):
        print(f"Error: {path} not found.")
        return False
        
    with open(path, "r", encoding="utf-8") as f:
        projects = json.load(f)
        
    old_sigs = [
        "Best regards,\n\nOffshore Commercial Director\nBoluda Towage Division",
        "Best regards,\n\nOffshore Commercial Director, Boluda Towage",
        "Best regards,\n\nOffshore Commercial Director\nBoluda Towage",
        "Best regards,\n\nBoluda Towage Division"
    ]
    
    new_sig = "Best regards,\n\nWael FACHATE | International Commercial Manager\nBOLUDA TOWAGE FRANCE"
    
    updated_count = 0
    for p in projects:
        if "prospecting_email" in p and "body" in p["prospecting_email"]:
            body = p["prospecting_email"]["body"]
            
            # Replace signature
            replaced = False
            for old_sig in old_sigs:
                if old_sig in body:
                    body = body.replace(old_sig, new_sig)
                    replaced = True
                    break
            
            # If not replaced but has "Best regards,", let's split and replace the end
            if not replaced and "Best regards," in body:
                parts = body.split("Best regards,")
                body = parts[0] + new_sig
                replaced = True
                
            if replaced:
                p["prospecting_email"]["body"] = body
                updated_count += 1
                
    with open(path, "w", encoding="utf-8") as f:
        json.dump(projects, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully updated signature for {updated_count} projects in projects.json")
    return True

if __name__ == "__main__":
    update_mining_terminals()
    update_prospecting_signatures()
