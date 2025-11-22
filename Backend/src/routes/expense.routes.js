const { Router } = require("express");
const { PrismaClient } = require("@prisma/client");
const { body, validationResult } = require("express-validator");
const auth = require("../middlewares/auth");

const prisma = new PrismaClient();
const router = Router();

router.get("/", auth, async (req, res) => {
  const items = await prisma.expense.findMany({
    where: { paidBy: req.user.id },
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
  body("split_with").isArray({ min: 1 }),
  body("split_type").isIn(["equal", "custom"]),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    const { title, amount, type, date, paid_by, split_with, split_type } =
      req.body;
    if (paid_by !== req.user.id)
      return res.status(403).json({ error: "Forbidden" });

    let splits = [];
    if (split_type === "equal") {
      const people = split_with.length + 1;
      const share = Number(amount) / people;
      const users = [paid_by, ...split_with];
      splits = users.map((uid) => ({ userId: uid, shareAmount: share }));
    } else {
      splits = split_with.map((s) => ({
        userId: s.userId,
        shareAmount: Number(s.shareAmount),
      }));
      const totalShares = splits.reduce((a, b) => a + b.shareAmount, 0);
      if (Math.abs(totalShares - Number(amount)) > 0.01) {
        return res
          .status(400)
          .json({ error: "Custom shares must sum to total amount" });
      }
      if (!splits.find((s) => s.userId === paid_by)) {
        splits.push({ userId: paid_by, shareAmount: 0 });
      }
    }

    const created = await prisma.expense.create({
      data: {
        title,
        amount: Number(amount),
        type,
        date: new Date(date),
        paidBy: paid_by,
        splits: {
          create: splits.map((s) => ({
            userId: s.userId,
            shareAmount: s.shareAmount,
          })),
        },
      },
      include: { splits: true },
    });
    res.status(201).json(created);
  }
);

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
