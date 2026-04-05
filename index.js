import express from "express";
import puppeteer from "puppeteer";

const app = express();

app.get("/", async (req, res) => {

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();

  await page.goto("https://jp.finalfantasyxiv.com/lodestone/worldstatus/", {
    waitUntil: "networkidle2"
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
});

app.listen(10000);
