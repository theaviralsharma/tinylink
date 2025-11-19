const express = require('express');
const router = express.Router();
const validUrl = require('valid-url');
const Link = require('../models/Link');


const generateCode = require('../utils/generateCode');


function isValidCode(code) {
  return /^[A-Za-z0-9]{6,8}$/.test(code);
}

router.get('/links', async (req, res, next) => {
  try {
    const links = await Link.find().sort({ created_at: -1 }).lean();
    return res.json({ ok: true, links });
  } catch (err) { next(err); }
});

router.post('/links', async (req, res, next) => {
  try {
    const { code, target_url } = req.body;

    // validate URL
    if (!target_url || !validUrl.isUri(target_url)) {
      return res.status(400).json({ ok: false, error: 'Invalid or missing target_url' });
    }

    let finalCode = code;

    if (finalCode) {
      // custom code provided -> validate pattern
      if (!isValidCode(finalCode)) {
        return res.status(400).json({ ok: false, error: 'code must be alphanumeric length 6-8' });
      }
      // check uniqueness
      const exists = await Link.findOne({ code: finalCode });
      if (exists) return res.status(409).json({ ok: false, error: 'Code already exists' });
    } else {
      // auto-generate code until unique
      // note: while-loop with DB check is ok for low-volume apps; DB unique index guards against race conditions
      let tries = 0;
      do {
        finalCode = generateCode();
        tries++;
        // safety: after many tries fallback to random base36 (should almost never happen)
        if (tries > 10) {
          finalCode = Math.random().toString(36).replace(/[^A-Za-z0-9]/g, '').slice(2, 8);
          // ensure length 6-8
          if (finalCode.length < 6) finalCode = (finalCode + '0'.repeat(6)).slice(0,6);
        }
      } while (await Link.findOne({ code: finalCode }));
    }

    const link = new Link({ code: finalCode, target_url });
    await link.save();

    return res.status(201).json({
      ok: true,
      code: link.code,
      short_url: `${process.env.BASE_URL ? process.env.BASE_URL.replace(/\/$/, '') : ''}/${link.code}`
    });
  } catch (err) {
    // handle duplicate key (race) explicitly if you want
    if (err.code === 11000 && err.keyPattern && err.keyPattern.code) {
      return res.status(409).json({ ok: false, error: 'Code already exists' });
    }
    next(err);
  }
});

router.get('/links/:code', async (req, res, next) => {
  try {
    const link = await Link.findOne({ code: req.params.code }).lean();
    if (!link) return res.status(404).json({ ok: false, error: 'Not found' });
    return res.json({ ok: true, link });
  } catch (err) { next(err); }
});

router.delete('/links/:code', async (req, res, next) => {
  try {
    const deleted = await Link.findOneAndDelete({ code: req.params.code });
    if (!deleted) return res.status(404).json({ ok: false, error: 'Not found' });
    return res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
