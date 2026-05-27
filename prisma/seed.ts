import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { HYPOTHESES } from "../lib/hypotheses";

const adapter = new PrismaLibSql({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding hypotheses...");

  for (const h of HYPOTHESES) {
    await prisma.hypothesis.upsert({
      where: { ticker: h.ticker },
      update: {
        company: h.company,
        sector: h.sector,
        studyDate: new Date(h.studyDate),
        priceAtStudy: h.priceAtStudy,
        status: h.status,
        zoneValueLow: h.zoneValueLow,
        zoneValueHigh: h.zoneValueHigh,
        zoneDeepLow: h.zoneDeepLow,
        zoneDeepHigh: h.zoneDeepHigh,
        zoneHistLow: h.zoneHistLow,
        zoneHistHigh: h.zoneHistHigh,
        scenarioNeg: h.scenarioNeg,
        scenarioBase: h.scenarioBase,
        scenarioOpt: h.scenarioOpt,
        ratiosUsed: JSON.stringify(h.ratiosUsed),
        htmlFile: h.htmlFile,
        notes: h.closeNote ?? null,
      },
      create: {
        ticker: h.ticker,
        company: h.company,
        sector: h.sector,
        studyDate: new Date(h.studyDate),
        priceAtStudy: h.priceAtStudy,
        status: h.status,
        zoneValueLow: h.zoneValueLow,
        zoneValueHigh: h.zoneValueHigh,
        zoneDeepLow: h.zoneDeepLow,
        zoneDeepHigh: h.zoneDeepHigh,
        zoneHistLow: h.zoneHistLow,
        zoneHistHigh: h.zoneHistHigh,
        scenarioNeg: h.scenarioNeg,
        scenarioBase: h.scenarioBase,
        scenarioOpt: h.scenarioOpt,
        ratiosUsed: JSON.stringify(h.ratiosUsed),
        htmlFile: h.htmlFile,
        notes: h.closeNote ?? null,
      },
    });
    console.log(`  ✓ ${h.ticker} — ${h.company}`);
  }

  console.log(`\nDone. ${HYPOTHESES.length} hypotheses seeded.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
