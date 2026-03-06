import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const db = new Database("barberflow.db");
const JWT_SECRET = process.env.JWT_SECRET || "barber-secret-key-123";

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    duration INTEGER NOT NULL -- in minutes
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    date TEXT NOT NULL, -- ISO string
    status TEXT DEFAULT 'scheduled',
    FOREIGN KEY (client_id) REFERENCES clients (id),
    FOREIGN KEY (service_id) REFERENCES services (id)
  );
`);

// Seed default user if not exists
const userCount = db.prepare("SELECT count(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)").run("Admin", "admin@barberflow.com", hashedPassword);
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // Auth Routes
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  });

  // Clients API
  app.get("/api/clients", authenticateToken, (req, res) => {
    const clients = db.prepare("SELECT * FROM clients").all();
    res.json(clients);
  });

  app.post("/api/clients", authenticateToken, (req, res) => {
    try {
      const { name, phone, email } = req.body;
      if (!name || !phone) return res.status(400).json({ error: "Nome e telefone são obrigatórios" });
      const result = db.prepare("INSERT INTO clients (name, phone, email) VALUES (?, ?, ?)").run(name, phone, email);
      res.json({ id: result.lastInsertRowid, name, phone, email });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Services API
  app.get("/api/services", authenticateToken, (req, res) => {
    const services = db.prepare("SELECT * FROM services").all();
    res.json(services);
  });

  app.post("/api/services", authenticateToken, (req, res) => {
    try {
      const { name, price, duration } = req.body;
      if (!name || !price || !duration) return res.status(400).json({ error: "Dados incompletos" });
      const result = db.prepare("INSERT INTO services (name, price, duration) VALUES (?, ?, ?)").run(name, price, duration);
      res.json({ id: result.lastInsertRowid, name, price, duration });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Products API
  app.get("/api/products", authenticateToken, (req, res) => {
    const products = db.prepare("SELECT * FROM products").all();
    res.json(products);
  });

  app.post("/api/products", authenticateToken, (req, res) => {
    try {
      const { name, price, stock } = req.body;
      if (!name || !price || stock === undefined) return res.status(400).json({ error: "Dados incompletos" });
      const result = db.prepare("INSERT INTO products (name, price, stock) VALUES (?, ?, ?)").run(name, price, stock);
      res.json({ id: result.lastInsertRowid, name, price, stock });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Appointments API
  app.get("/api/appointments", authenticateToken, (req, res) => {
    const appointments = db.prepare(`
      SELECT a.*, c.name as client_name, c.phone as client_phone, s.name as service_name, s.duration
      FROM appointments a
      JOIN clients c ON a.client_id = c.id
      JOIN services s ON a.service_id = s.id
    `).all();
    res.json(appointments);
  });

  app.post("/api/appointments", authenticateToken, (req, res) => {
    try {
      const { client_id, service_id, date } = req.body;
      
      if (!client_id || !service_id || !date) {
        return res.status(400).json({ error: "Dados incompletos" });
      }

      const result = db.prepare("INSERT INTO appointments (client_id, service_id, date) VALUES (?, ?, ?)").run(client_id, service_id, date);
      
      // Trigger WhatsApp Notification (Simulated)
      const client = db.prepare("SELECT * FROM clients WHERE id = ?").get(client_id) as any;
      const service = db.prepare("SELECT * FROM services WHERE id = ?").get(service_id) as any;
      
      if (client && service) {
        console.log(`[WhatsApp] Notificando ${client.name} (${client.phone}): Seu agendamento de ${service.name} para ${date} foi confirmado!`);
      }

      res.json({ id: result.lastInsertRowid, client_id, service_id, date });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "Erro interno no servidor" });
    }
  });

  // Reminder Task (Simulated)
  setInterval(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const reminders = db.prepare(`
      SELECT a.*, c.name as client_name, c.phone as client_phone, s.name as service_name
      FROM appointments a
      JOIN clients c ON a.client_id = c.id
      JOIN services s ON a.service_id = s.id
      WHERE a.date LIKE ? AND a.status = 'scheduled'
    `).all(`${tomorrowStr}%`);

    reminders.forEach((r: any) => {
      console.log(`[WhatsApp Reminder] Notificando ${r.client_name} (${r.client_phone}): Lembrete! Você tem um agendamento de ${r.service_name} amanhã às ${new Date(r.date).toLocaleTimeString()}.`);
    });
  }, 1000 * 60 * 60); // Run every hour

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
