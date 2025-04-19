import React, { useEffect, useState } from 'react';

function InventoryTable() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ItemName: '', Category: '', Quantity: '', Unit: '', Price: '', RelatedOrderID: '', CutOrderNumber: '', FactorySent: '', ExitPermitNumber: '', ContractNumber: '', Status: '', Notes: '', NotificationSent: '' });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    const res = await fetch('http://localhost:4000/api/inventory');
    const data = await res.json();
    setItems(data);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    alert('الحذف غير مفعل حالياً.');
  };

  const handleEdit = (item) => {
    setForm(item);
    setEditId(item.ItemID);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:4000/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setShowModal(false);
    setForm({ ItemName: '', Category: '', Quantity: '', Unit: '', Price: '', RelatedOrderID: '', CutOrderNumber: '', FactorySent: '', ExitPermitNumber: '', ContractNumber: '', Status: '', Notes: '', NotificationSent: '' });
    setEditId(null);
    fetchItems();
  };

  return (
    <div className="bg-white rounded shadow p-6 mb-8">
      <h2 className="text-xl font-bold mb-4 text-center">جدول المخزون</h2>
      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => { setShowModal(true); setEditId(null); setForm({ ItemName: '', Category: '', Quantity: '', Unit: '', Price: '', RelatedOrderID: '', CutOrderNumber: '', FactorySent: '', ExitPermitNumber: '', ContractNumber: '', Status: '', Notes: '', NotificationSent: '' }); }}
      >
        + إضافة صنف جديد
      </button>
      {loading ? (
        <div className="text-center">جاري التحميل...</div>
      ) : (
        <table className="w-full border text-center">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">#</th>
              <th className="p-2 border">اسم الصنف</th>
              <th className="p-2 border">التصنيف</th>
              <th className="p-2 border">الكمية</th>
              <th className="p-2 border">الوحدة</th>
              <th className="p-2 border">السعر</th>
              <th className="p-2 border">رقم الطلب المرتبط</th>
              <th className="p-2 border">رقم أمر القص</th>
              <th className="p-2 border">تم الإرسال للمصنع</th>
              <th className="p-2 border">رقم إذن الخروج</th>
              <th className="p-2 border">رقم العقد</th>
              <th className="p-2 border">الحالة</th>
              <th className="p-2 border">ملاحظات</th>
              <th className="p-2 border">إشعار</th>
              <th className="p-2 border">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.ItemID || idx} className="hover:bg-gray-50">
                <td className="p-2 border">{idx + 1}</td>
                <td className="p-2 border">{item.ItemName}</td>
                <td className="p-2 border">{item.Category}</td>
                <td className="p-2 border">{item.Quantity}</td>
                <td className="p-2 border">{item.Unit}</td>
                <td className="p-2 border">{item.Price}</td>
                <td className="p-2 border">{item.RelatedOrderID}</td>
                <td className="p-2 border">{item.CutOrderNumber}</td>
                <td className="p-2 border">{item.FactorySent}</td>
                <td className="p-2 border">{item.ExitPermitNumber}</td>
                <td className="p-2 border">{item.ContractNumber}</td>
                <td className="p-2 border">{item.Status}</td>
                <td className="p-2 border">{item.Notes}</td>
                <td className="p-2 border">{item.NotificationSent}</td>
                <td className="p-2 border">
                  <button
                    className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 mr-1"
                    onClick={() => handleEdit(item)}
                  >تعديل</button>
                  <button
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={() => handleDelete(item.ItemID)}
                  >حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border-2 border-blue-100 animate-fadeIn flex flex-col max-h-[95vh]">
            <h2 className="text-xl font-bold mb-2 text-center text-blue-800 sticky top-0 bg-white z-10 pt-6">
              {editId ? 'تعديل صنف' : 'إضافة صنف جديد'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto px-8 pb-4 pt-2">
              <div>
                <label className="block mb-1">اسم الصنف</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={form.ItemName}
                  onChange={e => setForm({ ...form, ItemName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block mb-1">التصنيف</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={form.Category}
                  onChange={e => setForm({ ...form, Category: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-1">الكمية</label>
                <input
                  type="number"
                  className="w-full border rounded p-2"
                  value={form.Quantity}
                  onChange={e => setForm({ ...form, Quantity: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-1">الوحدة</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={form.Unit}
                  onChange={e => setForm({ ...form, Unit: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-1">السعر</label>
                <input
                  type="number"
                  className="w-full border rounded p-2"
                  value={form.Price}
                  onChange={e => setForm({ ...form, Price: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-1">رقم الطلب المرتبط</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={form.RelatedOrderID}
                  onChange={e => setForm({ ...form, RelatedOrderID: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-1">رقم أمر القص</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={form.CutOrderNumber}
                  onChange={e => setForm({ ...form, CutOrderNumber: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-1">تم الإرسال للمصنع</label>
                <select
                  className="w-full border rounded p-2"
                  value={form.FactorySent}
                  onChange={e => setForm({ ...form, FactorySent: e.target.value })}
                >
                  <option value="">اختر</option>
                  <option value="True">تم الإرسال</option>
                  <option value="False">لم يتم الإرسال</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">رقم إذن الخروج</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={form.ExitPermitNumber}
                  onChange={e => setForm({ ...form, ExitPermitNumber: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-1">رقم العقد</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={form.ContractNumber}
                  onChange={e => setForm({ ...form, ContractNumber: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-1">الحالة</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={form.Status}
                  onChange={e => setForm({ ...form, Status: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-1">ملاحظات</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={form.Notes}
                  onChange={e => setForm({ ...form, Notes: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-1">إشعار</label>
                <select
                  className="w-full border rounded p-2"
                  value={form.NotificationSent}
                  onChange={e => setForm({ ...form, NotificationSent: e.target.value })}
                >
                  <option value="">اختر</option>
                  <option value="True">تم الإشعار</option>
                  <option value="False">لم يتم الإشعار</option>
                </select>
              </div>
              <div className="flex gap-2 justify-center">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >حفظ</button>
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={() => { setShowModal(false); setEditId(null); setForm({ ItemName: '', Category: '', Quantity: '', Unit: '', Price: '', RelatedOrderID: '', CutOrderNumber: '', FactorySent: '', ExitPermitNumber: '', ContractNumber: '', Status: '', Notes: '', NotificationSent: '' }); }}
                >إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryTable;
