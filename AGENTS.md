# DOUSEEME PHASER — AGENT CONTEXT

This is a Phaser 3 + Vite JavaScript project.

## Game Concept

DOUSEEME is a top-down asymmetrical sci-fi horror game.

A blind monster hunts a human survivor aboard a massive futuristic interstellar cruise ship.

The monster does not see normally.
It hunts using:
- sound
- footsteps
- vibration ripples
- scent trails
- environmental clues

The human tries to:
- find a key
- reach an exit door
- distract the monster
- survive using stealth and environment

The human is not a fighter.

## Core Design

This game is about:
- tension
- uncertainty
- hunting
- sensory perception
- sound and smell
- cat-and-mouse survival

It is NOT about:
- weapons
- combat
- health bars
- shooting

## Development Rules

- Work in small steps.
- Do not rewrite the whole project.
- Keep code modular.
- Use Phaser 3 systems/scenes/entities.
- Use JavaScript.
- No React unless explicitly requested.
- Start with simple placeholders before final art.
- Keep the game top-down.
- Keep the visual style dark, minimal, sci-fi horror.

## Planned Structure

src/
  main.js
  scenes/
    BootScene.js
    GameScene.js
  entities/
    Monster.js
    Human.js
    Key.js
    Door.js
  systems/
    soundRippleSystem.js
    scentSystem.js
    inputSystem.js
  data/
    gameConfig.js

## First Goal

Create a basic Phaser 3 scene:
- dark background
- one white monster placeholder
- monster moves toward mouse cursor
- simple camera
- no human yet
- no sound yet
- no smell yet
## Old Monster Reference

We have an older DOUSEEME prototype with a working procedural monster.

When rebuilding in Phaser 3:
- use the old monster code as visual and behavior reference
- preserve the long skeletal segmented creature look
- preserve organic movement
- preserve thin white line rendering
- preserve horror biomechanical feeling

Do not replace the monster with a simple circle or generic sprite.

The Phaser version should recreate the old monster using Phaser Graphics or clean Phaser-compatible logic.

The old code can be used as reference only.
The new implementation should fit the Phaser 3 project structure.