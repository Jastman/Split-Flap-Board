# Flipflap

**Turn any TV into a retro split-flap display. The classic flip-board look, without the $3,500 hardware.**

Open-source, self-hostable, no subscriptions, no API keys required for core features.

## Features

- Pixel-perfect CSS 3D split-flap animation with synchronized click-clack audio (Web Audio API)
- Live data feeds — all from free, open, public sources:
  - **Weather** — Open-Meteo (no key required)
  - **Overhead Flights** — OpenSky Network ADS-B data
  - **News Headlines** — Configurable RSS feed
  - **Rocket Launches** — Space Devs Launch Library 2
  - **ISS Passes** — Celestrak TLE + orbital prediction
  - **Moon Phase** — Pure calculation, no API
  - **On This Day** — Wikipedia MediaWiki API
  - **Quote Library** — Bundled preset packs (Optimism, Meaning, Parenting, Universe)
- Timely filtering — ISS, launches, flights only appear when actually relevant
- Board layout presets: Classic TWA, London Kings Cross, Paris Gare du Nord, Amsterdam Schiphol, NYC Grand Central, Penn Station, Minimal Dark
- Full manual customization: colors, fonts, grid size, flip speed, wave delay, audio
- Config dashboard at `/config`
- PWA — install on any TV browser, works offline with last cached state
- MIT license

## Quick Start

### Development

```bash
git clone https://github.com/jastman/split-flap-board.git
cd split-flap-board
npm install
mkdir -p data
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to the board.

Settings are at [http://localhost:3000/config](http://localhost:3000/config).

### Docker (recommended for TV deployment)

```bash
docker compose up --build
```

The app will be available at `http://localhost:3000`. Data is persisted in a named Docker volume.

### One-click deploy

Copy `.env.example` to `.env` and set `SQLITE_PATH` if needed.

## Configuration

Visit `/config` to:

- **Feeds** — Enable/disable each data source, configure RSS URLs, search radius for flights, time windows for ISS/launches
- **Display** — Select a board preset (TWA, Kings Cross, Paris, etc.) or manually configure colors, fonts, grid size, flip speed
- **Schedule** — Set the rotation order and duration per feed slot
- **Messages** — Add custom messages and browse the preset quote library

## Data Sources

| Feed | API | Rate Limit | Notes |
|------|-----|------------|-------|
| Weather | [Open-Meteo](https://open-meteo.com) | 10k/day free | No key needed |
| Flights | [OpenSky Network](https://opensky-network.org) | 60 req/day anon | Cached 90s min |
| News | Any RSS feed | Unlimited | Default: BBC |
| Launches | [Space Devs LL2](https://thespacedevs.com) | 15/hr free | Only shows if <48h |
| ISS | [Celestrak](https://celestrak.org) | Unlimited | TLE cached 24h |
| Moon | Calculation | — | No API |
| Wikipedia | [MediaWiki](https://www.mediawiki.org/wiki/API:Main_page) | Unlimited | Cached daily |

## Architecture

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Animation**: Pure CSS 3D transforms — no canvas, no WebGL
- **Audio**: Web Audio API synthesized clicks — no audio files
- **Backend**: Next.js API routes + Node.js
- **Database**: SQLite via `better-sqlite3`
- **Deployment**: Multi-stage Docker, or any Node.js host

## License

MIT — see [LICENSE](LICENSE).

## Contributing

PRs welcome. See issues for ideas:
- Additional data feeds (Aurora/KP index, meteor showers, tide tables, transit arrivals)
- Calendar integration (Google Calendar OAuth, Apple iCal)
- Multi-board sync via WebSocket
- Additional board presets
