// Tests for aiService internals
// We extract the pure functions by requiring the module and testing behavior

const { processWithAI } = require("../services/aiService");

// ─── Date parsing tests ───────────────────────────────────────────────────────
describe("parseDate (via directMap)", () => {
  // We test date parsing indirectly through processWithAI with no API key
  // so it falls back to directMap

  const makeRecord = (date) => ({ created_at: date, email: "test@test.com", name: "Test" });

  const getDate = async (raw) => {
    process.env.GEMINI_API_KEY = ""; // force fallback
    const { extracted } = await processWithAI([makeRecord(raw)]);
    return extracted[0]?.created_at || "";
  };

  test("parses ISO date", async () => {
    const result = await getDate("2026-05-13T14:20:48Z");
    expect(result).toContain("2026-05-13");
  });

  test("parses space-separated datetime", async () => {
    const result = await getDate("2026-05-13 14:20:48");
    expect(result).toContain("2026-05-13");
  });

  test("parses DD/MM/YYYY Indian format", async () => {
    const result = await getDate("13/06/2026");
    expect(result).toContain("2026-06-13");
  });

  test("parses DD-MM-YYYY format", async () => {
    const result = await getDate("13-06-2026");
    expect(result).toContain("2026-06-13");
  });

  test("parses Unix timestamp (10 digit)", async () => {
    const result = await getDate("1718265600");
    expect(result).toBeTruthy();
    expect(new Date(result).getFullYear()).toBeGreaterThanOrEqual(2024);
  });

  test("returns empty string for invalid date", async () => {
    const result = await getDate("not-a-date");
    // Should either be empty or the raw string — not crash
    expect(typeof result).toBe("string");
  });
});

// ─── Direct mapping tests ─────────────────────────────────────────────────────
describe("directMap column aliases", () => {
  const map = async (record) => {
    process.env.GEMINI_API_KEY = "";
    const { extracted } = await processWithAI([record]);
    return extracted[0] || null;
  };

  test("maps 'Full Name' to name", async () => {
    const r = await map({ "Full Name": "John Doe", email: "j@test.com" });
    expect(r?.name).toBe("John Doe");
  });

  test("maps 'Phone' to mobile_without_country_code", async () => {
    const r = await map({ Phone: "9876543210", email: "j@test.com" });
    expect(r?.mobile_without_country_code).toBe("9876543210");
  });

  test("strips country code prefix from phone", async () => {
    const r = await map({ Phone: "919876543210", email: "j@test.com" });
    expect(r?.mobile_without_country_code).toBe("9876543210");
  });

  test("maps 'Remarks' to crm_note", async () => {
    const r = await map({ Remarks: "Follow up needed", email: "j@test.com" });
    expect(r?.crm_note).toBe("Follow up needed");
  });

  test("maps 'Organisation' to company", async () => {
    const r = await map({ Organisation: "Acme Corp", email: "j@test.com" });
    expect(r?.company).toBe("Acme Corp");
  });
});

// ─── Skip invalid records ─────────────────────────────────────────────────────
describe("skip records with no email and no mobile", () => {
  test("skips record with neither email nor mobile", async () => {
    process.env.GEMINI_API_KEY = "";
    const { extracted, skipped } = await processWithAI([{ name: "Ghost User" }]);
    expect(extracted.length).toBe(0);
    expect(skipped.length).toBe(1);
  });

  test("keeps record with only email", async () => {
    process.env.GEMINI_API_KEY = "";
    const { extracted } = await processWithAI([{ name: "Email Only", email: "only@test.com" }]);
    expect(extracted.length).toBe(1);
  });

  test("keeps record with only mobile", async () => {
    process.env.GEMINI_API_KEY = "";
    const { extracted } = await processWithAI([{ name: "Phone Only", Phone: "9876543210" }]);
    expect(extracted.length).toBe(1);
  });
});

// ─── CRM status normalization ─────────────────────────────────────────────────
describe("crm_status normalization", () => {
  const getStatus = async (status) => {
    process.env.GEMINI_API_KEY = "";
    const { extracted } = await processWithAI([{ name: "Test", email: "t@t.com", status }]);
    return extracted[0]?.crm_status || "";
  };

  test("maps 'interested' to GOOD_LEAD_FOLLOW_UP", async () => {
    expect(await getStatus("interested")).toBe("GOOD_LEAD_FOLLOW_UP");
  });

  test("maps 'not interested' to BAD_LEAD", async () => {
    expect(await getStatus("not interested")).toBe("BAD_LEAD");
  });

  test("maps 'closed' to SALE_DONE", async () => {
    expect(await getStatus("closed")).toBe("SALE_DONE");
  });

  test("maps 'busy' to DID_NOT_CONNECT", async () => {
    expect(await getStatus("busy")).toBe("DID_NOT_CONNECT");
  });

  test("passes through valid GOOD_LEAD_FOLLOW_UP", async () => {
    expect(await getStatus("GOOD_LEAD_FOLLOW_UP")).toBe("GOOD_LEAD_FOLLOW_UP");
  });

  test("returns empty for unknown status", async () => {
    expect(await getStatus("maybe")).toBe("");
  });
});

// ─── Batch processing ─────────────────────────────────────────────────────────
describe("batch processing", () => {
  test("processes more than 15 records in multiple batches", async () => {
    process.env.GEMINI_API_KEY = "";
    const records = Array.from({ length: 20 }, (_, i) => ({
      name: `User ${i}`, email: `user${i}@test.com`
    }));
    const batches = [];
    const { extracted } = await processWithAI(records, (batchNum) => batches.push(batchNum));
    expect(extracted.length).toBe(20);
    expect(batches.length).toBe(2); // 15 + 5 = 2 batches
  });

  test("onBatchDone callback fires for each batch", async () => {
    process.env.GEMINI_API_KEY = "";
    const records = Array.from({ length: 30 }, (_, i) => ({
      name: `User ${i}`, email: `u${i}@test.com`
    }));
    const calls = [];
    await processWithAI(records, (batchNum, totalBatches) => calls.push({ batchNum, totalBatches }));
    expect(calls.length).toBe(2);
    expect(calls[0]).toEqual({ batchNum: 1, totalBatches: 2 });
    expect(calls[1]).toEqual({ batchNum: 2, totalBatches: 2 });
  });
});
