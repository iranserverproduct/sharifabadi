# 9Router - پرامپت‌های Higgsfield برای شات‌های رئال

این فایل پرامپت تصویر ثابت (still) هر شات رئال استوری‌بورد [05-video-storyboard.md](../05-video-storyboard.md) را دارد. پرامپت‌ها انگلیسی‌اند، چون مدل‌ها با انگلیسی دقیق‌ترند.

روش کار:

1. اول برای هر شخصیت یک تصویر مرجع (character reference) بسازید و در Higgsfield به‌عنوان Character یا Soul ID ذخیره کنید، تا چهره و لباس در همه‌ی شات‌ها یکسان بماند.
1. بعد هر شات را با شخصیت مرجع خودش بسازید. ابعاد همه 16:9 است.
1. صفحه‌ی مانیتور و گوشی را خالی (صفحه‌ی سبز یا تیره) بسازید. رابط واقعی 9Router و ابزارها در تدوین روی آن جاگذاری می‌شود. هیچ متن، لوگو یا رابطی در تصویر تولید نشود.

## سبک مشترک

پسوند سبک که به آخر هر پرامپت شات اضافه می‌شود:

```text
photorealistic cinematic still, 35mm lens, shallow depth of field, natural skin texture, high-end minimal composition with generous negative space, single subject, no text, no logos, no watermark, no UI on screens (screens show a plain dark glow for later screen replacement), 16:9
```

- پرده‌ی اول (شب): `cool blue night grade, low-key lighting, monitor light as the main source, subtle red accent only from the screen`
- پرده‌ی دوم و سوم (روز): `warm natural daylight, soft and clean, calm mood`

## تصاویر مرجع شخصیت‌ها

تصاویر مرجع:

| کد | پرامپت |
|---|---|
| A | `character reference sheet, Iranian man around 28, short dark hair, light stubble, dark grey hoodie, headphones around neck, front and three-quarter views, neutral studio light, plain background` |
| B | `character reference sheet, Iranian woman around 30, light-colored loose headscarf, simple shirt, thin-frame glasses, front and three-quarter views, neutral studio light, plain background` |
| C | `character reference sheet, Iranian man around 35, short neat hair, blue button-up shirt, glasses, front and three-quarter views, neutral studio light, plain background` |
| D | `character reference sheet, Iranian woman around 26, casual comfortable home clothes, hair tied back (night version) and a light headscarf (day version), front and three-quarter views, neutral studio light, plain background` |

## شات‌ها

شات‌های رئال:

| شات | شخصیت | پرامپت |
|---|---|---|
| 1A | A | `extreme close-up of a tired young man's eyes at 2 a.m., blue monitor light reflected in his pupils, faint lines of code reflected, night` |
| 1B | A | `over-the-shoulder shot from behind a young man's right shoulder in a small apartment at night, he faces a single monitor (blank glowing screen), city lights through the window, night` |
| 1D | A | `close-up of two hands frozen above a mechanical keyboard, lit by cool monitor light, tension, night` |
| 2A | B | `medium shot of a woman at a home desk with two monitors (blank screens), yellow sticky notes on the monitor edge, slow lateral tracking feel, night` |
| 2D | B | `close-up of yellow sticky notes stuck on a monitor bezel, focus pulling to the woman's face behind, she exhales, night` |
| 3B | C | `medium shot of a man in a small glass-walled startup office at dusk, looking at a laptop screen (blank), concerned expression` |
| 3C | C | `medium close-up of the man taking off his glasses and rubbing his eyes, blurred team working in the background of the office` |
| 4A | D | `wide shot of a dark bedroom at 3 a.m., a smartphone vibrating and lighting up on the nightstand (blank screen), night` |
| 4B | D | `close-up of a young woman's half-open eyes lit from below by a phone screen, dark bedroom, night` |
| 4C | D | `point-of-view shot of a laptop being opened on a bedside table in a dark room, screen glowing blank, night` |
| 7C | B | `same desk and angle as 2A in warm daylight, two monitors (blank screens), no sticky notes on the bezel, the woman gives a small relieved smile, day` |
| 8C | A | `medium close-up of the young man leaning back in his chair with a relieved exhale, monitor behind him glowing (blank), late night but calmer warm tone` |
| 9D | C | `wide shot of a bright meeting room, the man presents to four teammates on a wall-mounted TV (blank screen), teammates nodding, day` |
| 10B | D | `medium shot of the young woman closing her laptop, switching off a bedside lamp and lying down to sleep, calm, night` |
| 10C | - | `wide shot down a clean data center aisle, server racks with small green status LEDs, slow dolly feel, cool and calm, no brand marks` |
| 11A | A | `medium shot of the young man coding in warm morning daylight, relaxed, coffee on the desk, monitor blank` |
| 11B | B | `medium shot of the woman sipping coffee at her desk in daylight, looking at her monitor (blank), calm` |
| 11C | C | `medium shot of the man laughing with his team in a bright meeting room, day` |
| 11D | D | `medium shot of the young woman by a window in soft morning light, wearing a light headscarf, checking her phone (blank screen), calm smile` |

8B (نیمه‌ی چپ) همان فریم 1B است و جدا ساخته نمی‌شود.

## بعد از ساخت

- فایل‌ها را با نام شات ذخیره کنید، مثلاً `1A.jpg`، در پوشه‌ی `video-storyboard/real/`.
- برای ویدیو، همین still‌ها ورودی Image-to-Video در Higgsfield می‌شوند و حرکت دوربین هر شات از ستون «نما و دوربین» استوری‌بورد می‌آید.
