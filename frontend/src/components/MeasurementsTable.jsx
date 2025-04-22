import React, { useEffect, useState } from 'react';

function MeasurementsTable({ user }) {
  const userRole = user?.role || user?.Role || 'موظف';
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    OrderID: '',
    ClientID: '',
    Status: '',
    AppointmentDate: '',
    AssignedTeam: '',
    PDFLink: '',
    Notes: '',
    NotificationSent: '',
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchMeasurements();
  }, []);

  const fetchMeasurements = async () => {
    setLoading(true);
    const res = await fetch('http://localhost:4000/api/measurements');
    const data = await res.json();
    setMeasurements(data);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد أنك تريد حذف هذا المقاس نهائيًا؟')) return;
    const res = await fetch(`http://localhost:4000/api/measurements/${id}`, {
      method: 'DELETE',
      headers: {
        'x-user-role': user?.role || user?.Role || 'موظف',
      },
    });
    if (res.ok) {
      setMeasurements(measurements.filter(m => m.MeasurementID !== id));
    } else {
      const err = await res.json();
      alert(err.error || 'حدث خطأ أثناء الحذف');
    }
  };

  const handleEdit = (measurement) => {
    setForm(measurement);
    setEditId(measurement.MeasurementID);
    setShowModal(true);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const roleHeader = { 'x-user-role': user?.role || user?.Role || 'موظف' };
    if (editId) {
      // تعديل مقاس
      const res = await fetch(`http://localhost:4000/api/measurements/${editId}`, {
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
      // إضافة مقاس جديد
      const res = await fetch('http://localhost:4000/api/measurements', {
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
      OrderID: '',
      ClientID: '',
      Status: '',
      AppointmentDate: '',
      AssignedTeam: '',
      PDFLink: '',
      Notes: '',
      NotificationSent: '',
    });
    setEditId(null);
    fetchMeasurements();
  };

  return (
    <div className="bg-white rounded shadow p-6 mb-8">
      <h2 className="text-xl font-bold mb-4 text-center">جدول المقاسات</h2>
      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => {
          setShowModal(true);
          setEditId(null);
          setForm({
            OrderID: '',
            ClientID: '',
            Status: '',
            AppointmentDate: '',
            AssignedTeam: '',
            PDFLink: '',
            Notes: '',
            NotificationSent: '',
          });
        }}
      >
        + إضافة مقاس جديد
      </button>
      {loading ? (
        <div className="text-center">جاري التحميل...</div>
      ) : (
        <table className="w-full border text-center">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">#</th>
              <th className="p-2 border">رقم الطلب</th>
              <th className="p-2 border">رقم العميل</th>
              <th className="p-2 border">الحالة</th>
              <th className="p-2 border">تاريخ الموعد</th>
              <th className="p-2 border">الفريق المكلف</th>
              <th className="p-2 border">رابط PDF</th>
              <th className="p-2 border">ملاحظات</th>
              <th className="p-2 border">إشعار</th>
              <th className="p-2 border">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {measurements.map((m, idx) => (
              <tr key={m.MeasurementID || idx} className="hover:bg-gray-50">
                <td className="p-2 border">{idx + 1}</td>
                <td className="p-2 border">{m.OrderID}</td>
                <td className="p-2 border">{m.ClientID}</td>
                <td className="p-2 border">{m.Status}</td>
                <td className="p-2 border">{m.AppointmentDate}</td>
                <td className="p-2 border">{m.AssignedTeam}</td>
                <td className="p-2 border">
                  <a href={m.PDFLink} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">رابط</a>
                </td>
                <td className="p-2 border">{m.Notes}</td>
                <td className="p-2 border">{m.NotificationSent}</td>
                <td className="p-2 border">
                  {(userRole === 'مدير' || userRole === 'مشرف' || userRole === 'admin' || userRole === 'مدير النظام') ? (
                    <>
                      <button className="text-blue-600 font-bold mr-2" onClick={() => handleEdit(m)}>تعديل</button>
                      <button className="text-red-600 font-bold" onClick={() => handleDelete(m.MeasurementID)}>حذف</button>
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
              {editId ? 'تعديل مقاس' : 'إضافة مقاس جديد'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto px-8 pb-4 pt-2">
              <div>
                <label className="block mb-1">رقم الطلب</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={form.OrderID}
                  onChange={e => setForm({ ...form, OrderID: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block mb-1">رقم العميل</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={form.ClientID}
                  onChange={e => setForm({ ...form, ClientID: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block mb-1">الحالة</label>
                <select
                  className="w-full border rounded p-2"
                  value={form.Status}
                  onChange={e => setForm({ ...form, Status: e.target.value })}
                >
                  <option value="">اختر الحالة</option>
                  <option value="بحاجة جدولة">بحاجة جدولة</option>
                  <option value="مجدول">مجدول</option>
                  <option value="مكتمل">مكتمل</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">تاريخ الموعد</label>
                <input
                  type="date"
                  className="w-full border rounded p-2"
                  value={form.AppointmentDate}
                  onChange={e => setForm({ ...form, AppointmentDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-1">الفريق المكلف</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={form.AssignedTeam}
                  onChange={e => setForm({ ...form, AssignedTeam: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-1">رابط PDF</label>
                <input
                  type="url"
                  className="w-full border rounded p-2"
                  value={form.PDFLink}
                  onChange={e => setForm({ ...form, PDFLink: e.target.value })}
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
                  onClick={() => {
                    setShowModal(false);
                    setEditId(null);
                    setForm({
                      OrderID: '',
                      ClientID: '',
                      Status: '',
                      AppointmentDate: '',
                      AssignedTeam: '',
                      PDFLink: '',
                      Notes: '',
                      NotificationSent: '',
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

export default MeasurementsTable;
