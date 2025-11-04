const { Router } = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middlewares/auth");

const prisma = new PrismaClient();
const router = Router();

router.get("/", auth, async (req, res) => {
  const groups = await prisma.group.findMany({
    where: {
      OR: [
        { createdBy: req.user.id },
        { members: { some: { userId: req.user.id } } },
      ],
    },
    include: { members: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(groups);
});

router.post("/", auth, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "name is required" });
  const created = await prisma.group.create({
    data: { name, createdBy: req.user.id },
  });
  // Add creator as member
  await prisma.groupMember.create({
    data: { groupId: created.id, userId: req.user.id },
  });
  res.status(201).json(created);
});

router.post("/:id/members", auth, async (req, res) => {
  const groupId = parseInt(req.params.id);
  const { userIds } = req.body; // [1,2,3]
  const grp = await prisma.group.findUnique({ where: { id: groupId } });
  if (!grp) return res.status(404).json({ error: "Group not found" });
  if (grp.createdBy !== req.user.id)
    return res.status(403).json({ error: "Forbidden" });
  if (!Array.isArray(userIds) || userIds.length === 0)
    return res.status(400).json({ error: "userIds required" });
  await prisma.groupMember.createMany({
    data: userIds.map((uid) => ({ groupId, userId: uid })),
    skipDuplicates: true,
  });
  const members = await prisma.groupMember.findMany({
    where: { groupId },
    include: { user: true },
  });
  res.json({ groupId, members });
});

module.exports = router;
