import React, { useState } from 'react';

// بيانات تجريبية
const initialMovements = [
  { id: 1, itemName: 'كابل نحاس', type: 'إدخال', quantity: 20, date: '2025-04-21', notes: 'شراء جديد' },
  { id: 2, itemName: 'لوحة توزيع', type: 'إخراج', quantity: 3, date: '2025-04-22', notes: 'صرف لموقع A' },
];

export default function InventoryMovements() {
  const [movements, setMovements] = useState(initialMovements);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ itemName: '', type: 'إدخال', quantity: '', date: '', notes: '' });
  const [editId, setEditId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      setMovements(movements.map(m => m.id === editId ? { ...form, id: editId } : m));
    } else {
      setMovements([...movements, { ...form, id: Date.now() }]);
    }
    setShowModal(false);
    setForm({ itemName: '', type: 'إدخال', quantity: '', date: '', notes: '' });
    setEditId(null);
  };

  const handleEdit = (m) => {
    setForm(m);
    setEditId(m.id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('هل أنت متأكد من حذف الحركة؟')) {
      setMovements(movements.filter(m => m.id !== id));
    }
  };

  return (
    <div className="bg-white rounded shadow p-6 mb-8">
      <h2 className="text-xl font-bold mb-4 text-center">حركات المخزون</h2>
      <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => { setShowModal(true); setEditId(null); setForm({ itemName: '', type: 'إدخال', quantity: '', date: '', notes: '' }); }}>
        + إضافة حركة
      </button>
      <table className="w-full border text-center">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">#</th>
            <th className="p-2 border">اسم الصنف</th>
            <th className="p-2 border">نوع الحركة</th>
            <th className="p-2 border">الكمية</th>
            <th className="p-2 border">التاريخ</th>
            <th className="p-2 border">ملاحظات</th>
            <th className="p-2 border">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((m, idx) => (
            <tr key={m.id} className="hover:bg-gray-50">
              <td className="p-2 border">{idx + 1}</td>
              <td className="p-2 border">{m.itemName}</td>
              <td className="p-2 border">{m.type}</td>
              <td className="p-2 border">{m.quantity}</td>
              <td className="p-2 border">{m.date}</td>
              <td className="p-2 border">{m.notes}</td>
              <td className="p-2 border">
                <button className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 mr-1" onClick={() => handleEdit(m)}>تعديل</button>
                <button className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600" onClick={() => handleDelete(m.id)}>حذف</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border-2 border-blue-100 animate-fadeIn flex flex-col max-h-[95vh]">
            <h2 className="text-xl font-bold mb-2 text-center text-blue-800 sticky top-0 bg-white z-10 pt-6">
              {editId ? 'تعديل حركة' : 'إضافة حركة'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto px-8 pb-4 pt-2">
              <div>
                <label className="block mb-1">اسم الصنف</label>
                <input type="text" className="w-full border rounded p-2" value={form.itemName} onChange={e => setForm({ ...form, itemName: e.target.value })} required />
              </div>
              <div>
                <label className="block mb-1">نوع الحركة</label>
                <select className="w-full border rounded p-2" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="إدخال">إدخال</option>
                  <option value="إخراج">إخراج</option>
                  <option value="تحويل">تحويل</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">الكمية</label>
                <input type="number" className="w-full border rounded p-2" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required />
              </div>
              <div>
                <label className="block mb-1">التاريخ</label>
                <input type="date" className="w-full border rounded p-2" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
              </div>
              <div>
                <label className="block mb-1">ملاحظات</label>
                <input type="text" className="w-full border rounded p-2" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="flex gap-2 justify-center">
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">حفظ</button>
                <button type="button" className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" onClick={() => { setShowModal(false); setEditId(null); setForm({ itemName: '', type: 'إدخال', quantity: '', date: '', notes: '' }); }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
