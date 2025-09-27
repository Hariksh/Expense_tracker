const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;

app.use(cors())
app.use(express.json())


let expenses = []

app.get("/expenses", (req, res) => {
  res.json(expenses)
})

app.post("/expenses", (req, res) => {
  const { amount, category, note, date } = req.body;
  const newExpense = {
    id: Date.now(),
    amount,
    category,
    note,
    date,
  };
  expenses.push(newExpense);
  res.status(201).json(newExpense);
});

app.delete("/expenses/:id", (req, res) => {
  const id = parseInt(req.params.id);
  expenses = expenses.filter((exp) => exp.id !== id);
  res.json({ success: true });
});


app.get("/", (req, res) => {
  res.send("Expense Tracker API is running!");
});

app.listen(port, () => {
  console.log(`Server has started at ${port}`);
});
