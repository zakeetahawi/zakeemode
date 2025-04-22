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


function InstallationsTable({ user }) {
  const userRole = user?.role || user?.Role || 'موظف';
  const [installations, setInstallations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    OrderID: '',
    ClientID: '',
    Status: '',
    AppointmentDate: '',
    AssignedTeam: '',
    ContractNumber: '',
    Notes: '',
    NotificationSent: '',
  });
  const [editId, setEditId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchInstallations();
  }, []);

  const fetchInstallations = async () => {
    setLoading(true);
    const res = await fetch('http://localhost:4000/api/installations');
    const data = await res.json();
    setInstallations(data);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد أنك تريد حذف هذه التركيبة نهائيًا؟')) return;
    const res = await fetch(`http://localhost:4000/api/installations/${id}`, {
      method: 'DELETE',
      headers: {
        'x-user-role': userRole,
      },
    });
    if (res.ok) {
      setInstallations(installations.filter(i => i.InstallationID !== id));
      setSnackbar({ open: true, message: 'تم حذف التركيبة بنجاح', severity: 'success' });
    } else {
      const err = await res.json();
      setSnackbar({ open: true, message: err.error || 'حدث خطأ أثناء الحذف', severity: 'error' });
    }
  };

  const handleEdit = (installation) => {
    setForm(installation);
    setEditId(installation.InstallationID);
    setShowModal(true);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const roleHeader = { 'x-user-role': userRole };
    if (editId) {
      // تعديل تركيبة
      const res = await fetch(`http://localhost:4000/api/installations/${editId}`, {
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
      // إضافة تركيبة جديدة
      const res = await fetch('http://localhost:4000/api/installations', {
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
      ContractNumber: '',
      Notes: '',
      NotificationSent: '',
    });
    setEditId(null);
    fetchInstallations();
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: 'background.default', p: 3, borderRadius: 3, boxShadow: 2, mb: 4 }}>
        <Typography variant="h6" align="center" color="primary" gutterBottom>جدول التركيبات</Typography>
        <Button
          variant="contained"
          color="primary"
          size="medium"
          startIcon={<Add />}
          sx={{ mb: 2, fontWeight: 700 }}
          onClick={() => { setShowModal(true); setEditId(null); setForm({ OrderID: '', ClientID: '', Status: '', AppointmentDate: '', AssignedTeam: '', ContractNumber: '', Notes: '', NotificationSent: '' }); }}
        >
          إضافة تركيبة جديدة
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
                  <TableCell align="center">تاريخ الموعد</TableCell>
                  <TableCell align="center">الفريق</TableCell>
                  <TableCell align="center">رقم العقد</TableCell>
                  <TableCell align="center">ملاحظات</TableCell>
                  <TableCell align="center">إجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {installations.map((i, idx) => (
                  <TableRow key={i.InstallationID || idx} hover>
                    <TableCell align="center">{idx + 1}</TableCell>
                    <TableCell align="center">{i.OrderID}</TableCell>
                    <TableCell align="center">{i.ClientID}</TableCell>
                    <TableCell align="center">{i.Status}</TableCell>
                    <TableCell align="center">{i.AppointmentDate}</TableCell>
                    <TableCell align="center">{i.AssignedTeam}</TableCell>
                    <TableCell align="center">{i.ContractNumber}</TableCell>
                    <TableCell align="center">{i.Notes}</TableCell>
                    <TableCell align="center">
                      <IconButton color="primary" onClick={() => handleEdit(i)}><Edit /></IconButton>
                      <IconButton color="error" onClick={() => handleDelete(i.InstallationID)}><Delete /></IconButton>
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
            {editId ? 'تعديل تركيبة' : 'إضافة تركيبة جديدة'}
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 2 }}>
            <TextField label="رقم الطلب" value={form.OrderID} onChange={e => setForm({ ...form, OrderID: e.target.value })} required fullWidth variant="outlined" />
            <TextField label="رقم العميل" value={form.ClientID} onChange={e => setForm({ ...form, ClientID: e.target.value })} required fullWidth variant="outlined" />
            <TextField label="الحالة" value={form.Status} onChange={e => setForm({ ...form, Status: e.target.value })} fullWidth variant="outlined" />
            <TextField label="تاريخ الموعد" value={form.AppointmentDate} onChange={e => setForm({ ...form, AppointmentDate: e.target.value })} fullWidth variant="outlined" />
            <TextField label="الفريق" value={form.AssignedTeam} onChange={e => setForm({ ...form, AssignedTeam: e.target.value })} fullWidth variant="outlined" />
            <TextField label="رقم العقد" value={form.ContractNumber} onChange={e => setForm({ ...form, ContractNumber: e.target.value })} fullWidth variant="outlined" />
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

export default InstallationsTable;
