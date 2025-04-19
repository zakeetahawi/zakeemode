import React, { useEffect, useState } from 'react';

function ClientsTable() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ Name: '', Phone: '', Address: '', Type: '', Notes: '', IsActive: 'نشط' });
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
    // لم يتم تفعيل الحذف من Google Sheets بعد
    alert('الحذف غير مفعل حالياً.');
  };

  const handleEdit = (client) => {
    setForm(client);
    setEditId(client.ClientID);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // إضافة أو تعديل عميل
    await fetch('http://localhost:4000/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setShowModal(false);
    setForm({ Name: '', Phone: '', Address: '', Type: '', Notes: '', IsActive: 'نشط' });
    setEditId(null);
    fetchClients();
  };

  return (
    <div className="bg-white rounded shadow p-6 mb-8">
      <h2 className="text-xl font-bold mb-4 text-center">جدول العملاء</h2>
      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => { setShowModal(true); setEditId(null); setForm({ Name: '', Phone: '', Address: '', Type: '', Notes: '', IsActive: 'نشط' }); }}
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
              <th className="p-2 border">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client, idx) => (
              <tr key={client.ClientID || idx} className="hover:bg-gray-50">
                <td className="p-2 border">{idx + 1}</td>
                <td className="p-2 border">{client.Name}</td>
                <td className="p-2 border">{client.Phone}</td>
                <td className="p-2 border">{client.Address}</td>
                <td className="p-2 border">{client.Type}</td>
                <td className="p-2 border">{client.Notes}</td>
                <td className="p-2 border">{client.IsActive}</td>
                <td className="p-2 border">
                  <button
                    className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 mr-1"
                    onClick={() => handleEdit(client)}
                  >تعديل</button>
                  <button
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={() => handleDelete(client.ClientID)}
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
