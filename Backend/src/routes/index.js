const { Router } = require("express");
const authRoutes = require("./auth.routes");
const expenseRoutes = require("./expense.routes");
const groupRoutes = require("./group.routes");
const contactRoutes = require("./contact.routes");

const router = Router();

router.use("/auth", authRoutes);
router.use("/expenses", expenseRoutes);
router.use("/groups", groupRoutes);
router.use("/contacts", contactRoutes);

module.exports = router;
