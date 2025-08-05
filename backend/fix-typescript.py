#!/usr/bin/env python3
import os
import re

def fix_typescript_errors():
    """Corregge tutti gli errori TypeScript comuni nel backend"""
    
    backend_dir = "/Users/lucamambelli/Desktop/soccer-management-system/backend/src"
    
    # Dizionario delle sostituzioni da fare
    replacements = {
        # Match fields
        r'\bmatchDate\b': 'date',
        r'\bmatchTime\b': 'time',
        
        # Transport fields
        r'\bathleteTransport\b': 'busAthlete',
        r'\.transport\.': '.transportZone.',
        r'include:\s*{\s*transport:': 'include: { transportZone:',
        
        # Notification fields
        r'\bisPersistent:\s*false\b': '',
        r'\bisPersistent:\s*true\b': '',
        r'\bpriority:\s*[\'"]?\w+[\'"]?,?\s*\n': '',
        
        # Document fields che non esistono
        r'document\.name': 'document.fileName',
        
        # Match athlete fields
        r'\bmatchAthlete\b': 'matchRoster',
        r'\bmatchEvent\b': 'matchStat',
        
        # Fix includes
        r'zones:\s*{\s*has:\s*id\s*}': 'id',
        r'busRoutes:': '// busRoutes:',
        r'_count\.transports': '_count.busAthletes',
        r'route\.transports': 'route.busAthletes',
        
        # Fix organization fields
        r'document\.organizationId': 'document.athlete.organizationId',
        r'expiryDate:\s*{\s*not:\s*null\s*}': 'expiryDate: { not: undefined }'
    }
    
    # File da processare
    for root, dirs, files in os.walk(backend_dir):
        for file in files:
            if file.endswith('.ts'):
                filepath = os.path.join(root, file)
                
                try:
                    with open(filepath, 'r') as f:
                        content = f.read()
                    
                    original_content = content
                    
                    # Applica tutte le sostituzioni
                    for pattern, replacement in replacements.items():
                        content = re.sub(pattern, replacement, content)
                    
                    # Salva solo se il contenuto è cambiato
                    if content != original_content:
                        with open(filepath, 'w') as f:
                            f.write(content)
                        print(f"✅ Fixed: {filepath}")
                    
                except Exception as e:
                    print(f"❌ Error processing {filepath}: {e}")

if __name__ == "__main__":
    fix_typescript_errors()
    print("\n✨ TypeScript errors fixed!")
