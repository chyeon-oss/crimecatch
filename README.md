# CaseNote Investigations

Create a web-based single-player detective mystery game.



The product concept is:

A user plays as a detective, selects a crime case, reviews the case file, investigates evidence, interrogates suspects, and finally submits who they think the culprit is.



For the first version, build only the basic frontend structure.



Design style:



- Premium dark mystery theme

- Cinematic, noir-inspired UI

- Mobile-first responsive design

- Korean language UI

- Elegant cards, subtle shadows, clean typography

- Serious detective/crime investigation mood, not cartoonish



Pages to create:



1. Home Page



- App name: "CaseNote"

- Tagline: "당신은 탐정입니다. 사건의 진실을 밝혀내세요."

- Show a list of case cards

- Each case card should include:

  - Case title

  - Difficulty

  - Estimated play time

  - Short description

  - Status badge: 무료 / 신규 / 프리미엄

  - Button: "사건 시작"



Use 3 sample cases:



- 한밤의 사무실 살인사건

- 상속 파티의 비밀

- 사라진 아이돌 연습생



2. ㆍ Detail Page

   When the user clicks a case card, move to a case detail page.



The page should include:



- Case title

- Case overview

- Victim information

- Incident time

- Incident location

- Difficulty

- Estimated play time

- Start investigation button: "수사 시작"



3. Investigation Page Placeholder

   After clicking "수사 시작", show an investigation dashboard placeholder.



The dashboard should have four main sections:



- 사건 개요

- 증거 보관함

- 용의자 목록

- 추리 노트



For now, use mock data only. Do not connect to any database yet. Do not implement AI chat yet.



Navigation:



- Home → Case Detail → Investigation

- Add a back button where appropriate



Important:



- Keep the code clean and modular

- Use reusable components for CaseCard, CaseDetail, InvestigationSection

- Prepare the structure so that later we can add Supabase, AI interrogation, evidence modals, and final culprit selection.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://crimecatch.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b5a035b8-8981-4221-9685-9d94f3ece9c2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
