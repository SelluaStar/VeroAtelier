import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Shield, ShieldOff } from 'lucide-react';
import './Users.css';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdmin = async (user) => {
    if (!window.confirm(`Are you sure you want to ${user.is_admin ? 'remove' : 'grant'} admin access for ${user.full_name}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !user.is_admin })
        .eq('id', user.id);

      if (error) throw error;
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user: ' + error.message);
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-users">
      <div className="users-header">
        <h1>Users</h1>
        <div className="users-stats">
          <div className="stat-badge">
            <span className="stat-count">{users.length}</span>
            <span className="stat-label">Total Users</span>
          </div>
          <div className="stat-badge">
            <span className="stat-count">{users.filter(u => u.is_admin).length}</span>
            <span className="stat-label">Admins</span>
          </div>
        </div>
      </div>

      <div className="users-toolbar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="users-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Location</th>
              <th>Joined</th>
              <th>Admin</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                  Loading...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-cell">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.full_name} className="user-avatar" />
                      ) : (
                        <div className="avatar-placeholder">
                          {user.full_name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <span className="user-name">{user.full_name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.phone || '-'}</td>
                  <td>
                    {user.city && user.country
                      ? `${user.city}, ${user.country}`
                      : user.country || '-'}
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className={`admin-toggle ${user.is_admin ? 'active' : ''}`}
                      onClick={() => toggleAdmin(user)}
                      title={user.is_admin ? 'Remove admin' : 'Grant admin'}
                    >
                      {user.is_admin ? <Shield size={18} /> : <ShieldOff size={18} />}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Users;
