#!/usr/bin/env bash
# =============================================================================
# UnlockTracker — Smoke Test (Sprint 1)
# Agent: TEMPER (QA)
#
# Vérifie en cascade que le projet client est correctement monté :
#   1. Le dossier client/ existe
#   2. Les dépendances npm sont installées (node_modules + package-lock)
#   3. TypeScript compile sans erreur (tsc -b)
#   4. Le build de production passe (vite build)
#
# Usage :
#   ./scripts/smoke-test.sh          # depuis la racine du repo
#   bash scripts/smoke-test.sh
#
# Codes de sortie : 0 = tout est OK, 1 = une étape a échoué.
# Ce script ne fait AUCUN commit / push (le git est géré par Pixel).
# =============================================================================
set -u

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLIENT_DIR="$REPO_ROOT/client"

PASS=0
FAIL=0
STEPS=4

green() { printf '\033[32m%s\033[0m\n' "$1"; }
red()   { printf '\033[31m%s\033[0m\n' "$1"; }
bold()  { printf '\033[1m%s\033[0m\n' "$1"; }

report_step() { # report_step <nom> <code_retour>
  local name="$1" code="$2"
  if [ "$code" -eq 0 ]; then
    green "  [OK]   $name"
    PASS=$((PASS + 1))
  else
    red   "  [FAIL] $name"
    FAIL=$((FAIL + 1))
  fi
}

bold "=============================================="
bold " UnlockTracker — Smoke Test"
bold "=============================================="
echo "Repo : $REPO_ROOT"
echo

# --- Étape 1 : le dossier client/ existe ------------------------------------
bold "Étape 1/$STEPS — Structure du projet"
if [ -d "$CLIENT_DIR" ] && [ -f "$CLIENT_DIR/package.json" ]; then
  report_step "client/ existe et contient un package.json" 0
else
  report_step "client/ existe et contient un package.json" 1
  red "Arrêt : impossible de continuer sans client/package.json."
  exit 1
fi

# --- Étape 2 : les dépendances sont installées ------------------------------
bold "Étape 2/$STEPS — Dépendances npm"
DEPS_OK=0
if [ -d "$CLIENT_DIR/node_modules" ]; then
  report_step "node_modules/ présent" 0
else
  report_step "node_modules/ présent" 1
  DEPS_OK=1
fi

# Au minimum react + react-dom + typescript + vite doivent être là
for pkg in react react-dom typescript vite; do
  if [ -d "$CLIENT_DIR/node_modules/$pkg" ]; then
    report_step "dépendance installée : $pkg" 0
  else
    report_step "dépendance installée : $pkg" 1
    DEPS_OK=1
  fi
done

if [ "$DEPS_OK" -ne 0 ]; then
  red "Dépendances manquantes → lancement de 'npm install' dans client/ ..."
  ( cd "$CLIENT_DIR" && npm install ) || {
    red "Arrêt : 'npm install' a échoué."
    exit 1
  }
  green "npm install terminé, on continue."
fi

# --- Étape 3 : TypeScript compile sans erreur -------------------------------
bold "Étape 3/$STEPS — Vérification TypeScript"
if ( cd "$CLIENT_DIR" && npx tsc -b --pretty false ); then
  report_step "tsc -b : aucune erreur de type" 0
else
  report_step "tsc -b : aucune erreur de type" 1
fi

# --- Étape 4 : le build de production passe ---------------------------------
bold "Étape 4/$STEPS — Build de production"
if ( cd "$CLIENT_DIR" && npm run build ); then
  report_step "vite build : build de production OK" 0
  if [ -f "$CLIENT_DIR/dist/index.html" ]; then
    report_step "dist/index.html généré" 0
  else
    report_step "dist/index.html généré" 1
  fi
else
  report_step "vite build : build de production OK" 1
fi

# --- Bilan ------------------------------------------------------------------
echo
bold "=============================================="
bold " Bilan : $PASS OK / $FAIL échec(s)"
bold "=============================================="
[ "$FAIL" -eq 0 ] && green "SMOKE TEST ✅ VERT" || red "SMOKE TEST ❌ ROUGE"

[ "$FAIL" -eq 0 ] && exit 0 || exit 1
