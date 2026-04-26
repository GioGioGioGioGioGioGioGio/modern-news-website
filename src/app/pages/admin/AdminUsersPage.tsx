import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Shield, ShieldAlert, ShieldCheck, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ role: 'user' });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  const handleRoleChange = async (userId: string, role: string) => {
    await supabase.from('profiles').update({ role }).eq('id', userId);
    loadUsers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminare questo utente?')) return;
    await supabase.from('profiles').delete().eq('id', id);
    loadUsers();
  };

  const RoleIcon = ({ role }: { role: string }) => {
    switch (role) {
      case 'admin':
        return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case 'editor':
        return <ShieldCheck className="w-4 h-4 text-green-500" />;
      case 'journalist':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl">Utenti</h1>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-4 text-left text-sm font-medium">Utente</th>
              <th className="p-4 text-left text-sm font-medium">Ruolo</th>
              <th className="p-4 text-left text-sm font-medium">Data</th>
              <th className="w-20 p-4"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="p-4"><div className="h-4 w-48 bg-muted rounded animate-pulse" /></td>
                  <td className="p-4"><div className="h-4 w-20 bg-muted rounded animate-pulse" /></td>
                  <td className="p-4"><div className="h-4 w-24 bg-muted rounded animate-pulse" /></td>
                  <td className="p-4"><div className="h-8 w-8 bg-muted rounded animate-pulse" /></td>
                </tr>
              ))
            ) : users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="border-t border-border">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium">{user.full_name || '-'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="px-2 py-1 border border-border rounded bg-background text-sm"
                    >
                      <option value="user">User</option>
                      <option value="journalist">Journalist</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString('it-IT')}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-2 hover:bg-muted rounded text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="border-t border-border">
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  Nessun utente.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}