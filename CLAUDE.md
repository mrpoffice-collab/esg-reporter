# ESG Reporter

Lightweight sustainability tracking for SMBs. Track carbon emissions, water usage, and waste metrics for supply chain compliance.

## MVP Criteria

| # | Criterion | Status |
|---|-----------|--------|
| 1 | User can create company profile | Pending |
| 2 | User can log carbon emissions | Pending |
| 3 | User can log water usage | Pending |
| 4 | User can log waste metrics | Pending |
| 5 | Dashboard shows summary stats | Pending |
| 6 | User can generate report | Pending |
| 7 | Data persists after refresh | Pending |

## Design Rules (WCAG Compliant)

1. **No grey fonts** - Minimum contrast 4.5:1
2. **No dark backgrounds** - Light theme only
3. **No purple colors** - Use green, blue, amber
4. **Text**: text-gray-900, text-gray-700 (never lighter)
5. **Backgrounds**: bg-gray-50, bg-white

## Tech Stack

- **Framework**: Next.js 15
- **Database**: Neon PostgreSQL
- **ORM**: Prisma 6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Database Models

- **Company**: Company profile with name, industry
- **Emission**: Carbon emissions entries (kg CO2e)
- **WaterUsage**: Water usage entries (liters)
- **WasteData**: Waste entries (kg)
- **Report**: Generated reports with totals

## API Endpoints

- `GET/POST /api/company` - Company management + stats
- `GET/POST /api/emissions` - Carbon emissions CRUD
- `GET/POST /api/water` - Water usage CRUD
- `GET/POST /api/waste` - Waste metrics CRUD
- `POST /api/reports` - Generate ESG report

## Environment Variables

```env
DATABASE_URL="postgresql://..."  # Neon connection string
```

## Development

```bash
npm install
npx prisma db push
npm run dev
```

## Deployment

```bash
npx vercel
```
