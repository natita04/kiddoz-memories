# Moments Design System
A playful, warm family scrapbook aesthetic. Soft pastels on cream — each child gets their own color family, creating a personal, joyful feel.

## Colors

### Neutrals
- **Cream** (#FBF6F0): Page background — warm, paper-like
- **Card** (#FFFFFF): Card surfaces
- **Ink** (#4B4358): Primary text — soft plum-charcoal
- **InkSoft** (#8E869C): Secondary text, labels, placeholders
- **Line** (#EFE7DE): Borders, dividers, hairlines

### Pastel Families (kid color assignment by `order` field)
Each family has three weights: soft (fill/bg), mid (border/ring), deep (text/accent).

| Family | Soft       | Mid        | Deep       | Assigned to |
|--------|-----------|-----------|-----------|-------------|
| Mint   | #DCF1E8   | #9FDCC1   | #3F9E78   | order 1     |
| Peach  | #FCE3D5   | #F7BD9C   | #E07F52   | order 2     |
| Sky    | #E0EEFB   | #A9D0F4   | #3E7FC4   | order 3     |
| Lav    | #EDE7FB   | #CBB8F2   | #7E5BC9   | order 4     |
| Rose   | #FBE2EC   | #F2B2CC   | #D2638E   | order 5     |

### Tag Colors
- funny → Mint | sweet → Peach | first-time → Sky | milestone → Lav | proud-moment → Rose

## Typography
- **Display**: Secular One (weight 400) — chunky playful headers, full Hebrew support
- **Round**: Varela Round (weight 400) — cute UI labels, buttons, pills
- **Body**: Rubik (latin + hebrew) — body text, inputs, running text

### Usage
- `font-display` (`--font-display`): h1/h2/h3, logo, kid name in profile hero
- `font-round` (`--font-round`): labels, pills, tags, buttons, nav items, stats
- `font-sans` / `--font-sans`: body text, story text in memory cards, inputs

## Elevation & Surfaces
- **Cards**: white bg, `border-radius: 24px`, `border: 1px solid #EFE7DE`, `box-shadow: 0 6px 22px rgba(75,67,88,0.08)`
- **Modals**: white bg, `border-radius: 28px`, `box-shadow: 0 20px 60px rgba(75,67,88,0.22)`
- **Kid hero**: `border-radius: 28px`, gradient from kid's `soft` → `mid` at 40% opacity
- **Stat chips**: `rgba(255,255,255,0.72)` bg, `border-radius: 16px`, `backdrop-filter: blur(2px)`

## Components

### Navigation (Nav)
Two rows:
1. Logo row: cream bg, 💛 emoji in peach-soft rotated square + "הזכרונות שלנו" in Secular One
2. Kid pills row: pill-shaped tabs with emoji avatar (👦/👧). Active: kid's soft/mid/deep. Inactive: transparent.

### Kid Profile (KidProfile)
Gradient hero card: `linear-gradient(135deg, kid.soft, kid.mid at 40% opacity)`. Avatar: rounded square (32% radius), rotated -3deg, white ring + colored outer ring. Stats: white glass chips with backdrop-filter blur.

### Memory Card (MemoryCard)
- First photo: full-width hero at 220px height
- Extra photos: `+N` badge bottom-left (dark glass pill)
- Options `···` button: absolute top-left, white pill with soft shadow
- Tags: colored pills using each tag's color family
- Footer: tags left, date+age right, separated by a `#EFE7DE` top border

### Memory Modal (MemoryModal)
- 28px radius, heavy shadow
- Labels: Varela Round 13.5px inkSoft
- Tags: color-coded toggles (active = tag's soft/mid/deep, inactive = #FAFAF8)
- Dropzone: 18px radius, peach icon, #FAFAF8 bg
- Submit button: pill, peach-deep bg, white text

### Password Gate (PasswordGate)
Cream page bg, logo icon (peach-soft rotated square, 💛), white card with 24px radius and soft shadow. Submit: peach pill. Guest: outline pill.

## Spacing
Base 4px grid — components use 8/12/14/16/18/20/24/28px padding.

## Dark Mode
Background: dark plum `hsl(265 14% 12%)`, Card: `hsl(265 14% 16%)`. All pastel values remain the same (they pop well on dark plum).
