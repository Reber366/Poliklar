/* ==========================================================
   PoliKlar – script.js
   Lädt die Wahlprogramm-Daten aus data/wahlprogramme.json und
   steuert: Vergleichs-Tool, Vorlesefunktion, Kontrast/Schrift-
   größe, Grundwissen-Bereich (Zeitleiste + Akkordeon) und Quiz.
   ========================================================== */

   const DATA_URL = "data/wahlprogramme.json";

   /* ---------------------------------------------------------
      1. Barrierefreiheit: Schriftgröße & Kontrast
      --------------------------------------------------------- */
   (function setupAccessibilityControls() {
     const root = document.documentElement;
     let scale = 1;
     const MIN = 0.85;
     const MAX = 1.35;
     const STEP = 0.1;
   
     document.getElementById("font-increase").addEventListener("click", () => {
       scale = Math.min(MAX, +(scale + STEP).toFixed(2));
       root.style.setProperty("--font-scale", scale);
     });
   
     document.getElementById("font-decrease").addEventListener("click", () => {
       scale = Math.max(MIN, +(scale - STEP).toFixed(2));
       root.style.setProperty("--font-scale", scale);
     });
   
     const contrastBtn = document.getElementById("contrast-toggle");
     contrastBtn.addEventListener("click", () => {
       const active = document.body.classList.toggle("high-contrast");
       contrastBtn.setAttribute("aria-pressed", String(active));
     });
   })();
   
   /* ---------------------------------------------------------
      2. Vergleichs-Tool: Daten laden & Auswahl steuern
      --------------------------------------------------------- */
   let poliklarData = null;
   
   async function loadData() {
     const statusEl = document.getElementById("tool-status");
     try {
       const response = await fetch(DATA_URL);
       if (!response.ok) throw new Error("Netzwerkantwort war nicht ok");
       poliklarData = await response.json();
       initToolControls();
     } catch (err) {
       console.error("Konnte Wahlprogramm-Daten nicht laden:", err);
       statusEl.textContent =
         "Die Daten konnten nicht geladen werden. Wenn du die Seite lokal " +
         "geöffnet hast, starte sie bitte über server.py (siehe README.md) " +
         "statt die index.html direkt im Browser zu öffnen.";
     }
   }
   
   function initToolControls() {
     const bundeslandSelect = document.getElementById("bundesland-select");
     const themaSelect = document.getElementById("thema-select");
   
     poliklarData.bundeslaender.forEach((land) => {
       const opt = document.createElement("option");
       opt.value = land;
       opt.textContent = land;
       bundeslandSelect.appendChild(opt);
     });
   
     poliklarData.themen.forEach((thema) => {
       const opt = document.createElement("option");
       opt.value = thema;
       opt.textContent = thema;
       themaSelect.appendChild(opt);
     });
   
     bundeslandSelect.addEventListener("change", renderComparison);
     themaSelect.addEventListener("change", renderComparison);
   
     renderComparison();
   }
   
   function renderComparison() {
     const land = document.getElementById("bundesland-select").value;
     const thema = document.getElementById("thema-select").value;
     const resultsEl = document.getElementById("party-results");
     const statusEl = document.getElementById("tool-status");
   
     resultsEl.innerHTML = "";
   
     const eintrag = poliklarData.positionen?.[land]?.[thema];
   
     if (!eintrag) {
       statusEl.textContent =
         `Wir arbeiten noch an der Übersicht für „${thema}“ in ${land}. ` +
         `Schau bald wieder vorbei!`;
       return;
     }
   
     statusEl.textContent = `Zusammenfassung für ${land} · Thema ${thema}`;
   
     // Parteien in fester, alphabetischer Reihenfolge anzeigen – neutral,
     // ohne eine Partei optisch hervorzuheben.
     poliklarData.parteien.forEach((partei) => {
       const info = eintrag[partei];
       const card = document.createElement("article");
       card.className = "party-card";
   
       const badge = document.createElement("div");
       badge.className = "party-badge";
       badge.textContent = initialsFor(partei);
       card.appendChild(badge);
   
       const h3 = document.createElement("h3");
       h3.textContent = partei;
       card.appendChild(h3);
   
       const p = document.createElement("p");
       if (info && info.text) {
         p.textContent = info.text;
       } else {
         p.textContent = "Für diese Partei liegt hier noch keine geprüfte Zusammenfassung vor.";
         p.classList.add("empty-note");
       }
       card.appendChild(p);
   
       if (info && info.quelle) {
         const link = document.createElement("a");
         link.className = "quelle-link";
         link.href = info.quelle;
         link.target = "_blank";
         link.rel = "noopener";
         link.textContent = "Quelle ansehen";
         card.appendChild(link);
       }
   
       resultsEl.appendChild(card);
     });
   }
   
   function initialsFor(parteiName) {
     return parteiName
       .split(/\s+/)
       .map((w) => w[0])
       .join("")
       .slice(0, 3)
       .toUpperCase();
   }
   
   /* ---------------------------------------------------------
      3. Vorlesefunktion (Web Speech API)
      --------------------------------------------------------- */
   document.getElementById("read-aloud-btn").addEventListener("click", () => {
     if (!("speechSynthesis" in window)) {
       alert("Dein Browser unterstützt die Vorlesefunktion leider nicht.");
       return;
     }
     const resultsEl = document.getElementById("party-results");
     const text = resultsEl.textContent.trim();
   
     if (!text) {
       alert("Bitte wähle zuerst ein Bundesland und ein Thema aus.");
       return;
     }
   
     window.speechSynthesis.cancel();
     const utterance = new SpeechSynthesisUtterance(text);
     utterance.lang = "de-DE";
     window.speechSynthesis.speak(utterance);
   });
   
   /* ---------------------------------------------------------
      4. Politisches Grundwissen: Zeitleiste & Akkordeon
      --------------------------------------------------------- */
   const TIMELINE = [
     { jahr: "1949", text: "Das Grundgesetz tritt in Kraft und die Bundesrepublik Deutschland wird gegründet." },
     { jahr: "1949", text: "Die erste Bundestagswahl findet statt." },
     { jahr: "1961", text: "Der Bau der Berliner Mauer teilt Deutschland für 28 Jahre." },
     { jahr: "1989", text: "Die Berliner Mauer fällt am 9. November." },
     { jahr: "1990", text: "Deutschland wird am 3. Oktober wiedervereinigt." },
     { jahr: "1994", text: "Der Bundestag beschließt den Umzug von Bonn nach Berlin." },
   ];
   
   const GRUNDWISSEN = [
     {
       frage: "Was ist der Unterschied zwischen Erststimme und Zweitstimme?",
       antwort:
         "Bei der Bundestagswahl hat jede wählende Person zwei Stimmen. Mit der " +
         "Erststimme wird eine Person direkt in ihrem Wahlkreis gewählt. Mit der " +
         "Zweitstimme wird eine Partei gewählt – sie entscheidet über die " +
         "Sitzverteilung im Bundestag.",
     },
     {
       frage: "Was macht der Bundesrat?",
       antwort:
         "Der Bundesrat vertritt die 16 Bundesländer auf Bundesebene. Er wirkt bei " +
         "vielen Bundesgesetzen mit, insbesondere wenn sie die Länder direkt betreffen.",
     },
     {
       frage: "Was regelt das Grundgesetz?",
       antwort:
         "Das Grundgesetz ist die Verfassung Deutschlands. Es legt die Grundrechte " +
         "fest und regelt den Aufbau des Staates, etwa das Zusammenspiel von Bund, " +
         "Ländern, Parlament und Regierung.",
     },
     {
       frage: "Wie oft finden Bundestagswahlen statt?",
       antwort: "In der Regel alle vier Jahre, sofern der Bundestag nicht vorher aufgelöst wird.",
     },
   ];
   
   function renderTimeline() {
     const list = document.getElementById("timeline-list");
     TIMELINE.forEach(({ jahr, text }) => {
       const li = document.createElement("li");
       li.innerHTML = `<span class="year">${jahr}</span><p>${text}</p>`;
       list.appendChild(li);
     });
   }
   
   function renderAccordion() {
     const container = document.getElementById("grundwissen-accordion");
     GRUNDWISSEN.forEach(({ frage, antwort }) => {
       const details = document.createElement("details");
       details.className = "accordion-item";
       const summary = document.createElement("summary");
       summary.textContent = frage;
       const p = document.createElement("p");
       p.textContent = antwort;
       details.appendChild(summary);
       details.appendChild(p);
       container.appendChild(details);
     });
   }
   
   /* ---------------------------------------------------------
      5. Quiz
      --------------------------------------------------------- */
   const QUIZ_QUESTIONS = [
     {
       frage: "Wie viele Bundesländer hat Deutschland?",
       optionen: ["13", "16", "18"],
       korrekt: 1,
       erklaerung: "Deutschland besteht aus 16 Bundesländern.",
     },
     {
       frage: "Ab welchem Alter darf man bei der Bundestagswahl wählen?",
       optionen: ["16 Jahre", "18 Jahre", "21 Jahre"],
       korrekt: 1,
       erklaerung: "Bei der Bundestagswahl liegt das Wahlalter bundesweit bei 18 Jahren.",
     },
     {
       frage: "Wofür steht die Zweitstimme bei der Bundestagswahl?",
       optionen: [
         "Für die Wahl einer Partei",
         "Für die Wahl der Bundeskanzlerin oder des Bundeskanzlers",
         "Für die Wahl des Bundespräsidenten",
       ],
       korrekt: 0,
       erklaerung: "Die Zweitstimme entscheidet über die Sitzverteilung der Parteien im Bundestag.",
     },
     {
       frage: "Was ist das Grundgesetz?",
       optionen: [
         "Ein Gesetz nur für Bayern",
         "Die Verfassung Deutschlands",
         "Ein Vertrag zwischen Parteien",
       ],
       korrekt: 1,
       erklaerung: "Das Grundgesetz ist die Verfassung der Bundesrepublik Deutschland.",
     },
     {
       frage: "Wer vertritt die Bundesländer auf Bundesebene?",
       optionen: ["Der Bundestag", "Der Bundesrat", "Das Bundeskabinett"],
       korrekt: 1,
       erklaerung: "Der Bundesrat vertritt die Interessen der 16 Bundesländer.",
     },
     {
       frage: "In welchem Jahr wurde Deutschland wiedervereinigt?",
       optionen: ["1949", "1989", "1990"],
       korrekt: 2,
       erklaerung: "Die Wiedervereinigung fand am 3. Oktober 1990 statt.",
     },
   ];
   
   let quizIndex = 0;
   let quizScore = 0;
   
   function setupQuiz() {
     document.getElementById("quiz-start-btn").addEventListener("click", startQuiz);
     document.getElementById("quiz-restart-btn").addEventListener("click", startQuiz);
     document.getElementById("quiz-next-btn").addEventListener("click", showNextQuestion);
   }
   
   function startQuiz() {
     quizIndex = 0;
     quizScore = 0;
     document.getElementById("quiz-start-screen").classList.add("hidden");
     document.getElementById("quiz-result-screen").classList.add("hidden");
     document.getElementById("quiz-question-screen").classList.remove("hidden");
     showQuestion();
   }
   
   function showQuestion() {
     const q = QUIZ_QUESTIONS[quizIndex];
     document.getElementById("quiz-progress").textContent =
       `Frage ${quizIndex + 1} von ${QUIZ_QUESTIONS.length}`;
     document.getElementById("quiz-question").textContent = q.frage;
   
     const optionsEl = document.getElementById("quiz-options");
     optionsEl.innerHTML = "";
   
     q.optionen.forEach((optionText, i) => {
       const btn = document.createElement("button");
       btn.type = "button";
       btn.textContent = optionText;
       btn.addEventListener("click", () => selectAnswer(i));
       optionsEl.appendChild(btn);
     });
   
     document.getElementById("quiz-feedback").classList.add("hidden");
     document.getElementById("quiz-next-btn").classList.add("hidden");
   }
   
   function selectAnswer(chosenIndex) {
     const q = QUIZ_QUESTIONS[quizIndex];
     const buttons = document.querySelectorAll("#quiz-options button");
     buttons.forEach((btn, i) => {
       btn.disabled = true;
       if (i === q.korrekt) btn.classList.add("correct");
       else if (i === chosenIndex) btn.classList.add("incorrect");
     });
   
     const feedbackEl = document.getElementById("quiz-feedback");
     feedbackEl.classList.remove("hidden");
   
     if (chosenIndex === q.korrekt) {
       quizScore++;
       feedbackEl.textContent = "Richtig! " + q.erklaerung;
     } else {
       feedbackEl.textContent = "Nicht ganz. " + q.erklaerung;
     }
   
     document.getElementById("quiz-next-btn").classList.remove("hidden");
   }
   
   function showNextQuestion() {
     quizIndex++;
     if (quizIndex < QUIZ_QUESTIONS.length) {
       showQuestion();
     } else {
       finishQuiz();
     }
   }
   
   function finishQuiz() {
     document.getElementById("quiz-question-screen").classList.add("hidden");
     document.getElementById("quiz-result-screen").classList.remove("hidden");
     document.getElementById("quiz-result-heading").textContent =
       `${quizScore} von ${QUIZ_QUESTIONS.length} richtig`;
   
     let text;
     if (quizScore === QUIZ_QUESTIONS.length) {
       text = "Stark! Du kennst dich mit dem politischen Grundwissen richtig gut aus.";
     } else if (quizScore >= QUIZ_QUESTIONS.length / 2) {
       text = "Gut gemacht! Ein Blick in den Grundwissen-Bereich lohnt sich trotzdem.";
     } else {
       text = "Kein Problem – im Grundwissen-Bereich oben findest du alle Antworten noch einmal erklärt.";
     }
     document.getElementById("quiz-result-text").textContent = text;
   }
   
   /* ---------------------------------------------------------
      6. Teilen
      --------------------------------------------------------- */
   function setupSharing() {
     const url = window.location.href;
     const title = document.title;
   
     document.getElementById("share-copy").addEventListener("click", async () => {
       try {
         await navigator.clipboard.writeText(url);
         const btn = document.getElementById("share-copy");
         const original = btn.textContent;
         btn.textContent = "Link kopiert!";
         setTimeout(() => (btn.textContent = original), 2000);
       } catch {
         alert(url);
       }
     });
   
     document.getElementById("share-whatsapp").href =
       `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`;
   }
   
   /* ---------------------------------------------------------
      Start
      --------------------------------------------------------- */
   document.addEventListener("DOMContentLoaded", () => {
     loadData();
     renderTimeline();
     renderAccordion();
     setupQuiz();
     setupSharing();
   });