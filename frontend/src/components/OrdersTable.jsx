import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { arSD } from '@mui/material/locale';

const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: { main: '#8d6748' },
    secondary: { main: '#bfa980' },
    background: { default: '#f8f5f2', paper: '#fff9f3' },
    text: { primary: '#3e2c1c', secondary: '#6e5a41' },
    error: { main: '#a94442' },
    success: { main: '#6d8f6b' },
    warning: { main: '#c9b26b' },
    info: { main: '#7b8fa2' }
  },
  typography: {
    fontFamily: 'Cairo, Tahoma, Arial, sans-serif',
    h6: { fontWeight: 700 },
    button: { fontWeight: 700 },
  },
}, arSD);


function OrdersTable({ user }) {
  const userRole = user?.role || user?.Role || 'موظف';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    ClientID: '',
    OrderNumber: '',
    OrderType: '',
    ServiceTypes: '',
    InvoiceNumber: '',
    ContractNumber: '',
    Notes: '',
    DeliveryType: '',
    DeliveryBranch: '',
    Status: '',
    Priority: '',
    branch: user?.branch || user?.Branch || '1',
    Fabrics: [],
  });
  const [editId, setEditId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchOrders();
  }, []);


  // لإدارة أصناف القماش في النموذج
  const handleAddFabric = () => {
    setForm({ ...form, Fabrics: [...(form.Fabrics || []), { name: '', qty: '' }] });
  };
  const handleRemoveFabric = (idx) => {
    setForm({ ...form, Fabrics: form.Fabrics.filter((_, i) => i !== idx) });
  };
  const handleFabricChange = (idx, field, value) => {
    const newFabrics = [...form.Fabrics];
    newFabrics[idx][field] = value;
    setForm({ ...form, Fabrics: newFabrics });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const res = await fetch('http://localhost:4000/api/orders');
    const data = await res.json();
    // إذا كان هناك Fabrics كـ string، حوّله لمصفوفة
    setOrders(Array.isArray(data) ? data.map(order => ({
      ...order,
      Fabrics: Array.isArray(order.Fabrics) ? order.Fabrics : (order.Fabrics ? JSON.parse(order.Fabrics) : []),
    })) : []);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد أنك تريد حذف هذا الطلب نهائيًا؟')) return;
    const res = await fetch(`http://localhost:4000/api/orders/${id}`, {
      method: 'DELETE',
      headers: {
        'x-user-role': userRole,
      },
    });
    if (res.ok) {
      setOrders(orders.filter(o => o.OrderID !== id));
      setSnackbar({ open: true, message: 'تم حذف الطلب بنجاح', severity: 'success' });
    } else {
      const err = await res.json();
      if (err.error && err.error.includes('الصلاحية')) {
        setSnackbar({ open: true, message: 'ليس لديك الصلاحية لتنفيذ هذا الإجراء', severity: 'error' });
        return;
      }
      setSnackbar({ open: true, message: err.error || 'حدث خطأ أثناء الحذف', severity: 'error' });
    }
  };

  const handleEdit = (order) => {
    setForm({
      ...order,
      Fabrics: Array.isArray(order.Fabrics) ? order.Fabrics : (order.Fabrics ? JSON.parse(order.Fabrics) : []),
      branch: order.branch || user?.branch || '1',
    });
    setEditId(order.OrderID);
    setShowModal(true);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const roleHeader = { 'x-user-role': userRole, 'x-user-branch': user?.branch || user?.Branch || '1' };
    let submitForm = { ...form };
    // تأكد أن Fabrics مصفوفة وليست نص
    if (submitForm.Fabrics && typeof submitForm.Fabrics === 'string') {
      try { submitForm.Fabrics = JSON.parse(submitForm.Fabrics); } catch { submitForm.Fabrics = []; }
    }
    if (!Array.isArray(submitForm.Fabrics)) submitForm.Fabrics = [];
    // إذا لم يكن المستخدم مشرف، اجعل branch تلقائي من المستخدم
    if (!(userRole === 'مدير' || userRole === 'مشرف' || userRole === 'admin' || userRole === 'مدير النظام')) {
      submitForm.branch = user?.branch || user?.Branch || '1';
    }
    if (editId) {
      // تعديل طلب
      const res = await fetch(`http://localhost:4000/api/orders/${editId}`, {
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
      // إضافة طلب جديد
      const res = await fetch('http://localhost:4000/api/orders', {
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
    setForm({
      ClientID: '',
      OrderNumber: '',
      OrderType: '',
      ServiceTypes: '',
      InvoiceNumber: '',
      ContractNumber: '',
      Notes: '',
      DeliveryType: '',
      DeliveryBranch: '',
      Status: '',
      Priority: '',
      branch: user?.branch || user?.Branch || '1',
      Fabrics: [],
    });
    setEditId(null);
    fetchOrders();
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-gray-100 rounded-3xl shadow-2xl p-8 mb-12 border border-gray-200 max-w-7xl mx-auto rtl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-3xl font-extrabold text-blue-900 tracking-tight mb-2 md:mb-0 text-center md:text-right">جدول الطلبات</h2>
        {(userRole === 'مدير' || userRole === 'مشرف' || userRole === 'admin' || userRole === 'مدير النظام') && (
          <button
            className="px-6 py-2 bg-gradient-to-l from-blue-700 to-blue-500 text-white rounded-full shadow-md hover:scale-105 hover:from-blue-800 hover:to-blue-600 transition-all duration-200 font-bold text-lg"
            onClick={() => {
              setShowModal(true);
              setEditId(null);
              setForm({
                ClientID: '',
                OrderNumber: '',
                OrderType: '',
                ServiceTypes: '',
                InvoiceNumber: '',
                ContractNumber: '',
                Notes: '',
                DeliveryType: '',
                DeliveryBranch: '',
                Status: '',
                Priority: '',
                branch: user?.branch || user?.Branch || '1',
                Fabrics: [],
              });
            }}
          >
            + إضافة طلب جديد
          </button>
        )}
      </div>
      {loading ? (
        <div className="text-center text-blue-700 text-xl font-semibold py-8 animate-pulse">جاري التحميل...</div>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow-inner">
          <table className="w-full border-separate border-spacing-y-2 text-center">
            <thead>
              <tr className="bg-gradient-to-l from-blue-200 to-blue-100 text-blue-900 text-lg">
                <th className="p-3 rounded-tl-xl">#</th>
                <th className="p-3">رقم الطلب</th>
                <th className="p-3">رقم العميل</th>
                <th className="p-3">نوع الطلب</th>
                <th className="p-3">الخدمات</th>
                <th className="p-3">رقم الفاتورة</th>
                <th className="p-3">رقم العقد</th>
                <th className="p-3">ملاحظات</th>
                <th className="p-3">نوع التسليم</th>
                <th className="p-3">فرع التسليم</th>
                <th className="p-3">الأقمشة</th>
                <th className="p-3">الحالة</th>
                <th className="p-3">الأولوية</th>
                <th className="p-3">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, idx) => (
                <tr key={order.OrderID || idx} className="hover:bg-gray-50">
                  <td className="p-3">{idx + 1}</td>
                  <td className="p-3">{order.OrderNumber}</td>
                  <td className="p-3">{order.ClientID}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${order.OrderType === 'VIP' ? 'bg-yellow-300 text-yellow-900' : 'bg-gray-200 text-gray-700'}`}>{order.OrderType}</span>
                  </td>
                  <td className="p-3">{order.ServiceTypes}</td>
                  <td className="p-3">{order.InvoiceNumber}</td>
                  <td className="p-3">{order.ContractNumber}</td>
                  <td className="p-3">{order.Notes}</td>
                  <td className="p-3">{order.DeliveryType}</td>
                  <td className="p-3">{order.DeliveryBranch}</td>
                  <td className="p-3">
                    {order.Fabrics && order.Fabrics.length > 0 ? (
                      <ul className="list-disc list-inside text-xs text-blue-900">
                        {order.Fabrics.map((f, i) => (
                          <li key={i}>{f.name} ({f.qty})</li>
                        ))}
                      </ul>
                    ) : <span className="text-gray-400">لا يوجد</span>}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${order.Status === 'جديد' ? 'bg-green-200 text-green-800' : order.Status === 'قيد التنفيذ' ? 'bg-yellow-200 text-yellow-800' : order.Status === 'مكتمل' ? 'bg-blue-200 text-blue-800' : 'bg-red-200 text-red-800'}`}>{order.Status}</span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${order.Priority === 'VIP' ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-700'}`}>{order.Priority}</span>
                  </td>
                  <td className="p-2 border">
                    {(userRole === 'مدير' || userRole === 'مشرف' || userRole === 'admin' || userRole === 'مدير النظام') ? (
                      <>
                        <button className="text-blue-600 font-bold mr-2" onClick={() => handleEdit(order)}>تعديل</button>
                        <button className="text-red-600 font-bold" onClick={() => handleDelete(order.OrderID)}>حذف</button>
                      </>
                    ) : null}
                    <button
                      className="w-24 px-3 py-1 bg-gradient-to-l from-green-500 to-green-400 text-white rounded-full shadow hover:from-green-600 hover:to-green-500 hover:scale-105 transition-all duration-150 font-bold"
                      onClick={() => handleEdit(order)}
                    >تعديل</button>
                    <button
                      className="w-24 px-3 py-1 bg-gradient-to-l from-red-500 to-red-400 text-white rounded-full shadow hover:from-red-600 hover:to-red-500 hover:scale-105 transition-all duration-150 font-bold"
                      onClick={() => handleDelete(order.OrderID)}
                    >حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-4 relative">
            <h2 className="text-2xl font-extrabold mb-2 text-center text-blue-800 sticky top-0 bg-white z-10 pt-6">{editId ? 'تعديل طلب' : 'إضافة طلب جديد'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto px-8 pb-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* حقول القماش */}
                <div className="md:col-span-2">
                  <label className="block mb-1 font-semibold text-blue-900">أنواع القماش للطلب</label>
                  {(form.Fabrics || []).map((f, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="اسم القماش"
                        className="w-1/2 border-2 border-blue-100 rounded-lg p-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                        value={f.name}
                        onChange={e => handleFabricChange(idx, 'name', e.target.value)}
                        required
                      />
                      <input
                        type="number"
                        placeholder="الكمية"
                        className="w-1/4 border-2 border-blue-100 rounded-lg p-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                        value={f.qty}
                        min={1}
                        onChange={e => handleFabricChange(idx, 'qty', e.target.value)}
                        required
                      />
                      <button type="button" className="px-2 py-1 bg-red-100 text-red-700 rounded" onClick={() => handleRemoveFabric(idx)}>حذف</button>
                    </div>
                  ))}
                  <button type="button" className="px-4 py-1 bg-blue-100 text-blue-700 rounded mt-1" onClick={handleAddFabric}>+ إضافة نوع قماش</button>
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-blue-900">رقم العميل</label>
                  <input
                    type="text"
                    className="w-full border-2 border-blue-100 rounded-lg p-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                    value={form.ClientID}
                    onChange={e => setForm({ ...form, ClientID: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-blue-900">الخدمات</label>
                  <input
                    type="text"
                    className="w-full border-2 border-blue-100 rounded-lg p-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                    value={form.ServiceTypes}
                    onChange={e => setForm({ ...form, ServiceTypes: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-blue-900">رقم الفاتورة</label>
                  <input
                    type="text"
                    className="w-full border-2 border-blue-100 rounded-lg p-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                    value={form.InvoiceNumber}
                    onChange={e => setForm({ ...form, InvoiceNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-blue-900">رقم العقد</label>
                  <input
                    type="text"
                    className="w-full border-2 border-blue-100 rounded-lg p-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                    value={form.ContractNumber}
                    onChange={e => setForm({ ...form, ContractNumber: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1 font-semibold text-blue-900">ملاحظات</label>
                  <input
                    type="text"
                    className="w-full border-2 border-blue-100 rounded-lg p-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                    value={form.Notes}
                    onChange={e => setForm({ ...form, Notes: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-blue-900">نوع التسليم</label>
                  <input
                    type="text"
                    className="w-full border-2 border-blue-100 rounded-lg p-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                    value={form.DeliveryType}
                    onChange={e => setForm({ ...form, DeliveryType: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-blue-900">الفرع</label>
                  <input
                    type="text"
                    className="w-full border-2 border-blue-100 rounded-lg p-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                    value={form.DeliveryBranch}
                    onChange={e => setForm({ ...form, DeliveryBranch: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-blue-900">الحالة</label>
                  <select
                    className="w-full border-2 border-blue-100 rounded-lg p-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                    value={form.Status}
                    onChange={e => setForm({ ...form, Status: e.target.value })}
                  >
                    <option value="">اختر الحالة</option>
                    <option value="جديد">جديد</option>
                    <option value="قيد التنفيذ">قيد التنفيذ</option>
                    <option value="مكتمل">مكتمل</option>
                    <option value="ملغى">ملغى</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-blue-900">الأولوية</label>
                  <select
                    className="w-full border-2 border-blue-100 rounded-lg p-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                    value={form.Priority}
                    onChange={e => setForm({ ...form, Priority: e.target.value })}
                  >
                    <option value="">اختر الأولوية</option>
                    <option value="عادي">عادي</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 justify-center mt-4 sticky bottom-0 bg-white z-10 pb-6 pt-2 border-t border-blue-100">
                <button
                  type="submit"
                  className="px-8 py-2 bg-gradient-to-l from-blue-700 to-blue-500 text-white rounded-full shadow-md hover:scale-105 hover:from-blue-800 hover:to-blue-600 transition-all duration-200 font-bold text-lg"
                >حفظ</button>
                <button
                  type="button"
                  className="px-8 py-2 bg-gray-200 text-gray-800 rounded-full shadow hover:bg-gray-300 hover:scale-105 transition-all duration-200 font-bold text-lg"
                  onClick={() => {
                    setShowModal(false);
                    setEditId(null);
                    setForm({
                      ClientID: '',
                      OrderNumber: '',
                      OrderType: '',
                      ServiceTypes: '',
                      InvoiceNumber: '',
                      ContractNumber: '',
                      Notes: '',
                      DeliveryType: '',
                      DeliveryBranch: '',
                      Status: '',
                      Priority: '',
                    });
                  }}
                >إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default OrdersTable;
