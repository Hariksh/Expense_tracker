const { Router } = require("express");
const { PrismaClient } = require("@prisma/client");
const { body, validationResult } = require("express-validator");
const auth = require("../middlewares/auth");

const prisma = new PrismaClient();
const router = Router();

// GET /contacts - Fetch contacts with search and pagination
router.get("/", auth, async (req, res) => {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {
        ownerId: req.user.id,
    };

    if (search) {
        where.contactUser = {
            OR: [
                { name: { contains: search } },
                { email: { contains: search } },
            ],
        };
    }

    try {
        const [contacts, total] = await prisma.$transaction([
            prisma.contact.findMany({
                where,
                include: { contactUser: { select: { id: true, name: true, email: true } } },
                skip,
                take,
                orderBy: { contactUser: { name: 'asc' } },
            }),
            prisma.contact.count({ where }),
        ]);

        res.json({
            data: contacts.map(c => c.contactUser),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / take),
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch contacts" });
    }
});

// POST /contacts - Add a contact by email
router.post(
    "/",
    auth,
    body("email").isEmail(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { email } = req.body;

        if (email === req.user.email) {
            return res.status(400).json({ error: "You cannot add yourself" });
        }

        try {
            const userToAdd = await prisma.user.findUnique({ where: { email } });
            if (!userToAdd) {
                return res.status(404).json({ error: "User not found" });
            }

            const existing = await prisma.contact.findUnique({
                where: {
                    ownerId_contactUserId: {
                        ownerId: req.user.id,
                        contactUserId: userToAdd.id,
                    },
                },
            });

            if (existing) {
                return res.status(400).json({ error: "User is already in your contacts" });
            }

            await prisma.contact.create({
                data: {
                    ownerId: req.user.id,
                    contactUserId: userToAdd.id,
                },
            });

            res.status(201).json({ message: "Contact added successfully", user: userToAdd });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to add contact" });
        }
    }
);

module.exports = router;
