export interface StorageUsageItem {
  collection: string
  documents: number
  avgDocumentSize: string
  totalDocumentSize: string
  totalIndexSize: string
}

export interface StorageUsage {
  database: string
  version: string
  checkedOn: string
  items: StorageUsageItem[]
}

export const STORAGE_USAGES: StorageUsage[] = [
  {
    database: 'MongoDB',
    version: '8.0.6',
    checkedOn: '2025-03-27',
    items: [
      {
        collection: 'syndicate',
        documents: 248,
        avgDocumentSize: '0.3 KiB',
        totalDocumentSize: '81.0 KiB',
        totalIndexSize: '36.0 KiB'
      },
      {
        collection: 'bet',
        documents: 233,
        avgDocumentSize: '8.3 KiB',
        totalDocumentSize: '1.9 MiB',
        totalIndexSize: '152.0 KiB'
      },
      {
        collection: "reminder",
        documents: 233,
        avgDocumentSize: "7.3 KiB",
        totalDocumentSize: "1.7 MiB",
        totalIndexSize: "72.0 KiB"
      },
      {
        collection: "racecard",
        documents: 2213,
        avgDocumentSize: "50.8 KiB",
        totalDocumentSize: "109.8 MiB",
        totalIndexSize: "376.0 KiB"
      },
      {
        collection: "drawInheritance",
        documents: 2209,
        avgDocumentSize: "0.3 KiB",
        totalDocumentSize: "690.2 KiB",
        totalIndexSize: "280.0 KiB"
      },
      {
        collection: "pick",
        documents: 233,
        avgDocumentSize: "0.6 KiB",
        totalDocumentSize: "142.8 KiB",
        totalIndexSize: "72.0 KiB"
      },
      {
        collection: "report",
        documents: 232,
        avgDocumentSize: "0.5 KiB",
        totalDocumentSize: "110.4 KiB",
        totalIndexSize: "72.0 KiB"
      },
      {
        collection: "horse",
        documents: 2254,
        avgDocumentSize: "3.4 KiB",
        totalDocumentSize: "7.4 MiB",
        totalIndexSize: "332.0 KiB"
      },
      {
        collection: "collaboration",
        documents: 983,
        avgDocumentSize: "4.2 KiB",
        totalDocumentSize: "4.0 MiB",
        totalIndexSize: "200.0 KiB"
      },
      {
        collection: "recommendation",
        documents: 58,
        avgDocumentSize: "28.7 KiB",
        totalDocumentSize: "1.6 MiB",
        totalIndexSize: "72.0 KiB"
      },
      {
        collection: "fixture",
        documents: 1,
        avgDocumentSize: "5.4 KiB",
        totalDocumentSize: "5.4 KiB",
        totalIndexSize: "40.0 KiB"
      },
      {
        collection: "oddsSnapshot",
        documents: 284,
        avgDocumentSize: "127.9 KiB",
        totalDocumentSize: "35.5 MiB",
        totalIndexSize: "116.0 KiB"
      },
      {
        collection: "trackwork",
        documents: 1464,
        avgDocumentSize: "22.3 KiB",
        totalDocumentSize: "31.9 MiB",
        totalIndexSize: "128.0 KiB"
      },
      {
        collection: "player",
        documents: 103,
        avgDocumentSize: "0.4 KiB",
        totalDocumentSize: "40.5 KiB",
        totalIndexSize: "72.0 KiB"
      },
      {
        collection: "meeting",
        documents: 233,
        avgDocumentSize: "41.2 KiB",
        totalDocumentSize: "9.4 MiB",
        totalIndexSize: "72.0 KiB"
      },
      {
        collection: "trackworkSnapshot",
        documents: 86,
        avgDocumentSize: "23.7 KiB",
        totalDocumentSize: "2.0 MiB",
        totalIndexSize: "72.0 KiB"
      },
      {
        collection: "syndicateSnapshot",
        documents: 233,
        avgDocumentSize: "27.2 KiB",
        totalDocumentSize: "6.2 MiB",
        totalIndexSize: "72.0 KiB"
      },
    ]
  }
]
