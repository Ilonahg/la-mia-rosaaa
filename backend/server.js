const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const nodemailer = require("nodemailer");
const { Pool } = require("pg");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3001;


/* =====================================================
   STATIC FILES
===================================================== */
app.use("/images", express.static(path.join(__dirname, "../images")));

/* =====================================================
   SECRET
===================================================== */
const JWT_SECRET = "SUPER_SECRET_CHANGE_LATER";

/* =====================================================
   MIDDLEWARE
===================================================== */
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: [
    "https://chimerical-kitsune-11c58a.netlify.app",
    "http://localhost:5500",
    "http://127.0.0.1:5500"
  ],
  credentials: true
}));


/* =====================================================
   POSTGRES DATABASE
===================================================== */
const db = new Pool({
  connectionString: "postgresql://lamia_user:8z2BbdK785SlANoUDnRqr3WiMlMDprwQ@dpg-d5v7d27pm1nc73cca6ng-a.frankfurt-postgres.render.com/lamia_store",
  ssl: { rejectUnauthorized: false }
});

db.connect()
  .then(async () => {
    console.log("POSTGRES CONNECTED");

    // OTP TABLE
    await db.query(`
      CREATE TABLE IF NOT EXISTS otp_codes (
        email TEXT PRIMARY KEY,
        code TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL
      );
    `);

    // ORDERS TABLE
    await db.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id TEXT,
        items JSONB NOT NULL,
        total NUMERIC NOT NULL,
        status TEXT DEFAULT 'paid',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // CONTACTS TABLE
    await db.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT NOT NULL,
        phone TEXT,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("ALL TABLES READY");
  })
  .catch(err => console.error("POSTGRES ERROR:", err));

/* =====================================================
   EMAIL (GMAIL)
===================================================== */
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "gogilchyn2005ilona@gmail.com",
        pass: "kinwovfuqdupllts"
    }
});

/* =====================================================
   OTP STORE
===================================================== */
const otpStore = new Map();

/* =====================================================
   AUTH MIDDLEWARE
===================================================== */
function requireAuth(req, res, next) {
    const token = req.cookies.auth_token;
    if (!token) {
        return res.status(401).json({ error: "Not authenticated" });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    } catch {
        return res.status(401).json({ error: "Invalid token" });
    }
}
/* =====================================================
   HEALTH CHECK
===================================================== */
app.get("/", (req, res) => {
    res.json({ status: "API is running" });
});

/* =====================================================
   SEND EMAIL CODE
===================================================== */
app.post("/send-code", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await db.query(
      `INSERT INTO otp_codes (email, code, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '5 minutes')
       ON CONFLICT (email)
       DO UPDATE SET code = $2, expires_at = NOW() + INTERVAL '5 minutes'`,
      [email, code]
    );

    await transporter.sendMail({
      from: `"La Mia Rosa" <gogilchyn2005ilona@gmail.com>`,
      to: email,
      subject: "Your login code",
      html: `<h2>Your code: ${code}</h2>`
    });

    res.json({ ok: true });

  } catch (err) {
    console.error("SEND CODE ERROR", err);
    res.status(500).json({ error: "Mail error" });
  }
});

/* =====================================================
   VERIFY EMAIL CODE
===================================================== */
app.post("/verify-code", async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: "Missing data" });
    }

    const result = await db.query(
      `SELECT * FROM otp_codes WHERE email = $1`,
      [email]
    );

    if (!result.rows.length) {
      return res.status(400).json({ error: "Code not found" });
    }

    const record = result.rows[0];

    if (record.code !== code) {
      return res.status(400).json({ error: "Wrong code" });
    }

    if (new Date(record.expires_at) < new Date()) {
      return res.status(400).json({ error: "Code expired" });
    }

    // 🔐 LOGIN SUCCESS — create auth cookie
    const token = jwt.sign(
      { userId: email, email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("auth_token", token, {
      httpOnly: true,
      sameSite: "None",
      secure: true
    });

    res.json({ ok: true });

  } catch (err) {
    console.error("VERIFY CODE ERROR", err);
    res.status(500).json({ error: "Server error" });
  }
});


/* =====================================================
   GET CURRENT USER
===================================================== */
app.get("/me", (req, res) => {
    const token = req.cookies.auth_token;
    if (!token) return res.json({ user: null });

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        res.json({
            user: {
                id: payload.userId,
                email: payload.email
            }
        });
    } catch {
        res.json({ user: null });
    }
});

/* =====================================================
   LOGOUT
===================================================== */
app.post("/logout", (req, res) => {
    res.clearCookie("auth_token");
    res.json({ ok: true });
});
/* =====================================================
   CREATE ORDER (AUTH USER)
===================================================== */
app.post("/orders", requireAuth, async (req, res) => {
  try {
    const { items, total } = req.body;

    if (!items || !Array.isArray(items) || !total) {
      return res.status(400).json({ error: "Invalid order data" });
    }

    const result = await db.query(
      `INSERT INTO orders (user_id, items, total)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [
        req.user.userId,
        JSON.stringify(items),
        total
      ]
    );

    res.json({
      ok: true,
      orderId: result.rows[0].id
    });

  } catch (err) {
    console.error("ORDER INSERT ERROR", err);
    res.status(500).json({ error: "Order save failed" });
  }
});

/* =====================================================
   GET USER ORDERS
===================================================== */
app.get("/orders", requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, items, total, status, created_at
       FROM orders
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.userId]
    );

    const orders = result.rows.map(row => ({
      id: row.id,
      items: JSON.parse(row.items),
      total: row.total,
      status: row.status,
      createdAt: row.created_at
    }));

    res.json({ orders });

  } catch (err) {
    console.error("ORDERS FETCH ERROR", err);
    res.status(500).json({ error: "Failed to load orders" });
  }
});

/* =====================================================
   ORDER EMAIL TEMPLATE
===================================================== */
function orderEmailTemplate({ items, total }) {

  let attachments = [];

  const itemsHtml = items.map((item, index) => {

    const cid = `product${index}@lamia`;
    const imagePath = path.join(__dirname, "../", item.image);

    if (fs.existsSync(imagePath)) {
      attachments.push({
        filename: path.basename(imagePath),
        path: imagePath,
        cid
      });
    }

    return `
      <tr>
        <td style="padding:12px 0;">
          <img src="cid:${cid}" width="70" height="70"
            style="border-radius:8px; object-fit:cover;" />
        </td>
        <td style="padding:12px 10px; font-family:Arial;">
          <strong>${item.title}</strong><br/>
          Quantity: ${item.qty}
        </td>
        <td style="padding:12px 0; font-family:Arial; text-align:right;">
          ₺${(item.price * item.qty).toFixed(2)}
        </td>
      </tr>
    `;
  }).join("");

  const html = `
  <div style="background:#f5f5f5; padding:30px 0; font-family:Arial;">
    <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:12px; overflow:hidden;">

      <div style="background:#111; color:#fff; padding:20px; text-align:center;">
        <h1 style="margin:0;">La Mia Rosa</h1>
      </div>

      <div style="padding:25px;">
        <h2>Thank you for your order 💖</h2>

        <table width="100%" cellspacing="0" cellpadding="0">
          ${itemsHtml}
        </table>

        <hr style="margin:20px 0; border:none; border-top:1px solid #eee;" />

        <table width="100%">
          <tr>
            <td>Total</td>
            <td style="text-align:right;"><strong>₺${total}</strong></td>
          </tr>
        </table>

        <div style="margin-top:25px; padding:15px; background:#fafafa; border-radius:8px;">
          <strong>Shipping information</strong>
          <p style="margin:8px 0 0;">
            Orders are delivered within <strong>5–7 business days</strong>.<br/>
            You will receive a tracking number once shipped.
          </p>
        </div>

      </div>
    </div>
  </div>
  `;

  return { html, attachments };
}

/* =====================================================
   CREATE PAYMENT — AUTO LINK TO USER BY EMAIL
===================================================== */
app.post("/create-payment", async (req, res) => {
  try {
    const { cart, total, email } = req.body;

    if (!cart || !cart.length) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    let userId = null;
    const token = req.cookies.auth_token;

    if (token) {
      try {
        const payload = jwt.verify(token, JWT_SECRET);
        userId = payload.userId;
      } catch {}
    }

    const numericTotal = Number(total.replace("₺", "").replace(",", ""));

    const result = await db.query(
      `INSERT INTO orders (user_id, items, total, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [
        userId,
        JSON.stringify(cart),
        numericTotal,
        "paid"
      ]
    );

    try {
      const { html, attachments } = orderEmailTemplate({
        items: cart,
        total: numericTotal.toFixed(2)
      });

      await transporter.sendMail({
        from: `"La Mia Rosa" <gogilchyn2005ilona@gmail.com>`,
        to: email,
        subject: "Order confirmation – La Mia Rosa",
        html,
        attachments
      });

    } catch (mailErr) {
      console.error("EMAIL ERROR", mailErr);
    }

    res.json({ ok: true, orderId: result.rows[0].id });

  } catch (err) {
    console.error("CREATE PAYMENT ERROR", err);
    res.status(500).json({ error: "Payment failed" });
  }
});


/* =====================================================
   TEST EMAIL (WITH PRODUCT IMAGE)
===================================================== */
app.get("/test-email", async (req, res) => {
  try {

    const emailHtml = orderEmailTemplate({
      items: [
        {
          title: "Side-Zip Turtleneck Sweater",
          price: 1249.90,
          qty: 1,
          image: "black-zip-cardigan-1.jpg"
        }
      ],
      total: "1249.90"
    });

    await transporter.sendMail({
      from: `"La Mia Rosa" <gogilchyn2005ilona@gmail.com>`,
      to: "gogilchyn2005ilona@gmail.com",
      subject: "TEST ORDER EMAIL – La Mia Rosa",
      html: emailHtml.html,
      attachments: emailHtml.attachments
    });

    res.json({ ok: true });

  } catch (err) {
    console.error("TEST EMAIL ERROR:", err);
    res.status(500).json({ error: "Email failed" });
  }
});

/* =====================================================
   CONTACT FORM API
===================================================== */
app.post("/contact", async (req, res) => {
  try {
    const { name, email, phone, comment } = req.body;

    if (!email || !comment) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await db.query(
      `INSERT INTO contacts (name, email, phone, message)
       VALUES ($1, $2, $3, $4)`,
      [name || "", email, phone || "", comment]
    );

    try {
      await transporter.sendMail({
        from: `"La Mia Rosa" <gogilchyn2005ilona@gmail.com>`,
        to: "gogilchyn2005ilona@gmail.com",
        subject: "New message from Communication page",
        html: `
          <h2>New Customer Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Message:</strong><br/>${comment}</p>
        `
      });
    } catch (mailErr) {
      console.error("CONTACT EMAIL ERROR", mailErr);
    }

    res.json({ success: true });

  } catch (err) {
    console.error("CONTACT DB ERROR", err);
    res.status(500).json({ error: "Database error" });
  }
});

/* =====================================================
   START SERVER
===================================================== */
app.listen(PORT, () => {
    console.log(`🚀 SERVER RUNNING ON PORT ${PORT}`);

});
