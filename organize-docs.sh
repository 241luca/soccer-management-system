#!/bin/bash

echo "🗂️ Riorganizzazione documentazione in corso..."

# Sposta i file di istruzioni nell'archivio
mkdir -p docs/archive/instructions
mv ISTRUZIONI-*.md docs/archive/instructions/ 2>/dev/null
mv PROMPT-*.md docs/archive/instructions/ 2>/dev/null
mv ONBOARDING-*.md docs/archive/instructions/ 2>/dev/null
mv TEMPLATE-*.md docs/archive/instructions/ 2>/dev/null
mv QUICK-START-CLAUDE.md docs/archive/instructions/ 2>/dev/null

# Sposta i file di riepilogo nell'archivio
mkdir -p docs/archive/summaries
mv *-SUMMARY.md docs/archive/summaries/ 2>/dev/null
mv *_SUMMARY.md docs/archive/summaries/ 2>/dev/null
mv RIEPILOGO-*.md docs/archive/summaries/ 2>/dev/null

# Sposta i file di stato del progetto
mkdir -p docs/project
mv PROJECT-STATUS*.md docs/project/ 2>/dev/null
mv REFACTORING.md docs/project/ 2>/dev/null
mv ORGANIZE-*.md docs/project/ 2>/dev/null

# Sposta file di push/deployment
mkdir -p docs/archive/deployment
mv PUSH_*.md docs/archive/deployment/ 2>/dev/null
mv *-PUSH-*.md docs/archive/deployment/ 2>/dev/null
mv GIT-*.md docs/archive/deployment/ 2>/dev/null

# Sposta vecchie versioni della documentazione
mkdir -p docs/archive/old-versions
mv BACKEND-DOCUMENTATION-V2.md docs/archive/old-versions/ 2>/dev/null

# Mantieni nella root solo i file essenziali
# README.md, LICENSE, .gitignore, package.json, etc.

echo "✅ Riorganizzazione completata!"
echo ""
echo "📁 Nuova struttura:"
echo "  docs/"
echo "  ├── guides/        - Guide utente"
echo "  ├── development/   - Guide sviluppo"
echo "  ├── api/          - Documentazione API"
echo "  ├── deployment/   - Guide deployment"
echo "  ├── project/      - Project management"
echo "  └── archive/      - Vecchi documenti"
echo ""
echo "📋 File rimasti nella root:"
ls -1 *.md 2>/dev/null | grep -v README.md
