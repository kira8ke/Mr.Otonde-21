# Nigel Turns 21 — Goals Site

A one-page interactive birthday site: drive-in intro, a spin-the-wheel that
unlocks one goal box per visit, and a 21-box grid styled after your gift-box
artwork.

## Files

```
nigel-birthday/
├── index.html       page structure (all 3 screens + modal)
├── styles.css        jungle green + gold theme, Henny Penny + Baloo 2
├── assets.js         embedded artwork (your uploaded images, as base64)
├── cards-data.js     <- YOU EDIT THIS to add real goal content
└── script.js         intro sequence, wheel logic, grid, sounds, confetti
```

## How the flow works right now

1. **Intro** — his car drives in (vroom sound), then two lines type out one
   after another, then a "SPIN THE WHEEL" button appears.
2. **Wheel** — a 21-slice wheel (numbers 1–21), gold slices at 1, 21, 15, 4.
   Spinning picks a number at random (any of the 21, every time — see the note
   below) and reveals it with confetti.
3. **Grid** — all 21 boxes shown, 5 per row (auto-adjusts to 3 then 2 per row
   on smaller screens). Only the box matching this visit's spin is
   unlocked and clickable; the rest are visibly numbered but locked/greyed
   out. Clicking the unlocked box plays a lid-flip + ribbon sound, bursts
   confetti from the box, and opens a card with the goal's title and
   description.

Boxes 1, 21, 15, and 4 use the green-and-gold ribbon box art; the other 17
use the plain jungle-green box art.

## Important design decision — please confirm this is what you want

You described the mechanic as "every time he opens the website" he spins and
gets **one** random number, and "only that goal will be unlocked, all others
locked." I built it exactly that way: **each visit is independent** — nothing
is remembered between visits, the wheel can land on a number he's already
seen before, and previously-seen goals go back to being locked (though still
visible) until the wheel happens to land on them again.

If instead you want it to **progress toward completion** — e.g. the wheel
only offers numbers he hasn't unlocked yet, and once a box is opened it
*stays* unlocked forever on his device — that's a very doable change (just
needs `localStorage` to remember progress). Happy to build that version
instead if it fits what you pictured better; just say the word.

## Adding the real content

Open `cards-data.js`. Each of the 21 entries looks like this:

```js
CARDS_DATA[2] = {
  id: 3,
  isGold: false,
  title: "Launch Notify AI Technologies",
  description: "Take the platform from prototype to something real people rely on.",
  image: "" // optional — see below
};
```

Send me the 21 pieces of content (title + description, and photos if you want
them) in whatever order is easiest for you, and I'll drop them straight into
this file exactly where you tell me — you won't need to touch code at all.

### Adding a photo to a specific card

1. Create a folder next to `cards-data.js` called `photos` and put the image
   there, e.g. `photos/goal-3.jpg`.
2. Set that card's `image` field to `"photos/goal-3.jpg"`.
3. It'll show above the title inside that goal's card when it's opened.

## Trying it locally

Because everything (including the images) is embedded directly in the JS
files, you can just **double-click `index.html`** — no local server needed,
unlike a site that fetches external data.

## A note on the wheel and box artwork

The spinning wheel is built entirely in code (numbered slices in your
green/gold palette) rather than using the stock wheel graphic you sent —
a flat image can't actually rotate accurately against a fixed pointer, so a
coded version was the only way to make it truly spin and land correctly.
Same idea for the "number bursting out of a box" opening effect: it's an
original confetti + lid-flip animation built in code, inspired by that idea,
rather than a reproduction of the stock graphic. The two gift-box images and
the driving character are the ones actually used throughout the site.

## Sound

All sound effects (the engine vroom, the wheel ticking, the ding, the ribbon
rustle, the box pop) are synthesized live in the browser with the Web Audio
API — no external audio files, so nothing will ever show up "missing" no
matter where you host or send this.
