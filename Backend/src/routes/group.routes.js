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


  const membersList = Array.isArray(members) ? members : [];


  const creatorExists = membersList.some(m => m.userId === req.user.id);
  if (!creatorExists) {
    membersList.push({ userId: req.user.id });
  }


  const realUsers = membersList.filter(m => m.userId).map(m => ({ groupId: created.id, userId: m.userId }));
  const virtualMembers = membersList.filter(m => m.name && !m.userId).map(m => ({ groupId: created.id, name: m.name }));


  const uniqueRealUsers = Array.from(new Map(realUsers.map(item => [item.userId, item])).values());

  if (uniqueRealUsers.length > 0) {
    await prisma.groupMember.createMany({
      data: uniqueRealUsers,
      skipDuplicates: true,
    });
  }

  if (virtualMembers.length > 0) {
    await prisma.groupMember.createMany({
      data: virtualMembers,
      skipDuplicates: true,
    });
  }

  res.status(201).json(created);
});

router.post("/:id/members", auth, async (req, res) => {
  const groupId = parseInt(req.params.id);
  const { members } = req.body;

  const grp = await prisma.group.findUnique({ where: { id: groupId } });
  if (!grp) return res.status(404).json({ error: "Group not found" });
  if (grp.createdBy !== req.user.id)
    return res.status(403).json({ error: "Forbidden" });

  if (!Array.isArray(members) || members.length === 0)
    return res.status(400).json({ error: "members array required" });


  const realUsers = members.filter(m => m.userId).map(m => ({ groupId, userId: m.userId }));
  const virtualMembers = members.filter(m => m.name && !m.userId).map(m => ({ groupId, name: m.name }));

  if (realUsers.length > 0) {
    await prisma.groupMember.createMany({
      data: realUsers,
      skipDuplicates: true,
    });
  }

  if (virtualMembers.length > 0) {
    await prisma.groupMember.createMany({
      data: virtualMembers,
      skipDuplicates: true,
    });
  }

  const currentMembers = await prisma.groupMember.findMany({
    where: { groupId },
    include: { user: true },
  });
  res.json({ groupId, members: currentMembers });
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


  res.json(group.members);
});

module.exports = router;
