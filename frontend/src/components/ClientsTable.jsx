import React, { useEffect, useState } from 'react';

function ClientsTable({ user }) {
  const userRole = user?.role || user?.Role || 'موظف';
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ Name: '', Phone: '', Address: '', Type: '', Notes: '', IsActive: 'نشط', branch: user?.branch || user?.Branch || '1' });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    const res = await fetch('http://localhost:4000/api/clients');
    const data = await res.json();
    setClients(data);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد أنك تريد حذف هذا العميل نهائيًا؟')) return;
    const res = await fetch(`http://localhost:4000/api/clients/${id}`, {
      method: 'DELETE',
      headers: {
        'x-user-role': userRole,
      },
    });
    if (res.ok) {
      setClients(clients.filter(c => c.ClientID !== id));
    } else {
      const err = await res.json();
      alert(err.error || 'حدث خطأ أثناء الحذف');
    }
  };

  const handleEdit = (client) => {
    setForm({ ...client, branch: client.branch || user?.branch || user?.Branch || '1' });
    setEditId(client.ClientID);
    setShowModal(true);
  };


  const handleSubmit = async (e) => {
    const ADMIN_ROLES = ['admin', 'مدير', 'مشرف', 'مدير النظام'];
    e.preventDefault();
    const roleHeader = { 'x-user-role': userRole, 'x-user-branch': user?.branch || user?.Branch || '1' };
    let submitForm = { ...form };
    if (!ADMIN_ROLES.includes(userRole)) {
      submitForm.branch = user?.branch || user?.Branch || '1';
    }
    if (editId) {
      // تعديل عميل
      const res = await fetch(`http://localhost:4000/api/clients/${editId}`, {
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
      // إضافة عميل جديد
      const res = await fetch('http://localhost:4000/api/clients', {
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
    setForm({ Name: '', Phone: '', Address: '', Type: '', Notes: '', IsActive: 'نشط', branch: user?.branch || user?.Branch || '1' });
    setEditId(null);
    fetchClients();
  };

  const [branchFilter, setBranchFilter] = useState('all');
const isAdmin = (userRole === 'مدير' || userRole === 'مشرف' || userRole === 'admin' || userRole === 'مدير النظام');
const branches = Array.from(new Set(clients.map(c => c.branch).filter(Boolean)));

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

      <h2 className="text-xl font-bold mb-4 text-center">جدول العملاء</h2>
      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => { setShowModal(true); setEditId(null); setForm({ Name: '', Phone: '', Address: '', Type: '', Notes: '', IsActive: 'نشط', branch: user?.branch || user?.Branch || '1' }); }}
      >
        + إضافة عميل جديد
      </button>
      {loading ? (
        <div className="text-center">جاري التحميل...</div>
      ) : (
        <table className="w-full border text-center">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">#</th>
              <th className="p-2 border">الاسم</th>
              <th className="p-2 border">الهاتف</th>
              <th className="p-2 border">العنوان</th>
              <th className="p-2 border">النوع</th>
              <th className="p-2 border">ملاحظات</th>
              <th className="p-2 border">الحالة</th>
              <th className="p-2 border">الفرع</th>
              <th className="p-2 border">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {(isAdmin
                ? (branchFilter === 'all' ? clients : clients.filter(client => client.branch === branchFilter))
                : clients.filter(client => client.branch === (user?.branch || user?.Branch || '1'))
              ).map((client, idx) => (
              <tr key={client.ClientID || idx} className="hover:bg-gray-50">
                <td className="p-2 border">{idx + 1}</td>
                <td className="p-2 border">{client.Name}</td>
                <td className="p-2 border">{client.Phone}</td>
                <td className="p-2 border">{client.Address}</td>
                <td className="p-2 border">{client.Type}</td>
                <td className="p-2 border">{client.Notes}</td>
                <td className="p-2 border">{client.IsActive}</td>
                    <td className="p-2 border">{client.branch || '-'}</td>
                <td className="p-2 border">
                  {(userRole === 'مدير' || userRole === 'مشرف' || userRole === 'admin' || userRole === 'مدير النظام') ? (
                    <>
                      <button className="text-blue-600 font-bold mr-2" onClick={() => handleEdit(client)}>تعديل</button>
                      <button className="text-red-600 font-bold" onClick={() => handleDelete(client.ClientID)}>حذف</button>
                    </>
                  ) : null}
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
              {editId ? 'تعديل عميل' : 'إضافة عميل جديد'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto px-8 pb-4 pt-2">
              <div>
                <label className="block mb-1">اسم العميل</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={form.Name}
                  onChange={e => setForm({ ...form, Name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block mb-1">الهاتف</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={form.Phone}
                  onChange={e => setForm({ ...form, Phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-1">العنوان</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={form.Address}
                  onChange={e => setForm({ ...form, Address: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-1">النوع</label>
                <select
                  className="w-full border rounded p-2"
                  value={form.Type}
                  onChange={e => setForm({ ...form, Type: e.target.value })}
                >
                  <option value="">اختر النوع</option>
                  <option value="أفراد">أفراد</option>
                  <option value="معرض">معرض</option>
                  <option value="جملة">جملة</option>
                  <option value="شركات">شركات</option>
                  <option value="مهندسين">مهندسين</option>
                </select>
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
                <label className="block mb-1">الحالة</label>
                <select
                  className="w-full border rounded p-2"
                  value={form.IsActive}
                  onChange={e => setForm({ ...form, IsActive: e.target.value })}
                >
                  <option value="نشط">نشط</option>
                  <option value="غير نشط">غير نشط</option>
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
                  onClick={() => { setShowModal(false); setEditId(null); setForm({ Name: '', Phone: '', Address: '', Type: '', Notes: '', IsActive: 'نشط' }); }}
                >إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientsTable;
