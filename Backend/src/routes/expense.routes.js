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
    include: { splits: { include: { user: true, groupMember: true } } },
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
            userId: s.user_id || null,
            groupMemberId: s.group_member_id || null,
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
    include: { splits: { include: { user: true, groupMember: true } } },
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

  const { title, amount, type, date, splits, group_id, split_type } = req.body;

  // Validate splits if provided
  if (splits) {
    const totalShares = splits.reduce((a, b) => a + Number(b.amount), 0);
    if (Math.abs(totalShares - Number(amount)) > 0.05) {
      return res.status(400).json({ error: "Splits must sum to total amount" });
    }
  }

  try {
    const updated = await prisma.$transaction(async (prisma) => {
      // Update expense details
      const expense = await prisma.expense.update({
        where: { id },
        data: {
          title,
          amount: amount !== undefined ? Number(amount) : undefined,
          type,
          date: date ? new Date(date) : undefined,
          groupId: group_id !== undefined ? group_id : undefined,
        },
      });

      // If splits are provided, replace them
      if (splits && splits.length > 0) {
        await prisma.expenseSplit.deleteMany({ where: { expenseId: id } });
        await prisma.expenseSplit.createMany({
          data: splits.map((s) => ({
            expenseId: id,
            userId: s.user_id || null,
            groupMemberId: s.group_member_id || null,
            shareAmount: Number(s.amount),
          })),
        });
      }

      return prisma.expense.findUnique({
        where: { id },
        include: { splits: true },
      });
    });

    res.json(updated);
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ error: "Failed to update expense" });
  }
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
