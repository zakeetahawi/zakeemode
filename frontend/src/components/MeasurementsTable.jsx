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


function MeasurementsTable({ user }) {
  const userRole = user?.role || user?.Role || 'موظف';
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    MeasurementID: '',
    ClientID: '',
    OrderID: '',
    Date: '',
    Status: '',
    Notes: '',
  });
  const [editId, setEditId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchMeasurements();
  }, []);

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
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: 'background.default', p: 3, borderRadius: 3, boxShadow: 2, mb: 4 }}>
        <Typography variant="h6" align="center" color="primary" gutterBottom>جدول المقاسات</Typography>
        <Button
          variant="contained"
          color="primary"
          size="medium"
          startIcon={<Add />}
          sx={{ mb: 2, fontWeight: 700 }}
          onClick={() => { setShowModal(true); setEditId(null); setForm({ MeasurementID: '', ClientID: '', OrderID: '', Date: '', Status: '', Notes: '' }); }}
        >
          إضافة مقاس جديد
        </Button>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 2, borderRadius: 2 }}>
            <Table size="small" dir="rtl">
              <TableHead>
                <TableRow sx={{ bgcolor: 'secondary.light' }}>
                  <TableCell align="center">#</TableCell>
                  <TableCell align="center">رقم الطلب</TableCell>
                  <TableCell align="center">رقم العميل</TableCell>
                  <TableCell align="center">الحالة</TableCell>
                  <TableCell align="center">تاريخ القياس</TableCell>
                  <TableCell align="center">ملاحظات</TableCell>
                  <TableCell align="center">إجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {measurements.map((m, idx) => (
                  <TableRow key={m.MeasurementID || idx} hover>
                    <TableCell align="center">{idx + 1}</TableCell>
                    <TableCell align="center">{m.OrderID}</TableCell>
                    <TableCell align="center">{m.ClientID}</TableCell>
                    <TableCell align="center">{m.Status}</TableCell>
                    <TableCell align="center">{m.Date}</TableCell>
                    <TableCell align="center">{m.Notes}</TableCell>
                    <TableCell align="center">
                      <IconButton color="primary" onClick={() => handleEdit(m)}><Edit /></IconButton>
                      <IconButton color="error" onClick={() => handleDelete(m.MeasurementID)}><Delete /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {/* Modal */}
        <Dialog open={showModal} onClose={() => { setShowModal(false); setEditId(null); }} dir="rtl" PaperProps={{ sx: { borderRadius: 4, minWidth: 350 } }}>
          <DialogTitle sx={{ bgcolor: 'secondary.light', color: 'primary.dark', fontWeight: 700 }}>
            {editId ? 'تعديل مقاس' : 'إضافة مقاس جديد'}
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 2 }}>
            <TextField label="رقم الطلب" value={form.OrderID} onChange={e => setForm({ ...form, OrderID: e.target.value })} required fullWidth variant="outlined" />
            <TextField label="رقم العميل" value={form.ClientID} onChange={e => setForm({ ...form, ClientID: e.target.value })} required fullWidth variant="outlined" />
            <TextField label="الحالة" value={form.Status} onChange={e => setForm({ ...form, Status: e.target.value })} fullWidth variant="outlined" />
            <TextField label="تاريخ القياس" value={form.Date} onChange={e => setForm({ ...form, Date: e.target.value })} fullWidth variant="outlined" />
            <TextField label="ملاحظات" value={form.Notes} onChange={e => setForm({ ...form, Notes: e.target.value })} fullWidth variant="outlined" />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSubmit} variant="contained" color="primary">{editId ? 'تحديث' : 'إضافة'}</Button>
            <Button onClick={() => { setShowModal(false); setEditId(null); }} color="secondary">إلغاء</Button>
          </DialogActions>
        </Dialog>
        {/* Snackbar */}
        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default MeasurementsTable;
