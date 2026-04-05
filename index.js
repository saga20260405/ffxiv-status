import express from "express";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", async (req, res) => {

  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();

    await page.goto("https://jp.finalfantasyxiv.com/lodestone/worldstatus/", {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    const data = await page.evaluate(() => {

      const rows = document.querySelectorAll("tr");
      const result = {};

      rows.forEach(row => {
        const cols = row.querySelectorAll("td");

        if (cols.length < 2) return;

        const name = cols[0].innerText.trim();
        const status = cols[1].innerText.trim();

        if (!name) return;

        let state = "normal";
        if (status.includes("混雑")) state = "congested";
        if (status.includes("優遇")) state = "preferred";

        result[name] = state;
      });

      return result;
    });

    await browser.close();

    res.json(data);

  } catch (e) {
    res.json({ error: e.toString() });
  }

});

app.listen(PORT, () => {
  console.log("Running on port " + PORT);
});
