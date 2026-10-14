# Trinkgeld-Rechner

Eine kleine Expo-App (React Native, TypeScript) mit genau einem Bildschirm:
Der Nutzer gibt einen Betrag, einen Trinkgeld-Prozentsatz und eine Personenzahl
ein und sieht sofort das Trinkgeld, den Gesamtbetrag und den Betrag pro Person –
kaufmännisch auf volle Cent gerundet und mit zwei Nachkommastellen in deutscher
Schreibweise mit Euro-Zeichen angezeigt. Die Berechnung liegt in einer reinen,
UI-freien Funktion, die mit Jest-Unit-Tests abgesichert ist. Ungültige Eingaben
führen zu einer Fehlermeldung am betroffenen Feld statt zu einem Ergebnis.

Diese erste Ausbaustufe liefert das App-Gerüst: den einen Bildschirm, das
editierbare Betragsfeld und die Design-Tokens. Die weiteren Felder, die
Ergebniszeilen und die eigentliche Rechenlogik folgen in eigenen Tickets.

## Tech-Stack

- **Sprache:** TypeScript
- **Framework:** Expo / React Native (Expo SDK 57)
- **Web-Build:** `expo export --platform web` (React Native Web)
- **Tests:** Jest mit dem `jest-expo`-Preset und `@testing-library/react-native`

## Installation

Voraussetzung ist eine aktuelle Node.js-Laufzeit (LTS) mit npm.

```bash
npm ci
```

`npm ci` installiert exakt die in `package-lock.json` festgehaltenen
Abhängigkeiten. Ohne Lockfile-Datei genügt alternativ `npm install`.

## Starten (Entwicklung, Gerät oder Simulator)

Der Dev-Server wird mit Expo gestartet:

```bash
npm start
```

Expo zeigt anschließend einen QR-Code und Tastenkürzel an:

- **Android-Gerät/Emulator:** `a` drücken bzw. den QR-Code mit der Expo-Go-App scannen.
- **iOS-Simulator (macOS):** `i` drücken.
- **Web-Browser:** `w` drücken.

Alternativ direkt in den jeweiligen Modus starten:

```bash
npm run web
```

> Hinweis: `npm start` und `npm run web` starten einen Dev-Server, der so lange
> läuft, bis er beendet wird. Für einen einmaligen, endlichen Build siehe
> „Web-Build für Produktion“.

## Web-Build für Produktion

```bash
npm run build
```

Dies führt `expo export --platform web` aus und legt die fertigen statischen
Dateien im Ordner `dist/` ab. Der Ordner `dist/` ist das gebaute Produkt und
wird als statische Seite ausgeliefert. Die App benötigt dafür **keine
Umgebungsvariablen** und keine externen Schlüssel.

## Tests

```bash
npm test
```

Führt die Jest-Tests (Preset `jest-expo`) aus.

## Benutzung

Die App zeigt genau einen Bildschirm:

1. In das Feld **Betrag** tippen – die getippten Zeichen erscheinen sofort im
   Feld. Das Feld öffnet eine Dezimal-Tastatur und akzeptiert Punkt oder Komma
   als Dezimaltrennzeichen.
2. Sobald weitere Felder und die Berechnung ausgeliefert sind, füllt der Nutzer
   zusätzlich **Trinkgeld (%)** und **Personenzahl** aus; die Ergebniszeilen
   **Trinkgeld**, **Gesamt** und **Pro Person** werden dann bei jeder Eingabe
   sofort neu berechnet, ohne dass eine Schaltfläche gedrückt werden muss.

## Funktionen

- Ein einziger Bildschirm mit editierbarem Betragsfeld (echtes `TextInput` mit
  Dezimal-Tastatur und begrenzter Eingabelänge).
- Zentrale Design-Tokens in `src/theme.ts` (Farben, Abstände, Radien,
  Typografie) aus `DESIGN.md`.
- Reine, UI-freie Berechnungsfunktion `calculateTip(input: TipInput): TipResult`
  in `src/tip/calculateTip.ts` mit dem vollständigen Typvertrag in
  `src/tip/types.ts`.
- Läuft auf iOS, Android und im Web aus demselben Quellcode.
- Keine geheimen Werte im Repository; die App startet ohne externe Schlüssel.

## Projektstruktur

- `App.tsx` – App-Wurzel mit `SafeAreaProvider`, rendert den einen Bildschirm.
- `index.ts` – Expo-Einstiegspunkt (`registerRootComponent`).
- `src/screens/TipCalculatorScreen.tsx` – der einzige Bildschirm.
- `src/tip/types.ts` – geteilter Typvertrag (`TipInput`, `TipErrorCode`,
  `FieldErrors`, `TipResult`).
- `src/tip/calculateTip.ts` – reine Berechnungsfunktion.
- `src/theme.ts` – Design-Tokens aus `DESIGN.md`.
- `RUN.json` – wie das Produkt gebaut und ausgeliefert wird.
