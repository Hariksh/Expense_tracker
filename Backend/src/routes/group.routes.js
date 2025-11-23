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

router.get("/:id", auth, async (req, res) => {
  const groupId = parseInt(req.params.id);
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: { include: { user: true } },
      expenses: {
        include: { splits: true },
        orderBy: { createdAt: "desc" }
      }
    },
  });

  if (!group) return res.status(404).json({ error: "Group not found" });

  const isMember = group.members.some(m => m.userId === req.user.id);
  if (!isMember && group.createdBy !== req.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  res.json(group);
});

router.post("/", auth, async (req, res) => {
  const { name, members } = req.body;
  if (!name) return res.status(400).json({ error: "name is required" });

  const created = await prisma.group.create({
    data: { name, createdBy: req.user.id },
  });

  // Add creator and other members
  const memberIds = Array.isArray(members) ? members : [req.user.id];
  // Ensure creator is included
  if (!memberIds.includes(req.user.id)) {
    memberIds.push(req.user.id);
  }

  // Deduplicate
  const uniqueIds = [...new Set(memberIds)];

  await prisma.groupMember.createMany({
    data: uniqueIds.map((uid) => ({ groupId: created.id, userId: uid })),
    skipDuplicates: true,
  });

  res.status(201).json(created);
});

router.post("/:id/members", auth, async (req, res) => {
  const groupId = parseInt(req.params.id);
  const { userIds } = req.body;
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

router.get("/:id/members", auth, async (req, res) => {
  const groupId = parseInt(req.params.id);
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: { include: { user: true } } },
  });
  if (!group) return res.status(404).json({ error: "Group not found" });

  const isMember = group.members.some(m => m.userId === req.user.id);
  if (!isMember && group.createdBy !== req.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const members = group.members.map(m => m.user);
  res.json(members);
});

module.exports = router;
