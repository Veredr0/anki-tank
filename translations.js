// ─── Translations ─────────────────────────────────────────────────
// Flat dot-notation keys. Add new strings here in both EN and FR.
// The t() function falls back to the raw key if a string is missing.
window.TRANSLATIONS = {
  EN: {
    /* ── TopBar ─────────────────────────────────────────────────── */
    "topbar.subtitle":               "FIELD TRAINING DECK · WWII → PRESENT",

    /* ── Hub — main menu ────────────────────────────────────────── */
    "hub.tagline":                   "FIELD TRAINING — VEHICLE IDENTIFICATION PROGRAM",
    "hub.active_operative":          "ACTIVE OPERATIVE",
    "hub.log_out":                   "LOG OUT",
    "hub.enlist":                    "ENLIST",
    "hub.report_for_duty":           "REPORT FOR DUTY",
    "hub.must_auth":                 "⚠ MUST ENLIST OR REPORT FOR DUTY BEFORE DEPLOYING",
    "hub.loading":                   "LOADING INTEL...",

    "hub.quick_deployment":          "QUICK DEPLOYMENT",
    "hub.quick_deployment.sub":      "All vehicles · start immediately",
    "hub.mission_select":            "MISSION SELECT",
    "hub.mission_select.sub":        "Choose nations & eras",
    "hub.intel_database":            "INTEL DATABASE",
    "hub.intel_database.sub":        "Search vehicle records",
    "hub.theater_standings":         "THEATER STANDINGS",
    "hub.theater_standings.sub":     "Leaderboard",

    /* ── Enlist form ────────────────────────────────────────────── */
    "enlist.title":                  "PERSONNEL ENLISTMENT — NEW RECRUIT",
    "enlist.callsign_label":         "ASSIGN CALLSIGN (NICKNAME)",
    "enlist.password_label":         "SET AUTHENTICATION CODE (PASSWORD)",
    "enlist.confirm_label":          "CONFIRM AUTHENTICATION CODE",
    "enlist.stand_down":             "← STAND DOWN",
    "enlist.submit":                 "ENLIST NOW →",
    "enlist.processing":             "PROCESSING…",
    "enlist.err.callsign_required":  "CALLSIGN REQUIRED",
    "enlist.err.callsign_short":     "CALLSIGN TOO SHORT — MINIMUM 3 CHARACTERS",
    "enlist.err.callsign_long":      "CALLSIGN TOO LONG — MAXIMUM 20 CHARACTERS",
    "enlist.err.callsign_invalid":   "INVALID CALLSIGN — LETTERS, NUMBERS, AND _ - . ONLY",
    "enlist.err.callsign_taken":     "CALLSIGN ALREADY CLAIMED — CHOOSE ANOTHER",
    "enlist.err.password_required":  "AUTHENTICATION CODE REQUIRED",
    "enlist.err.password_short":     "AUTHENTICATION CODE TOO SHORT — MINIMUM 6 CHARACTERS",
    "enlist.err.password_mismatch":  "AUTHENTICATION CODES DO NOT MATCH",

    /* ── Login form ─────────────────────────────────────────────── */
    "login.title":                   "PERSONNEL AUTHENTICATION — REPORT FOR DUTY",
    "login.callsign_label":          "CALLSIGN",
    "login.password_label":          "AUTHENTICATION CODE",
    "login.stand_down":              "← STAND DOWN",
    "login.submit":                  "REPORT FOR DUTY →",
    "login.verifying":               "VERIFYING…",
    "login.err.callsign_required":   "CALLSIGN REQUIRED",
    "login.err.password_required":   "AUTHENTICATION CODE REQUIRED",
    "login.err.auth_failed":         "AUTHENTICATION FAILED — CHECK YOUR CODE",
    "login.err.not_recognised":      "CALLSIGN NOT RECOGNISED — ENLIST FIRST",

    /* ── Mission select ─────────────────────────────────────────── */
    "mission.title":                 "MISSION SELECT — CONFIGURE DEPLOYMENT",
    "mission.vehicle":               "VEHICLE",
    "mission.vehicles":              "VEHICLES",
    "mission.in_pool":               "IN POOL",
    "mission.nations":               "NATIONS",
    "mission.era":                   "ERA",
    "mission.all":                   "ALL",
    "mission.none":                  "NONE",
    "mission.back":                  "← BACK",
    "mission.deploy":                "DEPLOY →",
    "mission.need_4":                "SELECT AT LEAST 4 VEHICLES TO DEPLOY",
    "mission.must_auth":             "⚠ MUST ENLIST OR REPORT FOR DUTY BEFORE DEPLOYING",

    /* ── Search ─────────────────────────────────────────────────── */
    "search.title":                  "INTEL DATABASE — VEHICLE SEARCH",
    "search.placeholder":            "Search by name, nation, type, era, BR…",
    "search.no_records":             "NO RECORDS FOUND",
    "search.back":                   "← BACK",

    /* ── Leaderboard ────────────────────────────────────────────── */
    "lb.title":                      "THEATER STANDINGS — LEADERBOARD",
    "lb.no_operatives":              "NO OPERATIVES ON RECORD",
    "lb.rank":                       "#",
    "lb.callsign":                   "CALLSIGN",
    "lb.score":                      "SCORE",
    "lb.accuracy":                   "ACCURACY",
    "lb.mastered":                   "MASTERED",
    "lb.you":                        "YOU",
    "lb.score.desc":                 "Total correct answers",
    "lb.accuracy.desc":              "% of correct over all attempts",
    "lb.mastered.desc":              "Vehicles with 3+ consecutive correct",
    "lb.back":                       "← BACK",

    /* ── Dossier modal ──────────────────────────────────────────── */
    "dossier.title":                 "CLASSIFIED VEHICLE DOSSIER",
    "dossier.close":                 "CLOSE DOSSIER ×",
    "dossier.fig_a":                 "FIG. A — IDENTIFICATION PLATE",
    "dossier.identified":            "IDENTIFIED",
    "dossier.side_view":             "SIDE VIEW · FIELD MANUAL",
    "dossier.scale":                 "SCALE 1:60",
    "dossier.designation":           "DESIGNATION",
    "dossier.how_to_spot":           "HOW TO SPOT IT",
    "dossier.field_note":            "FIELD NOTE",
    "dossier.origin_masked":         "ORIGIN ████",

    /* ── Dossier field labels (shared hub + game) ───────────────── */
    "field.dossier":                 "DOSSIER",
    "field.origin":                  "ORIGIN",
    "field.year":                    "YEAR",
    "field.crew":                    "CREW",
    "field.main_gun":                "MAIN GUN",
    "field.era":                     "ERA",
    "field.type":                    "TYPE",
    "field.family":                  "FAMILY",
    "field.battle_rating":           "BATTLE RATING",
    "field.rank":                    "RANK",
    "field.nickname":                "NICKNAME",

    /* ── Bug report modal (both pages) ─────────────────────────── */
    "bug.btn_label":                 "⚑ REPORT",
    "bug.btn_tooltip":               "Report an issue",
    "bug.title":                     "REPORT AN ISSUE",
    "bug.issue_type":                "ISSUE TYPE",
    "bug.desc_label":                "DESCRIPTION (OPTIONAL)",
    "bug.desc_placeholder":          "Add details…",
    "bug.cancel":                    "CANCEL",
    "bug.submit":                    "SUBMIT REPORT",
    "bug.sending":                   "SENDING…",
    "bug.success":                   "✓ REPORT SUBMITTED — THANK YOU",
    "bug.error":                     "✗ SUBMISSION FAILED — TRY AGAIN",
    "bug.opt.wrong_image":           "Wrong image",
    "bug.opt.wrong_name":            "Wrong name / designation",
    "bug.opt.wrong_stats":           "Wrong stats",
    "bug.opt.other":                 "Other",
    "bug.tank_label":                "Tank:",

    /* ── Game — header ──────────────────────────────────────────── */
    "game.streak":                   "STREAK",
    "game.debrief":                  "← DEBRIEF",

    /* ── Game — mode labels ─────────────────────────────────────── */
    "game.mode.free_recall":         "FREE RECALL — TYPE THE DESIGNATION",
    "game.mode.variant":             "VARIANT CHALLENGE",
    "game.mode.identify":            "IDENTIFY THE VEHICLE",

    /* ── Game — card overlays ───────────────────────────────────── */
    "game.fig_a":                    "FIG. A — IDENTIFICATION PLATE",
    "game.side_view":                "SIDE VIEW · FIELD MANUAL",
    "game.scale":                    "SCALE 1:60",
    "game.stamp.identified":         "IDENTIFIED",
    "game.stamp.recall":             "RECALL",
    "game.stamp.variant":            "VARIANT?",
    "game.stamp.unknown":            "UNKNOWN",
    "game.designation":              "DESIGNATION",
    "game.origin_masked":            "ORIGIN ████",

    /* ── Game — write mode ──────────────────────────────────────── */
    "game.hint.variants":            "All options are from the same vehicle family",
    "game.hint.write":               "Type the vehicle designation — close spelling accepted",
    "game.input.placeholder":        "Enter designation…",
    "game.result.correct":           "✓ CORRECT",
    "game.result.wrong":             "✗ WRONG",
    "game.btn.verify":               "VERIFY IDENTIFICATION",

    /* ── Game — bottom HUD ──────────────────────────────────────── */
    "game.hud.pick":                 "PICK A NAME · or press 1–4",
    "game.hud.type":                 "TYPE THE DESIGNATION · ENTER TO CONFIRM",
    "game.hud.reveal":               "PRESS SPACE → REVEAL INTEL",
    "game.hud.next":                 "PRESS SPACE → NEXT VEHICLE",
    "game.btn.waiting":              "WAITING…",
    "game.btn.reveal":               "REVEAL INTEL",
    "game.btn.next":                 "NEXT VEHICLE ▶",
    "game.priority":                 "PRIORITY",
    "game.how_to_spot":              "HOW TO SPOT IT",
    "game.field_note":               "FIELD NOTE",
    "game.loading":                  "LOADING FIELD INTEL...",

    /* ── Game — fallback image ──────────────────────────────────── */
    "game.fig_silhouette":           "FIG. — SILHOUETTE",
    "game.photo_offline":            "photograph offline · silhouette reference",
  },

  FR: {
    /* ── TopBar ─────────────────────────────────────────────────── */
    "topbar.subtitle":               "CARTES D'INSTRUCTION · WWII → PRÉSENT",

    /* ── Hub — main menu ────────────────────────────────────────── */
    "hub.tagline":                   "INSTRUCTION — PROGRAMME D'IDENTIFICATION DE VÉHICULES",
    "hub.active_operative":          "OPÉRATEUR ACTIF",
    "hub.log_out":                   "DÉCONNEXION",
    "hub.enlist":                    "S'ENRÔLER",
    "hub.report_for_duty":           "PRENDRE SON POSTE",
    "hub.must_auth":                 "⚠ ENRÔLEZ-VOUS OU PRENEZ VOTRE POSTE AVANT DE DÉPLOYER",
    "hub.loading":                   "CHARGEMENT DES RENSEIGNEMENTS...",

    "hub.quick_deployment":          "DÉPLOIEMENT RAPIDE",
    "hub.quick_deployment.sub":      "Tous les véhicules · démarrer immédiatement",
    "hub.mission_select":            "SÉLECTION DE MISSION",
    "hub.mission_select.sub":        "Choisir nations & ères",
    "hub.intel_database":            "BASE DE RENSEIGNEMENTS",
    "hub.intel_database.sub":        "Rechercher des dossiers de véhicules",
    "hub.theater_standings":         "CLASSEMENT DU THÉÂTRE",
    "hub.theater_standings.sub":     "Tableau des scores",

    /* ── Enlist form ────────────────────────────────────────────── */
    "enlist.title":                  "ENRÔLEMENT — NOUVELLE RECRUE",
    "enlist.callsign_label":         "ATTRIBUER UN INDICATIF (SURNOM)",
    "enlist.password_label":         "DÉFINIR UN CODE D'AUTHENTIFICATION (MOT DE PASSE)",
    "enlist.confirm_label":          "CONFIRMER LE CODE D'AUTHENTIFICATION",
    "enlist.stand_down":             "← ANNULER",
    "enlist.submit":                 "S'ENRÔLER →",
    "enlist.processing":             "TRAITEMENT EN COURS…",
    "enlist.err.callsign_required":  "INDICATIF REQUIS",
    "enlist.err.callsign_short":     "INDICATIF TROP COURT — MINIMUM 3 CARACTÈRES",
    "enlist.err.callsign_long":      "INDICATIF TROP LONG — MAXIMUM 20 CARACTÈRES",
    "enlist.err.callsign_invalid":   "INDICATIF INVALIDE — LETTRES, CHIFFRES ET _ - . UNIQUEMENT",
    "enlist.err.callsign_taken":     "INDICATIF DÉJÀ PRIS — CHOISISSEZ-EN UN AUTRE",
    "enlist.err.password_required":  "CODE D'AUTHENTIFICATION REQUIS",
    "enlist.err.password_short":     "CODE TROP COURT — MINIMUM 6 CARACTÈRES",
    "enlist.err.password_mismatch":  "LES CODES D'AUTHENTIFICATION NE CORRESPONDENT PAS",

    /* ── Login form ─────────────────────────────────────────────── */
    "login.title":                   "AUTHENTIFICATION — PRISE DE POSTE",
    "login.callsign_label":          "INDICATIF",
    "login.password_label":          "CODE D'AUTHENTIFICATION",
    "login.stand_down":              "← ANNULER",
    "login.submit":                  "PRENDRE SON POSTE →",
    "login.verifying":               "VÉRIFICATION…",
    "login.err.callsign_required":   "INDICATIF REQUIS",
    "login.err.password_required":   "CODE D'AUTHENTIFICATION REQUIS",
    "login.err.auth_failed":         "ÉCHEC D'AUTHENTIFICATION — VÉRIFIEZ VOTRE CODE",
    "login.err.not_recognised":      "INDICATIF NON RECONNU — ENRÔLEZ-VOUS D'ABORD",

    /* ── Mission select ─────────────────────────────────────────── */
    "mission.title":                 "SÉLECTION DE MISSION — CONFIGURER LE DÉPLOIEMENT",
    "mission.vehicle":               "VÉHICULE",
    "mission.vehicles":              "VÉHICULES",
    "mission.in_pool":               "DANS LE POOL",
    "mission.nations":               "NATIONS",
    "mission.era":                   "ÈRE",
    "mission.all":                   "TOUS",
    "mission.none":                  "AUCUN",
    "mission.back":                  "← RETOUR",
    "mission.deploy":                "DÉPLOYER →",
    "mission.need_4":                "SÉLECTIONNEZ AU MOINS 4 VÉHICULES POUR DÉPLOYER",
    "mission.must_auth":             "⚠ ENRÔLEZ-VOUS OU PRENEZ VOTRE POSTE AVANT DE DÉPLOYER",

    /* ── Search ─────────────────────────────────────────────────── */
    "search.title":                  "BASE DE RENSEIGNEMENTS — RECHERCHE DE VÉHICULES",
    "search.placeholder":            "Rechercher par nom, nation, type, ère, BR…",
    "search.no_records":             "AUCUN DOSSIER TROUVÉ",
    "search.back":                   "← RETOUR",

    /* ── Leaderboard ────────────────────────────────────────────── */
    "lb.title":                      "CLASSEMENT DU THÉÂTRE — TABLEAU DES SCORES",
    "lb.no_operatives":              "AUCUN OPÉRATEUR ENREGISTRÉ",
    "lb.rank":                       "#",
    "lb.callsign":                   "INDICATIF",
    "lb.score":                      "SCORE",
    "lb.accuracy":                   "PRÉCISION",
    "lb.mastered":                   "MAÎTRISÉS",
    "lb.you":                        "VOUS",
    "lb.score.desc":                 "Total des réponses correctes",
    "lb.accuracy.desc":              "% de réponses correctes sur l'ensemble des tentatives",
    "lb.mastered.desc":              "Véhicules avec 3+ bonnes réponses consécutives",
    "lb.back":                       "← RETOUR",

    /* ── Dossier modal ──────────────────────────────────────────── */
    "dossier.title":                 "DOSSIER DE VÉHICULE CLASSIFIÉ",
    "dossier.close":                 "FERMER LE DOSSIER ×",
    "dossier.fig_a":                 "FIG. A — PLAQUE D'IDENTIFICATION",
    "dossier.identified":            "IDENTIFIÉ",
    "dossier.side_view":             "VUE DE CÔTÉ · MANUEL DE TERRAIN",
    "dossier.scale":                 "ÉCHELLE 1:60",
    "dossier.designation":           "DÉSIGNATION",
    "dossier.how_to_spot":           "COMMENT LE REPÉRER",
    "dossier.field_note":            "NOTE DE TERRAIN",
    "dossier.origin_masked":         "ORIGINE ████",

    /* ── Dossier field labels (shared hub + game) ───────────────── */
    "field.dossier":                 "DOSSIER",
    "field.origin":                  "ORIGINE",
    "field.year":                    "ANNÉE",
    "field.crew":                    "ÉQUIPAGE",
    "field.main_gun":                "CANON PRINCIPAL",
    "field.era":                     "ÈRE",
    "field.type":                    "TYPE",
    "field.family":                  "FAMILLE",
    "field.battle_rating":           "COTE DE COMBAT",
    "field.rank":                    "RANG",
    "field.nickname":                "SURNOM",

    /* ── Bug report modal (both pages) ─────────────────────────── */
    "bug.btn_label":                 "⚑ SIGNALER",
    "bug.btn_tooltip":               "Signaler un problème",
    "bug.title":                     "SIGNALER UN PROBLÈME",
    "bug.issue_type":                "TYPE DE PROBLÈME",
    "bug.desc_label":                "DESCRIPTION (FACULTATIF)",
    "bug.desc_placeholder":          "Ajouter des détails…",
    "bug.cancel":                    "ANNULER",
    "bug.submit":                    "SOUMETTRE LE RAPPORT",
    "bug.sending":                   "ENVOI EN COURS…",
    "bug.success":                   "✓ RAPPORT SOUMIS — MERCI",
    "bug.error":                     "✗ ÉCHEC DE L'ENVOI — RÉESSAYEZ",
    "bug.opt.wrong_image":           "Image incorrecte",
    "bug.opt.wrong_name":            "Nom / désignation incorrect",
    "bug.opt.wrong_stats":           "Statistiques incorrectes",
    "bug.opt.other":                 "Autre",
    "bug.tank_label":                "Char :",

    /* ── Game — header ──────────────────────────────────────────── */
    "game.streak":                   "SÉRIE",
    "game.debrief":                  "← DÉBRIEFING",

    /* ── Game — mode labels ─────────────────────────────────────── */
    "game.mode.free_recall":         "RAPPEL LIBRE — TAPEZ LA DÉSIGNATION",
    "game.mode.variant":             "DÉFI VARIANTE",
    "game.mode.identify":            "IDENTIFIEZ LE VÉHICULE",

    /* ── Game — card overlays ───────────────────────────────────── */
    "game.fig_a":                    "FIG. A — PLAQUE D'IDENTIFICATION",
    "game.side_view":                "VUE DE CÔTÉ · MANUEL DE TERRAIN",
    "game.scale":                    "ÉCHELLE 1:60",
    "game.stamp.identified":         "IDENTIFIÉ",
    "game.stamp.recall":             "RAPPEL",
    "game.stamp.variant":            "VARIANTE?",
    "game.stamp.unknown":            "INCONNU",
    "game.designation":              "DÉSIGNATION",
    "game.origin_masked":            "ORIGINE ████",

    /* ── Game — write mode ──────────────────────────────────────── */
    "game.hint.variants":            "Toutes les options proviennent de la même famille de véhicules",
    "game.hint.write":               "Tapez la désignation du véhicule — orthographe approchante acceptée",
    "game.input.placeholder":        "Entrez la désignation…",
    "game.result.correct":           "✓ CORRECT",
    "game.result.wrong":             "✗ INCORRECT",
    "game.btn.verify":               "VÉRIFIER L'IDENTIFICATION",

    /* ── Game — bottom HUD ──────────────────────────────────────── */
    "game.hud.pick":                 "CHOISISSEZ UN NOM · ou appuyez sur 1–4",
    "game.hud.type":                 "TAPEZ LA DÉSIGNATION · ENTRÉE POUR CONFIRMER",
    "game.hud.reveal":               "ESPACE → RÉVÉLER LES RENSEIGNEMENTS",
    "game.hud.next":                 "ESPACE → VÉHICULE SUIVANT",
    "game.btn.waiting":              "EN ATTENTE…",
    "game.btn.reveal":               "RÉVÉLER LES RENSEIGNEMENTS",
    "game.btn.next":                 "VÉHICULE SUIVANT ▶",
    "game.priority":                 "PRIORITÉ",
    "game.how_to_spot":              "COMMENT LE REPÉRER",
    "game.field_note":               "NOTE DE TERRAIN",
    "game.loading":                  "CHARGEMENT DES RENSEIGNEMENTS...",

    /* ── Game — fallback image ──────────────────────────────────── */
    "game.fig_silhouette":           "FIG. — SILHOUETTE",
    "game.photo_offline":            "photo hors ligne · référence silhouette",
  },
};
