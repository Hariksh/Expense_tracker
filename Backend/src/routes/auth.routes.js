const { Router } = require("express");
const { body, validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();
const router = Router();

router.post(
  "/register",
  body("name").isLength({ min: 2 }),
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    const { name, email, password } = req.body;
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: "Email already exists" });
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hash },
    });
    const token = jwt.sign(
      { sub: user.id },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "7d" }
    );
    res.status(201).json({ token, user: { id: user.id, name, email } });
  }
);

router.post(
  "/login",
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign(
      { sub: user.id },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "7d" }
    );
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  }
);

const auth = require("../middlewares/auth");

router.get("/users", auth, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { id: { not: req.user.id } },
      select: { id: true, name: true, email: true },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.get("/stats", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const totalGroups = await prisma.groupMember.count({
      where: { userId },
    });

    const totalExpenses = await prisma.expense.count({
      where: {
        OR: [
          { paidBy: userId },
          { splits: { some: { userId } } },
        ],
      },
    });

    const paidAgg = await prisma.expense.aggregate({
      where: { paidBy: userId },
      _sum: { amount: true },
    });
    const totalPaid = paidAgg._sum.amount || 0;

    const owedAgg = await prisma.expenseSplit.aggregate({
      where: {
        userId,
        expense: { paidBy: { not: userId } },
      },
      _sum: { shareAmount: true },
    });
    const totalOwed = owedAgg._sum.shareAmount || 0;

    res.json({
      totalGroups,
      totalExpenses,
      totalPaid,
      totalOwed,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

module.exports = router;
