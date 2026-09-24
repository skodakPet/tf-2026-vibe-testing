# Core features — Foodora (spec: spec/foodora-spec.md)

## Basic flow
1. FD-01 · Browse restaurants → FD-02 · Search and filter → FD-03 · Restaurant menu → FD-05 · Cart → FD-06 · Checkout → FD-07 · Confirmation and tracking → FD-08 · Page not found

## Core features
| # | ID | Feature | Source | Rules | Tested rules | Note |
| - | -- | ------- | ------ | ----- | ------------ | ---- |
| 1 | FD-01 | Browse restaurants | spec | 5 | 5 | |
| 2 | FD-02 | Search and filter | spec | 6 | 6 | |
| 3 | FD-03 | Restaurant menu | spec | 6 | 0 | |
| 4 | FD-05 | Cart | spec | 8 | 0 | |
| 5 | FD-06 | Checkout | spec | 4 | 0 | |
| 6 | FD-07 | Confirmation and tracking | spec | 7 | 0 | |
| 7 | FD-08 | Page not found | spec | 1 | 0 | |

## Traceability
### FD-01 · Browse restaurants
| Rule | Rule text (short) | Tests | Status |
| ---- | ----------------- | ----- | ------ |
| FD-01.1 | Card shows name, cuisines, rating, delivery time range, delivery fee (or Free) | `tests/fd-01.spec.ts` › FD-01.1 · Card shows name, cuisines, rating, delivery time range, delivery fee (or Free) | PASS |
| FD-01.2 | Card shows current promotion when it has one | `tests/fd-01.spec.ts` › FD-01.2 · Card shows current promotion when it has one | PASS |
| FD-01.3 | Selecting a card opens the restaurant's page | `tests/fd-01.spec.ts` › FD-01.3 · Selecting a card opens the restaurant's page | PASS |
| FD-01.4 | View All shows the full list of restaurants | `tests/fd-01.spec.ts` › FD-01.4 · View All shows the full list of restaurants | PASS — weak check: spec gives no list size, test only proves no restaurant disappears |
| FD-01.5 | Non-delivering restaurant greyed out, *Not available at your address* badge, counted in subtitle, cannot be opened | `tests/fd-01.spec.ts` › FD-01.5 · Non-delivering restaurant greyed out, Not available at your address badge, counted in subtitle, cannot be opened | BUG — spec: "It cannot be opened." App: clicking Koliba u Jána opens /restaurant/koliba-u-jana (badge, grey, subtitle count OK) |

Unmatched: none

### FD-02 · Search and filter
| Rule | Rule text (short) | Tests | Status |
| ---- | ----------------- | ----- | ------ |
| FD-02.1 | Search finds by restaurant name or dish name | `tests/fd-02.spec.ts` › FD-02.1 · Search finds by restaurant name or dish name | PASS |
| FD-02.2 | Search ignores upper and lower case | `tests/fd-02.spec.ts` › FD-02.2 · Search ignores upper and lower case | PASS |
| FD-02.3 | Results update while typing; Search button gives the same result | `tests/fd-02.spec.ts` › FD-02.3 · Results update while typing; Search button gives the same result | PASS |
| FD-02.4 | Cuisine chips show only that cuisine; All shows every restaurant | `tests/fd-02.spec.ts` › FD-02.4 · Cuisine chips show only that cuisine; All shows every restaurant | PASS |
| FD-02.5 | Search and cuisine chip apply together | `tests/fd-02.spec.ts` › FD-02.5 · Search and cuisine chip apply together | BUG — spec: "with **Pizza** selected, searching *burger* shows only restaurants that match both." App: Pizza selected + burger shows Burger Palace (American, Burgers) |
| FD-02.6 | No match shows *No restaurants found* with a hint | `tests/fd-02.spec.ts` › FD-02.6 · No match shows No restaurants found with a hint | PASS |

Unmatched: none

### FD-03 · Restaurant menu
| Rule | Rule text (short) | Tests |
| ---- | ----------------- | ----- |
| FD-03.1 | Page shows name, cuisines, rating, delivery time, delivery fee, promotion | no test |
| FD-03.2 | Menu grouped into category tabs | no test |
| FD-03.3 | Each dish: name, description, price, quick-add + button | no test |
| FD-03.4 | Quick-add adds one dish, confirms it, header cart count +1 | no test |
| FD-03.5 | Selecting the dish opens its detail page (FD-04) | no test |
| FD-03.6 | Every button has an accessible name, incl. icon-only quick-add | no test |

Unmatched: none

### FD-05 · Cart
| Rule | Rule text (short) | Tests |
| ---- | ----------------- | ----- |
| FD-05.1 | Line shows dish, restaurant, price, stepper, remove; Clear Cart only with 2+ different dishes | no test |
| FD-05.2 | Summary shows Subtotal, Delivery Fee, Service Fee, Total; Total = Subtotal − discount + Delivery Fee + Service Fee | no test |
| FD-05.3 | Delivery Fee = restaurant's advertised fee; Free = $0.00 | no test |
| FD-05.4 | Service Fee is a flat $1.50 per order | no test |
| FD-05.5 | Promotion applied automatically when order qualifies; discount on its own line | no test |
| FD-05.6 | Proceed to Checkout takes customer to checkout | no test |
| FD-05.7 | Empty cart says so, offers way back, no way to check out | no test |
| FD-05.8 | Cart survives a page reload | no test |

Unmatched: none

### FD-06 · Checkout
| Rule | Rule text (short) | Tests |
| ---- | ----------------- | ----- |
| FD-06.1 | Fields: Full Name, Street Address, City, Phone Number required; Apt / Suite, Delivery Instructions optional | no test |
| FD-06.2 | Payment: Credit / Debit Card (default), Cash on Delivery, Apple Pay | no test |
| FD-06.3 | Place Order only with all required fields; each missing field shows a message | no test |
| FD-06.4 | Empty cart at checkout shows empty state with way back, never a form | no test |

Unmatched: none

### FD-07 · Confirmation and tracking
| Rule | Rule text (short) | Tests |
| ---- | ----------------- | ----- |
| FD-07.1 | Order Confirmed! with placed line, estimated delivery, order number, total | no test |
| FD-07.2 | Order number `FDR-` + six upper-case letters/digits, new for every order | no test |
| FD-07.3 | Track My Order opens tracking; Back to Home returns to landing page | no test |
| FD-07.4 | Tracking page shows order number, total paid, estimated delivery | no test |
| FD-07.5 | Five stages in order: Order Confirmed → Preparing → Ready for Pickup → On the Way → Delivered | no test |
| FD-07.6 | Never-placed order number does not show a tracking page | no test |
| FD-07.7 | Total paid = placed order amount; cannot be changed by editing the address | no test |

Unmatched: none

### FD-08 · Page not found
| Rule | Rule text (short) | Tests |
| ---- | ----------------- | ----- |
| FD-08.1 | Unknown address shows 404 — Page not found and Return to Home link | no test |

Unmatched: none

## Not core
| ID | Feature | Reason (user) |
| -- | ------- | ------------- |
| FD-04 | Customise a dish | — (not given) |

## Skipped (no decision)
| ID | Feature |
| -- | ------- |
| — | — |

## New core features (not in spec)
| ID | Feature | User action | Expected outcome |
| -- | ------- | ----------- | ---------------- |
| — | — | — | — |
