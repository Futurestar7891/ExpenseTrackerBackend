const express = require("express");
const verifyUser = require("../middleware/verifyuser");
const addExpense = require("../controllers/expense/addexpense");
const getExpenses = require("../controllers/expense/getexpense");
const getCategories=require("../controllers/expense/getcategory");
const deleteExpense = require("../controllers/expense/deleteexpense");
const updateExpense = require("../controllers/expense/updateexpense");


const router = express.Router();

router.post("/add-expense", verifyUser, addExpense);
router.get("/get-expense",verifyUser,getExpenses);
router.get("/get-categories",verifyUser,getCategories);
router.delete("/delete-expense/:id",verifyUser,deleteExpense);
router.put("/update-expense/:id",verifyUser,updateExpense);



module.exports = router;
