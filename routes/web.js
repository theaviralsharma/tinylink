const express = require("express");
const router = express.Router();
const Link = require("../models/Link");
const validUrl = require("valid-url");

router.get("/", async (req, res, next) => {
  try {
    const links = await Link.find().sort({ created_at: -1 }).lean();
    res.render("index", { links, baseUrl: process.env.BASE_URL || "" });
  } catch (err) {
    next(err);
  }
});

router.post("/create", async (req, res, next) => {
  try {
    const { code, target_url } = req.body;
    const generateCode = require("../utils/generateCode");

    if (!target_url || !validUrl.isUri(target_url)) {
      return res.render("index", {
        links: await Link.find().lean(),
        error: "Invalid URL",
        baseUrl: process.env.BASE_URL || "",
      });
    }

    if (code) {
      if (!/^[A-Za-z0-9]{6,8}$/.test(code)) {
        return res.render("index", {
          links: await Link.find().lean(),
          error: "Code must be 6–8 alphanumeric characters",
          baseUrl: process.env.BASE_URL || "",
        });
      }
      const existing = await Link.findOne({ code });
      if (existing) {
        return res.render("index", {
          links: await Link.find().lean(),
          error: "Code already exists",
          baseUrl: process.env.BASE_URL || "",
        });
      }
    }

    let finalCode = code;
    if (!finalCode) {
      
      let tries = 0;
      do {
        finalCode = generateCode();
        tries++;
        if (tries > 20) {
          
          finalCode = Math.random()
            .toString(36)
            .replace(/[^A-Za-z0-9]/g, "")
            .slice(2, 8);
          if (finalCode.length < 6)
            finalCode = (finalCode + "0".repeat(6)).slice(0, 6);
        }
      } while (await Link.findOne({ code: finalCode }));
    }
    const link = new Link({ code: finalCode, target_url });
    await link.save();
    res.redirect("/");
  } catch (err) {
    next(err);
  }
});

router.get("/code/:code", async (req, res, next) => {
  try {
    const link = await Link.findOne({ code: req.params.code }).lean();
    if (!link) return res.status(404).send("Not found");
    res.render("stats", { link, baseUrl: process.env.BASE_URL || "" });
  } catch (err) {
    next(err);
  }
});

router.delete("/code/:code", async (req, res, next) => {
  try {
    await Link.findOneAndDelete({ code: req.params.code });
    res.redirect("/");
  } catch (err) {
    next(err);
  }
});

router.get("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const link = await Link.findOneAndUpdate(
      { code },
      { $inc: { total_clicks: 1 }, $set: { last_clicked: new Date() } },
      { new: true }
    ).lean();
    if (!link)
      return res.status(404).render("404", { message: "Link not found" });
    // redirect with 302
    return res.redirect(302, link.target_url);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
