-- CreateTable
CREATE TABLE "Hypothesis" (
    "ticker" TEXT NOT NULL PRIMARY KEY,
    "company" TEXT NOT NULL,
    "sector" TEXT,
    "studyDate" DATETIME NOT NULL,
    "priceAtStudy" REAL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "zoneValueLow" REAL,
    "zoneValueHigh" REAL,
    "zoneDeepLow" REAL,
    "zoneDeepHigh" REAL,
    "zoneHistLow" REAL,
    "zoneHistHigh" REAL,
    "scenarioNeg" REAL,
    "scenarioBase" REAL,
    "scenarioOpt" REAL,
    "ratiosUsed" TEXT,
    "htmlFile" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PriceSync" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ticker" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "changePct" REAL,
    "syncedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL DEFAULT 'alphavantage',
    CONSTRAINT "PriceSync_ticker_fkey" FOREIGN KEY ("ticker") REFERENCES "Hypothesis" ("ticker") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AiAnalysis" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ticker" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "priceUsed" REAL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AiAnalysis_ticker_fkey" FOREIGN KEY ("ticker") REFERENCES "Hypothesis" ("ticker") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChatSession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ticker" TEXT NOT NULL,
    "messages" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatSession_ticker_fkey" FOREIGN KEY ("ticker") REFERENCES "Hypothesis" ("ticker") ON DELETE RESTRICT ON UPDATE CASCADE
);
