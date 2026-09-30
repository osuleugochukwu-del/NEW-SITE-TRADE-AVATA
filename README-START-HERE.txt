TRADE AVATA — SINGLE UPLOAD BUILD

This is the complete Trade Avata website source. The Trading Journal has been rebuilt as a modern database-first workspace based on the supplied reference screenshots.

UPLOAD:
1. Create/open the target GitHub repository.
2. Extract this package on your computer.
3. Upload the CONTENTS of the extracted package to the repository root.
4. Do not create Layer 1, Layer 2 or Layer 3 folders.
5. Commit to the main branch.
6. GitHub Actions will build and deploy the Astro site.

IMPORTANT:
- This is one all-in-one package. Do not upload separate Journal batches.
- Public pages, private application pages, admin pages, backend structure, Firebase rules/configuration, Firebase Functions, assets and deployment workflow are included together.
- Internal links use the Astro/GitHub Pages base path.
- The Trade Avata logo is already included under public/brand/.
- No service-account credentials or provider API secrets are included.
- Broker-specific live execution is not enabled merely by uploading this source. It remains separately controlled and testable.

TRADING JOURNAL:
- Modern database/table interface.
- Right-side trade detail panel.
- Custom reusable strategies.
- Custom properties.
- Search/filter/sort.
- Gallery and review views.
- Local offline persistence.
- Optional Firebase journal cloud sync for signed-in users.
- Secure AI review Function with local fallback.

AI SETUP LATER:
The Journal is already wired for the secure Firebase Function named reviewJournal. To activate provider-powered AI, configure the server-side variables documented in .env.example / Firebase Functions environment. Never place the provider key in PUBLIC_* variables or browser code.
