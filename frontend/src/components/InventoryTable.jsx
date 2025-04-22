import React, { useEffect, useState } from 'react';

function InventoryTable({ user }) {
  const userRole = user?.role || user?.Role || 'موظف';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ItemName: '', Category: '', Quantity: '', Unit: '', Price: '', RelatedOrderID: '', CutOrderNumber: '', FactorySent: '', ExitPermitNumber: '', ContractNumber: '', Status: '', Notes: '', NotificationSent: '', branch: user?.branch || user?.Branch || '1' });
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
    if (!window.confirm('هل أنت متأكد أنك تريد حذف هذا الصنف نهائيًا؟')) return;
    const res = await fetch(`http://localhost:4000/api/inventory/${id}`, {
      method: 'DELETE',
      headers: {
        'x-user-role': user?.role || user?.Role || 'موظف',
      },
    });
    if (res.ok) {
      setItems(items.filter(i => i.ItemID !== id));
    } else {
      const err = await res.json();
      alert(err.error || 'حدث خطأ أثناء الحذف');
    }
  };

  const handleEdit = (item) => {
    setForm({ ...item, branch: item.branch || user?.branch || user?.Branch || '1' });
    setEditId(item.ItemID);
    setShowModal(true);
  };


  const handleSubmit = async (e) => {
    const ADMIN_ROLES = ['admin', 'مدير', 'مشرف', 'مدير النظام'];
    e.preventDefault();
    const roleHeader = { 'x-user-role': user?.role || user?.Role || 'موظف', 'x-user-branch': user?.branch || user?.Branch || '1' };
    let submitForm = { ...form };
    if (!ADMIN_ROLES.includes(user?.role || user?.Role || 'موظف')) {
      submitForm.branch = user?.branch || user?.Branch || '1';
    }
    if (editId) {
      // تعديل صنف
      const res = await fetch(`http://localhost:4000/api/inventory/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...roleHeader },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        if (err.error && err.error.includes('الصلاحية')) {
          alert('ليس لديك الصلاحية لتنفيذ هذا الإجراء');
          return;
        }
        alert(err.error || 'حدث خطأ أثناء التعديل');
        return;
      }
    } else {
      // إضافة صنف جديد
      const res = await fetch('http://localhost:4000/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...roleHeader },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        if (err.error && err.error.includes('الصلاحية')) {
          alert('ليس لديك الصلاحية لتنفيذ هذا الإجراء');
          return;
        }
        alert(err.error || 'حدث خطأ أثناء الإضافة');
        return;
      }
    }
    setShowModal(false);
    setForm({ ItemName: '', Category: '', Quantity: '', Unit: '', Price: '', RelatedOrderID: '', CutOrderNumber: '', FactorySent: '', ExitPermitNumber: '', ContractNumber: '', Status: '', Notes: '', NotificationSent: '', branch: user?.branch || user?.Branch || '1' });
    setEditId(null);
    fetchItems();
  };

  const [branchFilter, setBranchFilter] = useState('all');
const isAdmin = (userRole === 'مدير' || userRole === 'مشرف' || userRole === 'admin' || userRole === 'مدير النظام');
const branches = Array.from(new Set(items.map(i => i.branch).filter(Boolean)));

return (
    <div className="bg-white rounded shadow p-6 mb-8">
      {/* فلتر الفروع */}
      {isAdmin && (
        <div className="mb-4 flex items-center gap-2">
          <label className="font-semibold text-blue-900">فرع:</label>
          <select
            className="border rounded px-2 py-1"
            value={branchFilter}
            onChange={e => setBranchFilter(e.target.value)}
          >
            <option value="all">كل الفروع</option>
            {branches.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      )}

      <h2 className="text-xl font-bold mb-4 text-center">جدول المخزون</h2>
      {(userRole === 'مدير' || userRole === 'مشرف' || userRole === 'admin' || userRole === 'مدير النظام') && (
        <button
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => { setShowModal(true); setEditId(null); setForm({ ItemName: '', Category: '', Quantity: '', Unit: '', Price: '', RelatedOrderID: '', CutOrderNumber: '', FactorySent: '', ExitPermitNumber: '', ContractNumber: '', Status: '', Notes: '', NotificationSent: '', branch: user?.branch || user?.Branch || '1' }); }}
        >
          + إضافة صنف جديد
        </button>
      )}
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
              <th className="p-2 border">الفرع</th>
              <th className="p-2 border">إشعار</th>
              {(userRole === 'مدير' || userRole === 'مشرف' || userRole === 'admin' || userRole === 'مدير النظام') && (
                <th className="p-2 border">إجراءات</th>
              )}
            </tr>
          </thead>
          <tbody>
            {(isAdmin
                ? (branchFilter === 'all' ? items : items.filter(item => item.branch === branchFilter))
                : items.filter(item => item.branch === (user?.branch || user?.Branch || '1'))
              ).map((item, idx) => (
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
                    <td className="p-2 border">{item.branch || '-'}</td>
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

import InventoryMovements from './InventoryMovements';

export default function InventoryPage(props) {
  return (
    <>
      <InventoryTable {...props} />
      <InventoryMovements />
    </>
  );
}

// للإبقاء على التصدير القديم لمن يستخدمه مباشرة
export { InventoryTable };

