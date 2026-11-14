# Iranserver design kit (Uikit-V3 + Portal) for the prototype agent

How to use it, in this order of priority:
1. The fixed rules of the prototype always win (Peyda only, change only this route, never touch the core).
2. Everything already on the page stays exactly as it is.
3. A Figma design, when given, is built exactly as drawn.
4. Wherever the Figma design or the request does not say (sizes, colours, spacing, states, component anatomy, copy style), follow this kit. Without Figma, build new parts from this kit's components and the page's own structure.

CSS variables from this kit are loaded on every page (kit/tokens.css), so "css" may use them, e.g. var(--primary-primary), var(--surface-on-surface), var(--radius-medium). The Figma file keys and Figma-plugin notes below are for designers; ignore them.


---
<!-- design-system/tokens.md -->
# Tokens (Uikit-V3 variables)

Machine-readable: `tokens.json` (primitives, semantic→primitive map, spacing, radius, stroke, typography, layout) and `../prototype-starter/tokens.css`.

Rule: in Figma **bind** to the semantic variable name below (collection *Semantic Tokens*); never to a primitive or raw hex.

## Semantic colours (name → hex)

| Variable | Hex |
|---|---|
| `Primary/Primary` | #2635d9 |
| `Primary/On Primary` | #ffffff |
| `Primary/Primary Container` | #f2f7fd |
| `Primary/Primary Container Variant 1` | #dcebf9 |
| `Primary/On Primary Variant 2` | #172082 |
| `Primary/On Primary Variant 3` | #0f1557 |
| `Primary/On Primary Variant 4` | #01041f |
| `Primary/On Primary Variant 5` | #1f2aad |
| `Secondary/Secondary` | #fa8100 |
| `Secondary/On Secondary` | #ffffff |
| `Secondary/Secondary Container` | #fff3e5 |
| `Secondary/On Secondary Container` | #331a00 |
| `Secondary/Secondary Container Variant 1` | #ffe6cc |
| `Tertiary/Tertiary` | #14b855 |
| `Tertiary/On Tertiary` | #ffffff |
| `Tertiary/Tertiary Container` | #e8fcf0 |
| `Tertiary/On Tertiary Container` | #052e15 |
| `Tertiary/Tertiary Variant 1` | #0f8a41 |
| `Surface/Surface` | #fafafa |
| `Surface/On Surface` | #323234 |
| `Surface/Surface Container` | #f4f4f5 |
| `Surface/On Surface Variant 1` | #e4e5e7 |
| `Surface/On Surface Variant 2` | #95969d |
| `Surface/On Surface Variant 3` | #cacace |
| `Surface/On Surface Variant 4` | #62636a |
| `Surface/Surface Bright` | #ffffff |
| `Surface/Surface Dark` | #000000 |
| `Outline/Outline` | #e4e5e7 |
| `Outline/Outline Varient` | #cacace |
| `Outline/Outline Varient 2` | #f4f4f5 |
| `Success/Success` | #d8f3e3 |
| `Success/Success Container` | #1e7b22 |
| `Success/On Success` | #173f03 |
| `Error/Error` | #fbe5e4 |
| `Error/Error Container` | #b01111 |
| `Error/On Error` | #520400 |
| `Warning/Warning` | #fff8e0 |
| `Warning/Waning Container` | #f7a709 |
| `Warning/On Warning` | #422d03 |
| `Info/Info` | #d3e6f8 |
| `Info/Info Container` | #0e94f9 |
| `Info/On Info` | #073254 |
| `Docs/Docs` | #3d1e7b |
| `Docs/Docs Container` | #e1d8f3 |
| `Docs/On Docs` | #240464 |
| `Disable/Disable` | #f4f4f5 |
| `Disable/On Disable` | #7a7b85 |
| `Disable/Disable Container` | #e4e5e7 |
| `Disable/Disable Outline` | #e4e5e7 |
| `Pure Color/Pure White` | #ffffff |
| `Pure Color/Pure Black` | #000000 |

Also exist (not listed): Pastel Palette/* (Turquoise, Orange, Green, Ocean Blue, Red, Yellow, Sky Blue, Dark Blue, Purple, Dirty Yellow, Pink — each with `X` and `X Container`) used for category colouring. Brand: **Primary #2635d9** (logo blue), **Secondary #fa8100** (logo orange).

## Spacing (Gap/*)
`Gap/None=0`, `Gap/05=2`, `Gap/1=4`, `Gap/2=8`, `Gap/3=12`, `Gap/4=16`, `Gap/5=20`, `Gap/6=24`, `Gap/8=32`, `Gap/10=40`, `Gap/14=56`, `Gap/16=64`, `Gap/20=80`, `Gap/22=88`, `Gap/30=120`, `Gap/35=140`, `Gap/Margin For Grid=300`

## Radius / Stroke
Radius: None=0, Small=4, Medium=8, Large=12, X-Large=40, Curve=120. Stroke: None=0, Small=1, Medium=1.5, Large=2.

## Layout
- **Portal**: widths 1920/842/390 · content max 1440 · header 68 · body padding D[24,240,32,240] T[24,40,32,40] M[12,16,24,16] · card radius 8 padding 24.
- **Website sections**: widths 1920/744/360 · section padding D[88,300] T[40,32] M[32,16].

## Typography
Peyda. Styles `<size>/<weight>`: 32/48, 24/36 (mobile 20/30), 20/30, 16/32, 14/28, 12/24, 10/20; weights Regular/Medium/Bold(/Black). Buttons & labels: `14/Medium`; body `14/Regular` or `16/Regular`; helper `12/Regular`.

---
<!-- design-system/component-specs.md -->
# Component specs (measured from Uikit-V3, 2026-11-08)

All colours are **semantic variables** (never raw hex in Figma). Hex shown only so an HTML prototype can reproduce them (`tokens.css` has them all). Font Peyda; Persian UI, RTL.

## Button (`Button`, 7083:48352) — single size, 42px
- Frame: **height 42**, horizontal auto-layout, padding **4 / 16 / 4 / 16**, gap 4, radius **8** (`Corner Radius/Medium`). Hug width (138 default w/ icons).
- Label: `14/Medium`. Icons 18×18 (optional left/right: props `Show Left icon`, `Show Right icon`).
- `Type=Button` (label button) or `Type=Icon Button` (42×42 square, pad 4, no label).
- `Status` (importance): 
  | Status | Default fill | Text | Hover fill | Disable |
  |---|---|---|---|---|
  | **Primary** | `Primary/Primary` #2635d9 | `Primary/On Primary` #fff | `Primary/On Primary Variant 2` #172082 | fill `Disable/Disable Container` #e4e5e7, text `Disable/On Disable` #7a7b85 |
  | **Tonal** | `Primary/Primary Container Variant 1` #dcebf9 | `Primary/Primary` | fill `Primary/Primary`, text `Primary/On Primary` | same as Primary disabled |
  | **Outline** | `Surface/Surface Bright` #fff + 1px stroke `Primary/Primary` | `Primary/Primary` | fill `Primary/Primary Container Variant 1` | stroke+text `Disable/On Disable` |
  | **Text** | no fill | `Primary/Primary` | fill `Primary/Primary Container Variant 1` | text `Disable/On Disable` |
  | **Link** | no fill, underline on hover (see Buttons.jpg) | `Primary/Primary` | underline | `Disable/On Disable` |
- `State=Loading`: becomes **42×42**, only a spinner (`Progress bar` 18px) in the status colour (white spinner on Primary).
- Design rules learned: **Primary is scarce** — one per view/step (the main forward action: «ادامه خرید», «خرید سرور ابری»). Secondary actions = Tonal or Outline (they look alike; Outline≈Tonal), tertiary = Text/Link. Footer pattern: Primary on the right (start in RTL), Text/Link «مرحله قبل» next to it. Reference image: `reference-docs/Buttons.jpg`.

## Input (`Input`, 6881:47965) — single height 42
Anatomy (vertical, gap 4): **Title row** (28px: optional 16px info icon + label `14/Medium`, colour `Surface/On Surface`) → **Field** (42px, h-layout, padding 8/12/8/12, radius 8, fill `Surface/Surface Bright`, 1px stroke) → **Helper/Description** (`12/Regular`, `Surface/On Surface Variant 4`, 24px line) or **Error** (red text + 16px error icon).
| Type | Stroke / fill | Notes |
|---|---|---|
| Default | stroke `Outline/Outline Varient` #cacace, fill white | placeholder `Show Placeholder`; optional left/right icons (e.g. eye for password) |
| Focus | stroke `Primary/Primary` 1px | caret visible (`Show Pointer`) |
| Error | stroke `Error/Error Container` #b01111 | helper becomes red error message with icon (`Show Error Icon`) |
| Disable | fill `Disable/Disable` #f4f4f5, label/text `Disable/On Disable` | |
| Also | `Generate Password`, `Button` (trailing button), `With Dropdown`, `Open Dropdown` | |
Reference image: `reference-docs/Input.jpg` (default, focus, error with eye icon, helper text).
Required marker: label ends with ` *` as seen on Login (`آدرس ایمیل *`).

## Tag (`Tag`) and Chips
- Tag: height 32 (Medium) / smaller (Small); padding 2/12 (Rounded) or 2/8 (Square); gap 4; **Rounded** radius 120 (pill, white fill + 1px `Outline/Outline`, used for feature lists with a ✓ right icon), **Square** radius 8 (status fill: e.g. Success = fill `Success/Success` #d8f3e3, green text), **Text** = no box. Colours: Gray, Error, Info, Primary, Success, Warning, Secondary, Teritiary, Disabled, Surface. Status tags in tables: فعال=Success, در انتظار / در حال پرداخت=Warning, در حال ایجاد=Info, (error)=Error.
- Chips (filter chips): height 32, `State=Active` filled primary-container w/ primary stroke, `Deactive` outlined; Size Medium/Large.

## Checkbox / Radio / Switch
Checkbox & Radio rows are 32px high with label; `State` (Checked/Intermediate/Unchecked | On/Off) × `Status` (Default/Hover/Disable). Switchers Right/Left (28px). `Radio Card` = selectable card with radio (used for OS / period / domain type choices; Selected state = primary 1px stroke + filled radio).

## Alert / Toast / Modal
Alert types `Danger/Info/Success/Warning/Docs` × Device (Desktop/Mobile); optional trailing buttons/dividers. Toast types `Error/Warning/Success/Info` 347×72 (title + optional description + close). Modal 564 wide (header/footer built with `Modal Cell`).

## Table (Portal)
Table frame: white `Factor list` card (radius 8, padding 24) → toolbar (search + filter icon-button + «خرید …» Primary button) → category tiles (`Service Filter`) → tabs (`Tab Cell`: Active/Not active/Deactive, optional counter/tag) → table container (radius 8, 1px `Outline/Outline Varient 2`) of `Table Cell` (Type=Header/Content; State Default/Hovered/Selected; row height ≥52; two-line cells with Text 1 + Text 2 e.g. name + `IP : 185.…`) → `Pagination` (Number; mobile shows condensed). Row actions = kebab icon → operation menu built from `Item Cell` (`Sub menu`); mobile table scrolls horizontally with sticky name column.

## Typography scale (text styles)
`32/Desktop` 32/48 (Black/Bold) · `24/Desktop & Tablet` 24/36 · `24/Mobile` 20/30 · `20` 20/30 · `16` 16/32 · `14` 14/28 · `12` 12/24 · `10` 10/20. Weights Regular, Medium, Bold (Black for 32/24). Page titles in Portal cards: 14–16 Bold in `Primary/On Primary Variant 3`; body 14; helper 12.

## Spacing / radius / stroke tokens
Gap: 05=2, 1=4, 2=8, 3=12, 4=16, 5=20, 6=24, 8=32, 10=40, 14=56, 16=64, 20=80, 22=88. Radius: Small 4, **Medium 8** (default for buttons, inputs, cards), Large 12, X-Large 40, Curve 120 (pills). Stroke: Small 1, Medium 1.5, Large 2. Shadow: `0 4 24` #2533cb @8% (rare).


---
<!-- portal/portal-patterns.md -->
# IranServer Portal (user panel / "پنل کاربری") — layout & pattern guide

> Legend: facts below come from measured frames/screenshots unless marked **[?]** (inferred, verify in Figma before relying on it).

Source: Figma file **Portal** `1qrZx6L5Ug2eniRA8epD2U` (audited 2026-11-08). Pages: Dashboard, Finance, Support, Cart, Login/Signup, Host Purchase, Domain, One Click App, Service Management, Verified Email, Error, VPS/Block Storage, Affiliate programs, Page 20–22 (newest work: invoices, Cloud Services/Block Storage table, Whois), Temp, Flowkit. Libraries used: **Uikit V3** (+ Portal local components).

## 1. Shell (every Portal screen)
Frame widths: **Desktop 1920 · Tablet 842 (some 834) · Mobile 390 (some 360)**.
```
Page (V, gap 0, fill Surface/Surface Container)
 ├─ Header  → instance of UI Kit `Header` {Type=Header, Side=Dashboard, Device=Desktop|Tablet|Mobile, No Login=True}
 │            desktop: 1920×68, padding 16/300, fill Surface Bright, bottom stroke Outline/Outline Varient 2
 │            (logo at the right [RTL], then on the left: phone, cart badge, profile, «خرید جدید» Tonal button)
 └─ Body (V, gap 16, fill Surface Container)
      padding  Desktop [24, 240, 32|40, 240] · Tablet [24, 40, 32, 40] · Mobile [12, 16, 24, 16]
      content width Desktop 1440
      ├─ Status indicator row: breadcrumb (Breadcrumb Cell: Active / Not active) e.g. «نمای کلی › مدیریت سرویس»   (24px)
      └─ White card(s): fill Neutral/White (Surface Bright), radius 8, padding 24, inner gap 32 (V)
```
Desktop spacing between header and content ≈ 24; between stacked cards 16–24.

## 2. Page archetypes (copy these before inventing anything)
| Archetype | Reference frames | Structure |
|---|---|---|
| **List / management page** | `Cloud Services - Table` 36875:166787 (D), `Block Storage - Table (Mobile)` 36933:6920, `(Tablet)` 36933:36299, `Empty State` 36875:166745 / 36915:35645; `لیست سرویس‌ها` 13865:6966 | title «مدیریت سرویس» → toolbar (Search 42px + filter icon button + [Primary] «خرید …») → `Service Filter` category tiles (همه، هاست، خدمات ابری، سرور اختصاصی، SSL، CDN، سایر خدمات; tile = icon + label + count Tag) → Tabs (`Tab Cell` with counter tag «۱ سرویس فعال») → Table (`Table Cell`) → Pagination. Empty state = Illustration + 1–3 buttons (Table Type=Empty / Empty One Button …). |
| **Operation (kebab) menu** | `Operation menu` 36875:167098, `… - Block Storage` 36912:6480 (3 states: متصل/جدا شده/…) | vertical list of `Item Cell`; [?] destructive item last/red. Menu items depend on resource state (e.g. attach vs detach). |
| **Multi-step purchase / configuration wizard** | `Service configuration` 12533:26612, `Configuration + …` series (Host Purchase page), VPS/Block Storage purchase on «VPS, Block Storage» page | Wizard card (stepper: ثبت دامنه → پیکربندی سرویس → تایید سفارش → پرداخت; states Pass(green check)/Current/Next/Warning/Error/Disable) → Ticket/section cards (white, radius 8, padding 24, gap 80 between groups, 40 inner) → Radio Cards for choice (period, OS, domain type), collapsible sections (`Flavor Section`/`OS Section` State=Open/Close) → footer: [Primary] «ادامه خرید» + [Text] «مرحله قبل». Tablet/Mobile: **Summary Responsive** + bottom nav (`Bottom Nav - Tablet/Mobile`). Desktop has a right/left **Summary** column (440 wide: Type=One Item Not Selected / All Selected …). |
| **Detail / settings with grouped cards** | Domain page (Domain-Details-Desktop 19242:19463, DNS, Whois Information, SSL), `جزییات سرویس‌ها` 14418:14812 | Dashboard status card on top (Type=Active/Expiring/Pending…), then stacked setting cards each with title, state Tag, helper text and a Tonal/Outline action. Edit states (View / Edit / Loading / Error) are separate variants. |
| **Finance** | Invoice-unpaid/paid/cancelled/refund (Finance, Page 20), Wallet, Payment, Sidebar (payment method) | Invoice summary + payment `Sidebar` panel (467 wide) with Wallet row states, discount-code states, Offline/Online payment method; result pages Success/Error/Cancelled. |
| **Auth** | `login` 13730:14668 (+ Forget password, Reset, One-time link, Signup) | Split screen: **left 436px brand panel** (fill Primary/Primary, white logo + watermark) / right form column ~390 wide: H1 «ورود به پنل کاربری», Inputs with ` *`, link-button «رمزتان را فراموش کرده‌اید؟», captcha input, Checkbox «مرا بخاطر بسپار», row [Primary «ورود»][Tonal «ورود با لینک یکبار مصرف»], footer «حساب کاربری ندارید؟ ثبت نام». (RTL: brand panel is on the *left*.) |
| **Support / Ticket** | Support page (Ticket-AI flows), `Attach File`, Stars/Feedback | [?] not inspected in detail — components: Dropdown, Attach File, Text Area (send), Stars/Feedback; open Support frames before copying. |
| **Error pages** | `404` 11508:28675, `403`, `under_maintenace` | [?] not inspected in detail — open the frames before copying. |

## 3. Interaction conventions seen across the Portal
- **State coverage**: every flow is designed with Default · Loading · Empty · Error · Success (and Disabled / Rate-limited / Cooldown for fragile actions like wallet checks). A new screen is not done until these exist.
- **Responsive**: each desktop frame has Tablet (842) and Mobile (390/360) twins named `… [Tablet]` / `… [Mobile]`. Mobile: toolbar wraps, tabs and tables scroll horizontally, wizard becomes compact with bottom nav, cards go full-width, Primary button full-width at the bottom.
- **RTL**: Persian text right-aligned; the *first* reading item sits on the right; icons that imply direction are mirrored [?] (e.g. in the website slider the *left* arrow is the "next" control). Numbers in Persian digits (۱۲۳) for UI copy [observed in screenshots], Latin digits for IPs/technical values (`IP : 185.213.188.215`), prices «۷٬۹۹۰٬۰۰۰ تومان» with a thousands separator.
- **Feedback**: Toast for transient results (top), Alert for page-level conditions, inline Input error for fields, Modal for destructive/confirm flows (footer built from `Modal Cell` Type=Footer; exact button mix [?] check a Modal frame, e.g. Affiliate page `Modal` 35201:132401).
- **Price display**: Toman; discount as green Tag «۷۸٬۰۰۰ تومان تخفیف» above the price; prices are dynamic (never hard-code).
- **Status Tag mapping** (service lists): فعال → Success · در انتظار / در حال پرداخت → Warning · در حال ایجاد → Info · معلق/لغو شده → Error/Gray.
- **Cross-sell / Gift**: `Gift-Button` badge in header; one-click-app, add-ons as selectable cards (`App-Card`, `Plugin-Card`, `CloudDisk-Card` with Selected/Active toggles).

## 4. Business constraints that shape Portal designs
- Billing model: plan-based; the user picks a plan, then configures (OS/location/period/addons), pays from wallet/invoice. Don't invent per-second/usage-based billing UI unless the PRD says so.
- Domain `.ir` (IRNIC) has its own flows/states (IR vs International variants for Whois, Lock, DNS Security).
- Products with portal surfaces today: Host, Domain, SSL, CDN, Cloud VPS, Block Storage, Object Storage, GPU [verify before designing], One-Click Apps, Support/Ticket (with AI), Finance (wallet, invoices, tax), Affiliate («همکاری در فروش»), Verified Email / Whois / profile.
- See `reference-docs/` (users, design principles, patterns, website overview) for audience and product-architecture reasoning.


---
<!-- design-system/components-catalog.md -->
# IranServer UI Kit (Uikit-V3) — Component Catalog

Source: Figma file **Uikit-V3** (`0uxzan8L6i5bMtqwdjjOlX`), page **Cell & Component** (+ `Visual Asset`, `Section`). Extracted 2026-11-08 straight from the file (names/props are exact; anything marked [..] is an assumption).
Portal and Website both consume these as a **library**; instances are imported by key (`importComponentSetByKeyAsync`) — only *published* components can be imported.

Format: `Name | node id | key(8) | default variant size | properties`
Property legend: `X=a/b/c` variant property with options · `:bool` boolean (Show …) · `:text` text prop · `:swap` instance swap.
Variant naming convention (must be followed for anything new): `Name=…`, `Type=…`, `Status=…`, `State=…`, `Device=Desktop/Tablet/Mobile`; values like `Colored` / `B&W`; never `Mode`.

## 1. Core controls (use these first in the Portal)
```
Button | 7083:48352 | 1fa5fb3a | 138x42 | Show Right icon:bool ; Show Left icon:bool ; Title:text ; Type=Button/Icon Button ; Status=Tonal/Outline/Text/Primary/Link ; State=Default/Disable/Hover/Loading
Input | 6881:47965 | a4fdb287 | 350x106 | Show Description ; Show right icons ; Show left icons ; Show title icon ; Show Placeholder ; Show Button ; Show Error Icon ; Show Alert ; Show Pointer (all bool) ; Type=Default/Focus/Generate Password/Error/Disable/Button/With Dropdown/Open Dropdown
Text Area | 11555:1514 | 41f57f90 | 352x130 | Show icon/Show Description/Show send/Show title icon/Show attach_file/Show Placeholder/Show Chips (bool) ; Type=Default/Focus/Disable/Filled up/Default domain
Dropdown | 10443:14386 | 088152f6 | 332x74 | Type=Disable/Open/Multiple/Default/Type6/Text/Type8
Dropdown Cell | 10443:15708 | 6a59b9c4 | 237x32 | Type=Default
Search | 10660:5837 | 941945e5 | 746x42 | Type=Default/Disable/Fill/Focus/Typing
Domain Search | 10658:4890 | 97379def | 746x74 | Pro Search:bool ; Type=Fouces/Default/Loading
Date Picker | 10443:14516 | 70734920 | 340x74 | Type=Close/Open/Selected
Upload | 10310:690 | 1a8ae0b0 | 746x126 | Show Error ; Show description ; Type=Attached/Attached 2/Disable/Default
Counter | 20380:21733 | 785eaef3 | 418x74 | Title:text ; Label:text ; Show Label Icon ; Show Label ; State=Default/Disabled
Checkbox | 10443:15454 | 597297c0 | 162x32 | Show Content ; Show icon ; Show Space ; State=Checked/Intermediate/Unchecked ; Status=Default/Disable/Hover
Radio | 10443:15515 | 8fe0cb54 | 165x32 | Show Content ; Show icon ; Show Space ; State=On/Off ; Status=Default/Hover/Disable
Right Switcher | 10443:15548 | 27dd8811 | 175x28 | Show Content/Show Icon/Show Space ; State=Off/On ; Status=Active/Disable/Hover
Left Switcher | 12305:5808 | dab34019 | 191x28 | State=Off/On ; Status=Active/Disable/Hover
Switch Rounded | 21461:14640 | 81ede6ba | 371x36 | Count=1/2
Switch Cell Rounded | 21460:14624 | 802760af | 185x32 | State=False/True
Radio Card | 20365:13795 | 16919acf | 218x130 | Show Logo/Show Tag/Show Dropdown/Show Price/Show Discount Price/Show Options/Show Divider (bool) ; State=Selected/Default/Disabled
Chips | 10443:15678 | 7d1a4640 | 100x32 | Show Right Icon ; Show Left Icon ; Text:text ; State=Active/Deactive ; Size=Medium/Large
Tag | 10443:15660 | 45c0095f | 89x32 | Show left icon ; Show Right icon ; Title:text ; Show Title ; Color=Gray/Error/Info/Primary/Success/Warning/Secondary/Teritiary/Disabled/Surface ; Size=Small/Medium ; Type=Rounded/Square/Text
```

## 2. Navigation, feedback, overlays
```
Header | 10698:18174 | bd435d43 | (Section page) | Show Topbar ; Show Gift/Offer ; Show Searchbox (bool) ; Type=Header/Header [Open] ; Side=Dashboard/Site ; Device=Mobile/Tablet/Desktop ; No Login=False/True   ← Portal shell header = Side=Dashboard
Footer | 12440:4558 | 29218fc0 | | State=Site ; Device=Desktop/Mobile/Tablet ; Side=Site
Horizontal Tab | 15813:11462 | 30a84faf | 178x48 | Text:text ; State=Active/Deactive ; Size=Large/Small
Tab Cell | 10443:15688 | 99a9b590 | 237x38 | Counter ; Show Icon ; Show Tag ; Show Info (bool) ; Type=Active/Not active/Deactive
Tab-2 | 20004:20349 | a4cbaa9b | 276x44 | Title:text ; Show Tag/Show Counter/Show Right-Icon/Show Left-Icon ; Counter:text ; State=Active/Not-Active/Deactive ; Direction=LTR/RTL
Breadcrumb Cell | 10443:15742 | fb343a66 | 70x24 | Icon:bool ; Type=Active/Not active
Pagination | 14911:3214 | f7ec817d | 45x15 | Property 1=Pagination/Paginations/Default ; Property 2=Dot/Number ; Device=Desktop/Mobile
Sub menu Cell | 10443:15714 | 7e5c1b1f | 215x52 | Show Icon/Show Left Icon/Show Right Icon ; Type=Menu/Hover
Profile menu | 10443:14332 | 0a3dbbfe | 244x404 | Type=Default/Accounts List
Profile menu Cell | 10443:15762 | 49f9b360 | 262x44 | Show Icon ; Type=Default/Hover
Item Cell | 10443:15752 | 101c3a3c | 78x28 | Show Icon ; Type=Select & hover/Active   (operation-menu items)
Alert | 5958:45199 | 86e9e8fb | 970x52 | Show Right Icon/Show Button/Show Divider/Show Icon Button/Show Button-2/Show Divider-2 ; Type=Danger/Info/Success/Warning/Docs ; Device=Mobile/Desktop
Toast | 11744:2187 | 4d485df8 | 347x72 | Show Discription/Show Icon/Show Close icon ; Type=Error/Warning/Success/Info
Modal | 16565:3700 | 7dc37f21 | 564x578 | (single component; header/footer via Modal Cell)
Modal Cell | 11817:2129 | cfd281e3 | 538x96 | Show text/Show Button/Show Icon ; Type=Footer/Header
Tooltip | 14323:9074 | 7f4e3324 | 236x120 | (single)
Dropdown/Content | 22409:15859 | ba9151a1 | 332x350 | (single)
Empty State | 22612:26125 | 6a8cd804 | 932x250 | (single)   (+ Illustration set: "Empty State - No Result", "Empty State - Fliter")
Guidance | 23731:12934 | 71bdf46a | 1376x441 | Status=Primary/Success/Warning/Error/Info/Neutral ; Marker=Numbers/Dots
FAQ | 12758:1910 | 85e680f5 | 1320x68 | Title/Description/More Question:text ; Type=Close/Open/Go to Doc
Accordion | 11629:3091 | 6433b765 | 1392x52 | Type=Body/Header
Chat Bubble | 11853:2624 | 82429c00 | 398x104 | (single)
```

## 3. Tables & data
```
Table | 10443:14646 | 1a0fcc52 | 875x432 | Show Header:bool ; Type=Empty/Empty No Button/Empty One Button/Empty Three Button/Table
Table Cell | 10443:15640 | d260cd3e | 386x52 | Tag ; Show Text 1 ; Show Text 2 ; Description ; Show Right Icon [Header] ; Show Left Icon [Header] ; Show Left Icon [Body] ; Show Button ; Show Top (bool) ; Type=Content/Header/Content White/Content Gray ; State=Default/Hovered/Selected
Table Header | 22644:12902 | b4899973 | 386x52 | Tag/Show Label/Show Right Icon/Show Left Icon ; Tone=Brand/Neutral ; Title=Regular/Bold
Table Cell Master | 22644:13008 | bfd4578f | 386x88 | …Show Button/Show Top ; Tonal=Neutral/Pure White/Brand ; Title=Regular/Bold
Table Cell Price | 22605:12990 | e3e04bf6 | 386x62 | Show Discount/Show Period ; Type=Hover/White/Gray/Selected
Comparison Table | 22185:25343 | 7ca8de7e | 1320x570 | Device=Desktop/Tablet/Mobile   (+ [cell] sets: Comparison-Table [cell])
Text Cell | 10443:15604 | f2c1ff08 | 419x100 | Show Time/Show Divider ; Type=Read/Read [Hover]/Unread/Unread [Hover]   (notifications)
Search result Cell | 10443:15724 | 241439d9 | 443x64 | Description ; Show Button ; Change Button:swap ; Show Tag ; Change Tag:swap ; Type=Default/Hover
```

## 4. Pricing / plan / cards (mostly marketing website; reuse in Portal purchase flows only when UX responsibility fits)
```
Pricing-01 13438:2983 · Pricing-02 17612:20743 · Pricing-03 23782:14505 (Type=Default/Hover/Popular) · Pricing-04 18931:12986 · Pricing-05 18605:12467 · Pricing-06 20004:17754 · Pricing-07 21454:14522 · Responsive Pricing-07 21469:12425 · Pricing-sefareshi 14063:8136
Static Cards 19983:25597 (Device) · Hosting Services Card 20544:24705 (Type=Default/Popular/Other Offer ; Device) · Services Item 21311:11009 (Service's Type=Current/Higher/Lower) · Cycle-HostCard 21067:13980 (State=Opened/Closed/No Collapse) · Gift-Option 21067:13969 · Gift Tag 21455:12363 · Datacenter Card 21019:15825 (Type=Cities/Common ; State=Deactive/Active/Content Container ; Device) · App-Card 18538:11058 · Video-Card 18673:15078 · Solution Home Page Cards 21742:24317 · Customer Review 20523:22912 · Customer Logo 20523:22882 · Special Offer - Pricing 20159:10677
```

## 5. Visual assets (library)
- `Regular` (icon set, 190 icons, Material-style names e.g. `chevron_right`, `chevron_left`) `11930:2048` · `Bold` (88 icons, e.g. `Vertical`, `Ai`) `11930:2004` · `Bulk` (colour icons for services: Block Storage, Object Storage, CDN, VPS, Domain, Host, GPU, SSL …) `12863:9724` · `Glassy Icons` (service/brand logos with Size=56/48/40/16px) `20055:1384` · `Illustration` (hundreds; names like `Empty State - No Result`, `block-storage`, `Dedicated Hero`) `12484:2841` · `OS-logo` `17014:14554` · `Logo` `12475:2845`.
- Icons are instances (`Regular`/`Bold`/`Bulk`) with property `Name=<icon>`; resize icons per spec (Button icon 18px, Input icon 16px, Tag icon 16px, nav chevrons 28.8px).

## 6. Section library (website only)
`call-to-action-NN` and `content-NN` component sets (Device=Desktop/Tablet/Mobile) live on the Uikit-V3 **Section** page (frame "Content Section" `14941:7053`, "CTA Section"). Newest: `content-26` (GPU card + video slider, `23893:15416`). Not used in the Portal.

## 7. Portal-local components (Portal file `1qrZx6L5Ug2eniRA8epD2U`, NOT in the UI Kit)
These exist only in the Portal file. Reuse their *pattern* when prototyping; if a Figma prototype needs them, import from the Portal library.
```
Service Filter | 13884:23219 | 109x84 | Text:text ; Property 1=Default/Select           (category tiles on service list: همه / هاست / خدمات ابری …)
Services (Dashboard) 7329:10545 / 13113:15028 · Menu 7333:12590 / 7406:13146 / 13113:11614 (Type=Open/Close) · Price-plan 18033:29999 (Size=Desktop/Mobile/Tablet ; State=Default/Hovered)
Payment 10154:9396 (Type=Default/Discount open/Set discount/Wallet) · Wallet 36543:201460 (State=Wallet balance/Wallet Check/Disable/Loading/Cooldown/Rate limited) · Sidebar 36543:201512 (payment method side panel)
Common Actions 14728:8137 · Container (service-manage) 14574:6081 (Default/warning/Danger) · Bar chart 37570:73476 (Default/warning/Danger)
App-Card 19835:25075 · Plugin-Card 19837:29118 · CloudDisk-Card 19894:33206 · CPU-Ram Card 22509:67426 · CPU/RAM-Card 22523:70032 (Selected / Current Service)
Upgrade/Downgrade Type1 22582:61050 · CloudServer-Up/Down 22588:67554 (Device)
Block Storage / VPS purchase: Network Setting 25488:67997 · OS Section 24629:9846 · Cloud Storage 34062:95383 · Period 25198:12410 · Flavor Section 25389:68967 · Summary 33128:93449 · Summary Responsive 33151:93998 · Bottom Nav - Tablet/Mobile 24660:8751 / 24660:8881
Domain: Host Purchase_2 18221:20149 (State=Enter Domain/Have Domain/Epp/Submit Irnic/Success/…), Domain States (stepper dot) 33268:20279 (State=Pass/Current/Next/Warning/Error/Disable), Whois Information 20359:47320 (State=Pending/Edit - From Profile/Edit - Loading/Edit - Manual/Restricted/Edit - Error ; Size=Web/Tablet/Mobile ; Type=International/IR), DNS/NS/SSL/Lock cells (see Temp page)
Support: Attach File 11145:26778 · Dropdown 11180:5702 · Stars/Feedback · Accordion 12823:13150
Flowkit (flow/annotation blocks) on the Flowkit page.
```
Most-used UI Kit components across recent Portal pages (usage counts from the file): icons (Regular) ≫ Table Cell > Button > Tab Cell > Tag > Item Cell > Breadcrumb Cell > Service Filter > Sub menu > Input > Checkbox > Alert > Modal Cell > Toast > Pagination.
