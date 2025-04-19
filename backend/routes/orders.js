const express = require('express');
const router = express.Router();
const { getSheetRows, addSheetRow } = require('../googleSheets');

const SHEET_NAME = 'Orders';

// جلب جميع الطلبات
router.get('/', async (req, res) => {
  try {
    const rows = await getSheetRows(SHEET_NAME);
    const headers = rows[0];
    const orders = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i] || ''; });
      return obj;
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// إضافة طلب جديد
router.post('/', async (req, res) => {
  try {
    const { ClientID, OrderNumber, OrderType, ServiceTypes, InvoiceNumber, ContractNumber, Notes, DeliveryType, DeliveryBranch, Status, Priority, CreatedAt, UpdatedAt } = req.body;
    const row = [
      '', // OrderID (يتم توليده لاحقًا)
      ClientID,
      OrderNumber,
      OrderType,
      ServiceTypes,
      InvoiceNumber,
      ContractNumber,
      Notes,
      DeliveryType,
      DeliveryBranch,
      Status,
      Priority,
      CreatedAt,
      UpdatedAt
    ];
    await addSheetRow(SHEET_NAME, row);
    res.status(201).json({ message: 'تمت إضافة الطلب بنجاح' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
