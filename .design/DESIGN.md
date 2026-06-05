# Ember Studio
Source: https://designmd.ai/chef/ember-studio

## Overview
A warm, craft-focused design system for creative project management tools. The aesthetic blends terracotta warmth with modern minimalism — soft earth tones anchor the interface while amber accents draw attention to actions and progress. Designed for teams that value aesthetics alongside productivity. Both light and dark modes feel intentional, not just inverted. The overall mood is calm, focused, and subtly luxurious.

## Colors
- **Primary** (#C2410C): Terracotta — CTAs, active states, links, focus rings, progress indicators
- **Primary Hover** (#9A3412): Burnt sienna — hover states on primary elements
- **Accent** (#F59E0B): Amber — notifications, badges, highlights, new-item indicators
- **Neutral** (#78716C): Stone — muted text, placeholders, timestamps, metadata
- **Background** (#FAFAF9): Warm white page background with a hint of cream
- **Surface** (#F5F5F4): Cards, panels, modals — slightly warm off-white
- **Surface Raised** (#E7E5E4): Hover states, selected rows, active tabs
- **Text Primary** (#1C1917): Warm near-black — headings, body text, primary labels
- **Text Secondary** (#57534E): Warm gray — descriptions, captions, secondary info
- **Border** (#D6D3D1): Warm gray borders — card edges, dividers, input borders
- **Success** (#16A34A): Completed tasks, approved items, positive states
- **Warning** (#D97706): Due soon, needs attention, caution banners
- **Error** (#DC2626): Overdue, failed, destructive actions

## Typography
- **Display Font**: Playfair Display — loaded via next/font/google
- **Body Font**: Rubik (latin + hebrew subsets) — loaded via next/font/google
  - Rubik chosen over Source Sans 3 for full Hebrew script support

Display and heading text uses Playfair Display at bold weight with tight letter spacing. Body and UI text uses Rubik at regular (400) and semibold (600) weights.

Type scale: Display 64px, Headline 48px, Section heading 28px, Subhead 20px, Body 16px, Small 14px, Caption 12px.

## Elevation
Cards rest flat with a 1px warm border (#D6D3D1) and gain a soft shadow on hover (0 4px 16px rgba(28,25,23,0.06)). Modals use a larger shadow (0 24px 48px rgba(28,25,23,0.12)) with backdrop blur. Primary buttons gain a warm glow on hover (0 4px 12px rgba(194,65,12,0.25)).

## Components
- **Buttons**: Primary uses terracotta (#C2410C) fill, white text, 8px radius, semibold. Secondary: transparent bg + 1px stone border.
- **Cards**: Warm white surface (#F5F5F4), 1px border (#D6D3D1), 12px radius, 16px padding.
- **Inputs**: 1px border (#D6D3D1), surface background, 8px radius. Focus: terracotta border + warm ring.
- **Tabs**: Active tab: terracotta text, shadow. Inactive: stone text.

## Spacing
Base unit: 4px — scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80px.

## Do's and Don'ts
- Do use terracotta (#C2410C) only for interactive elements and active states
- Do maintain the 4px spacing grid consistently
- Do keep the warm tone — avoid cool grays or blue-tinted neutrals
- Don't use pure black or pure white — always use the warm palette values
- Don't add decorative elements — warmth comes from color, not ornament
