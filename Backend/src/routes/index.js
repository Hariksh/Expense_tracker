const { Router } = require("express");
const auth = require("./auth.routes");
const expenses = require("./expense.routes");
const groups = require("./group.routes");

const router = Router();

router.use("/auth", auth);
router.use("/expenses", expenses);
router.use("/groups", groups);

module.exports = router;
