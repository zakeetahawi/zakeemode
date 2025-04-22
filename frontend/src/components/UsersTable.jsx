import React, { useEffect, useState } from 'react';

function UsersTable({ user }) {
  const userRole = user?.role || user?.Role || 'موظف';
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', role: '', branch: '1', active: true });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch('http://localhost:4000/api/users', {
      headers: {
        'x-user-role': userRole,
        'x-user-branch': user?.branch || user?.Branch || '1',
      },
    });
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد أنك تريد حذف هذا المستخدم نهائيًا؟')) return;
    const res = await fetch(`http://localhost:4000/api/users/${id}`, {
      method: 'DELETE',
      headers: {
        'x-user-role': userRole,
        'x-user-branch': user?.branch || user?.Branch || '1',
      },
    });
    if (res.ok) {
      setUsers(users.filter(u => u.id !== id));
    } else {
      const err = await res.json();
      alert(err.error || 'حدث خطأ أثناء الحذف');
    }
  };

  const handleEdit = (userObj) => {
    setForm({
      username: userObj.username,
      password: '',
      role: userObj.role,
      branch: userObj.branch || '1',
      active: userObj.active,
    });
    setEditId(userObj.id);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.username || (!editId && !form.password) || !form.role) {
      setError('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }
    let url = 'http://localhost:4000/api/users';
    let method = 'POST';
    if (editId) {
      url += `/${editId}`;
      method = 'PUT';
    }
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': userRole,
        'x-user-branch': user?.branch || user?.Branch || '1',
      },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowModal(false);
      setForm({ username: '', password: '', role: '', branch: '1', active: true });
      setEditId(null);
      fetchUsers();
    } else {
      const err = await res.json();
      setError(err.error || 'حدث خطأ أثناء الحفظ');
    }
  };

  return (
    <div className="bg-white rounded shadow p-6 mb-8">
      <h2 className="text-xl font-bold mb-4 text-center">جدول المستخدمين</h2>
      {(userRole === 'admin' || userRole === 'مدير' || userRole === 'مشرف' || userRole === 'مدير النظام') && (
        <button
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => { setShowModal(true); setEditId(null); setForm({ username: '', password: '', role: '', branch: '1', active: true }); }}
        >
          + إضافة مستخدم جديد
        </button>
      )}
      {loading ? (
        <div className="text-center">جاري التحميل...</div>
      ) : (
        <table className="w-full border text-center">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">#</th>
              <th className="p-2 border">اسم المستخدم</th>
              <th className="p-2 border">الدور</th>
              <th className="p-2 border">الفرع</th>
              <th className="p-2 border">نشط</th>
              <th className="p-2 border">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => (
              <tr key={u.id || idx} className="hover:bg-gray-50">
                <td className="p-2 border">{idx + 1}</td>
                <td className="p-2 border">{u.username}</td>
                <td className="p-2 border">{u.role}</td>
                <td className="p-2 border">{u.branch}</td>
                <td className="p-2 border">{u.active ? '✔️' : '❌'}</td>
                <td className="p-2 border">
                  {(userRole === 'admin' || userRole === 'مدير' || userRole === 'مشرف' || userRole === 'مدير النظام') && (
                    <>
                      <button className="text-blue-600 font-bold mr-2" onClick={() => handleEdit(u)}>تعديل</button>
                      <button className="text-red-600 font-bold" onClick={() => handleDelete(u.id)}>حذف</button>
                    </>
                  )}
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
              {editId ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto px-8 pb-4 pt-2">
              {error && <div className="text-red-600 text-center font-bold mb-2">{error}</div>}
              <div>
                <label className="block mb-1">اسم المستخدم</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>
              {!editId && (
                <div>
                  <label className="block mb-1">كلمة المرور</label>
                  <input
                    type="password"
                    className="w-full border rounded p-2"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                  />
                </div>
              )}
              <div>
                <label className="block mb-1">الدور</label>
                <select
                  className="w-full border rounded p-2"
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  required
                >
                  <option value="">اختر الدور</option>
                  <option value="admin">مدير النظام</option>
                  <option value="مدير">مدير</option>
                  <option value="مشرف">مشرف</option>
                  <option value="موظف">موظف</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">الفرع</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={form.branch}
                  onChange={e => setForm({ ...form, branch: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block mb-1">الحالة</label>
                <select
                  className="w-full border rounded p-2"
                  value={form.active ? 'true' : 'false'}
                  onChange={e => setForm({ ...form, active: e.target.value === 'true' })}
                >
                  <option value="true">نشط</option>
                  <option value="false">غير نشط</option>
                </select>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <button type="submit" className="px-6 py-2 bg-blue-700 text-white rounded font-bold hover:bg-blue-900">
                  {editId ? 'تحديث' : 'إضافة'}
                </button>
                <button type="button" className="px-6 py-2 bg-gray-200 text-gray-700 rounded font-bold hover:bg-gray-400" onClick={() => { setShowModal(false); setEditId(null); }}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersTable;
