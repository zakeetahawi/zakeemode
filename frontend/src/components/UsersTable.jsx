import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress, Select, MenuItem, FormControl, InputLabel, FormControlLabel, Switch } from '@mui/material';
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
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: 'background.default', p: 3, borderRadius: 3, boxShadow: 2, mb: 4 }}>
        <Typography variant="h6" align="center" color="primary" gutterBottom>جدول المستخدمين</Typography>
        {(userRole === 'admin' || userRole === 'مدير' || userRole === 'مشرف' || userRole === 'مدير النظام') && (
          <Button
            variant="contained"
            color="primary"
            size="medium"
            startIcon={<Add />}
            sx={{ mb: 2, fontWeight: 700 }}
            onClick={() => { setShowModal(true); setEditId(null); setForm({ username: '', password: '', role: '', branch: '1', active: true }); }}
          >
            إضافة مستخدم جديد
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
                  <TableCell align="center">اسم المستخدم</TableCell>
                  <TableCell align="center">الدور</TableCell>
                  <TableCell align="center">الفرع</TableCell>
                  <TableCell align="center">نشط</TableCell>
                  <TableCell align="center">إجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u, idx) => (
                  <TableRow key={u.id || idx} hover>
                    <TableCell align="center">{idx + 1}</TableCell>
                    <TableCell align="center">{u.username}</TableCell>
                    <TableCell align="center">{u.role}</TableCell>
                    <TableCell align="center">{u.branch}</TableCell>
                    <TableCell align="center">{u.active ? '✔️' : '❌'}</TableCell>
                    <TableCell align="center">
                      {(userRole === 'admin' || userRole === 'مدير' || userRole === 'مشرف' || userRole === 'مدير النظام') && (
                        <>
                          <IconButton color="primary" onClick={() => handleEdit(u)}><Edit /></IconButton>
                          <IconButton color="error" onClick={() => handleDelete(u.id)}><Delete /></IconButton>
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
            {editId ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 2 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TextField label="اسم المستخدم" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required fullWidth variant="outlined" />
            {!editId && (
              <TextField label="كلمة المرور" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required fullWidth variant="outlined" />
            )}
            <FormControl fullWidth required>
              <InputLabel>الدور</InputLabel>
              <Select
                label="الدور"
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
              >
                <MenuItem value="">اختر الدور</MenuItem>
                <MenuItem value="admin">مدير النظام</MenuItem>
                <MenuItem value="مدير">مدير</MenuItem>
                <MenuItem value="مشرف">مشرف</MenuItem>
                <MenuItem value="موظف">موظف</MenuItem>
              </Select>
            </FormControl>
            <TextField label="الفرع" value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })} required fullWidth variant="outlined" />
            <FormControlLabel control={<Switch checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} color="primary" />} label="نشط" sx={{ mr: 0, ml: 0 }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSubmit} variant="contained" color="primary">{editId ? 'تحديث' : 'إضافة'}</Button>
            <Button onClick={() => { setShowModal(false); setEditId(null); }} color="secondary">إلغاء</Button>
          </DialogActions>
        </Dialog>
        {/* Snackbar */}
        <Snackbar open={Boolean(error)} autoHideDuration={4000} onClose={() => setError('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity="error" variant="filled" sx={{ width: '100%' }} onClose={() => setError('')}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default UsersTable;
