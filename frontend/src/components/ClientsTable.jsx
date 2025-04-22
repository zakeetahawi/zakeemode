import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { arSD } from '@mui/material/locale';

// Theme ترابي مخصص
const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: { main: '#8d6748' }, // بني ترابي
    secondary: { main: '#bfa980' }, // رملي فاتح
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


function ClientsTable({ user }) {
  // ...
  // باقي المتغيرات كما هي
  const userRole = user?.role || user?.Role || 'موظف';
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ Name: '', Phone: '', Address: '', Type: '', Notes: '', IsActive: 'نشط', branch: user?.branch || user?.Branch || '1' });
  const [editId, setEditId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchClients();
  }, []);

  // ... باقي الدوال كما هي مع استبدال alert بـ setSnackbar


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
      setSnackbar({ open: true, message: 'تم حذف العميل بنجاح', severity: 'success' });
    } else {
      const err = await res.json();
      setSnackbar({ open: true, message: err.error || 'حدث خطأ أثناء الحذف', severity: 'error' });
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
          setSnackbar({ open: true, message: 'ليس لديك الصلاحية لتنفيذ هذا الإجراء', severity: 'error' });
          return;
        }
        setSnackbar({ open: true, message: err.error || 'حدث خطأ أثناء التعديل', severity: 'error' });
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
          setSnackbar({ open: true, message: 'ليس لديك الصلاحية لتنفيذ هذا الإجراء', severity: 'error' });
          return;
        }
        setSnackbar({ open: true, message: err.error || 'حدث خطأ أثناء الإضافة', severity: 'error' });
        return;
      }
    }
    setShowModal(false);
    setForm({ Name: '', Phone: '', Address: '', Type: '', Notes: '', IsActive: 'نشط', branch: user?.branch || user?.Branch || '1' });
    setEditId(null);
    fetchClients();
    setSnackbar({ open: true, message: editId ? 'تم تحديث العميل بنجاح' : 'تم إضافة العميل بنجاح', severity: 'success' });
  };

  const [branchFilter, setBranchFilter] = useState('all');
  const isAdmin = (userRole === 'مدير' || userRole === 'مشرف' || userRole === 'admin' || userRole === 'مدير النظام');
  const branches = Array.from(new Set(clients.map(c => c.branch).filter(Boolean)));

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: 'background.default', p: 3, borderRadius: 3, boxShadow: 2, mb: 4 }}>
        <Typography variant="h6" align="center" color="primary" gutterBottom>جدول العملاء</Typography>
        {(userRole === 'admin' || userRole === 'مدير' || userRole === 'مشرف' || userRole === 'مدير النظام') && (
          <Button
            variant="contained"
            color="primary"
            size="medium"
            startIcon={<Add />}
            sx={{ mb: 2, fontWeight: 700 }}
            onClick={() => { setShowModal(true); setEditId(null); setForm({ Name: '', Phone: '', Address: '', Type: '', Notes: '', IsActive: 'نشط', branch: user?.branch || user?.Branch || '1' }); }}
          >
            إضافة عميل جديد
          </Button>
        )}
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
                  <TableCell align="center">الاسم</TableCell>
                  <TableCell align="center">الهاتف</TableCell>
                  <TableCell align="center">العنوان</TableCell>
                  <TableCell align="center">النوع</TableCell>
                  <TableCell align="center">ملاحظات</TableCell>
                  <TableCell align="center">الحالة</TableCell>
                  <TableCell align="center">الفرع</TableCell>
                  <TableCell align="center">إجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clients.map((c, idx) => (
                  <TableRow key={c.ClientID || idx} hover>
                    <TableCell align="center">{idx + 1}</TableCell>
                    <TableCell align="center">{c.Name}</TableCell>
                    <TableCell align="center">{c.Phone}</TableCell>
                    <TableCell align="center">{c.Address}</TableCell>
                    <TableCell align="center">{c.Type}</TableCell>
                    <TableCell align="center">{c.Notes}</TableCell>
                    <TableCell align="center">{c.IsActive}</TableCell>
                    <TableCell align="center">{c.branch}</TableCell>
                    <TableCell align="center">
                      {(userRole === 'admin' || userRole === 'مدير' || userRole === 'مشرف' || userRole === 'مدير النظام') && (
                        <>
                          <IconButton color="primary" onClick={() => handleEdit(c)}><Edit /></IconButton>
                          <IconButton color="error" onClick={() => handleDelete(c.ClientID)}><Delete /></IconButton>
                        </>
                      )}
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
            {editId ? 'تعديل عميل' : 'إضافة عميل جديد'}
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 2 }}>
            <TextField label="الاسم" value={form.Name} onChange={e => setForm({ ...form, Name: e.target.value })} required fullWidth variant="outlined" />
            <TextField label="الهاتف" value={form.Phone} onChange={e => setForm({ ...form, Phone: e.target.value })} required fullWidth variant="outlined" />
            <TextField label="العنوان" value={form.Address} onChange={e => setForm({ ...form, Address: e.target.value })} required fullWidth variant="outlined" />
            <TextField label="النوع" value={form.Type} onChange={e => setForm({ ...form, Type: e.target.value })} fullWidth variant="outlined" />
            <TextField label="ملاحظات" value={form.Notes} onChange={e => setForm({ ...form, Notes: e.target.value })} fullWidth variant="outlined" />
            <TextField select label="الحالة" value={form.IsActive} onChange={e => setForm({ ...form, IsActive: e.target.value })} SelectProps={{ native: true }} fullWidth variant="outlined">
              <option value="نشط">نشط</option>
              <option value="غير نشط">غير نشط</option>
            </TextField>
            <TextField label="الفرع" value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })} required fullWidth variant="outlined" />
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

export default ClientsTable;
