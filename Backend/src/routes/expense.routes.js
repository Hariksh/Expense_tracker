const { Router } = require("express");
const { PrismaClient } = require("@prisma/client");
const { body, validationResult } = require("express-validator");
const auth = require("../middlewares/auth");

const prisma = new PrismaClient();
const router = Router();

router.get("/", auth, async (req, res) => {
  const userId = req.user.id;
  const items = await prisma.expense.findMany({
    where: {
      OR: [
        { paidBy: userId },
        { splits: { some: { userId } } },
      ],
    },
    include: { splits: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(items);
});

router.post(
  "/",
  auth,
  body("title").isLength({ min: 1 }),
  body("amount").isNumeric(),
  body("type").isLength({ min: 1 }),
  body("date").isISO8601(),
  body("paid_by").isInt(),
  body("splits").isArray({ min: 1 }),
  body("group_id").optional({ nullable: true }).isInt(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    const { title, amount, type, date, paid_by, splits, group_id } = req.body;

    if (paid_by !== req.user.id)
      return res.status(403).json({ error: "Forbidden" });

    const totalShares = splits.reduce((a, b) => a + Number(b.amount), 0);
    if (Math.abs(totalShares - Number(amount)) > 0.05) { // Allow small float error
      return res
        .status(400)
        .json({ error: "Splits must sum to total amount" });
    }

    const created = await prisma.expense.create({
      data: {
        title,
        amount: Number(amount),
        type,
        date: new Date(date),
        paidBy: paid_by,
        groupId: group_id || null,
        splits: {
          create: splits.map((s) => ({
            userId: s.user_id,
            shareAmount: Number(s.amount),
          })),
        },
      },
      include: { splits: true },
    });
    res.status(201).json(created);
  }
);

router.get("/:id", auth, async (req, res) => {
  const id = parseInt(req.params.id);
  const expense = await prisma.expense.findUnique({
    where: { id },
    include: { splits: true },
  });
  if (!expense) return res.status(404).json({ error: "Not found" });

  // Check access
  const hasAccess = expense.paidBy === req.user.id || expense.splits.some(s => s.userId === req.user.id);
  if (!hasAccess) return res.status(403).json({ error: "Forbidden" });

  res.json(expense);
});

router.put("/:id", auth, async (req, res) => {
  const id = parseInt(req.params.id);
  const existing = await prisma.expense.findUnique({ where: { id } });
  if (!existing || existing.paidBy !== req.user.id)
    return res.status(404).json({ error: "Not found" });
  const { title, amount, type, date } = req.body;
  const updated = await prisma.expense.update({
    where: { id },
    data: {
      title,
      amount: amount !== undefined ? Number(amount) : undefined,
      type,
      date: date ? new Date(date) : undefined,
    },
    include: { splits: true },
  });
  res.json(updated);
});

router.delete("/:id", auth, async (req, res) => {
  const id = parseInt(req.params.id);
  const existing = await prisma.expense.findUnique({ where: { id } });
  if (!existing || existing.paidBy !== req.user.id)
    return res.status(404).json({ error: "Not found" });
  await prisma.expenseSplit.deleteMany({ where: { expenseId: id } });
  await prisma.expense.delete({ where: { id } });
  res.json({ success: true });
});

module.exports = router;
