import React, { useEffect } from 'react';
import { User } from 'lucide-react';

import UserDetailPage from './UserDetailPage';

export default function UsersPage() {
  const [viewUser, setViewUser] = React.useState<any | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [userList, setUserList] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { API_ENDPOINTS } = await import('../../config/api');
        const { getToken } = await import('../../services/authService');

        const response = await fetch(API_ENDPOINTS.admin.users, {
          headers: {
            'Content-Type': 'application/json',
            ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
          },
        });

        const data = await response.json();
        if (response.ok) {
          // Filter out admin users (check if email matches ADMIN_EMAIL or if is_admin is true)
          const regularUsers = (data.users || []).map((u: any) => ({
            id: String(u.id),
            name: `${u.first_name} ${u.last_name}`,
            email: u.email,
            joined: u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A',
            status: u.is_active ? 'Active' : 'Inactive',
            flagged: false, // You can add a flagged field to the User model if needed
            phone: u.phone_number || 'No phone',
            first_name: u.first_name,
            last_name: u.last_name,
            is_active: u.is_active,
            is_verified: u.is_verified,
            created_at: u.created_at,
            phone_number: u.phone_number,
          }));
          setUserList(regularUsers);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleFlag = (id: string) => {
    setUserList(prev => prev.map(u => u.id === id ? { ...u, flagged: !u.flagged } : u));
  };

  const handleDelete = (id: string) => {
    setUserList(prev => prev.filter(u => u.id !== id));
  };

  // Show user detail page if a user is selected
  if (viewUser) {
    return <UserDetailPage user={viewUser} onBack={() => setViewUser(null)} />;
  }

  return (
    <div className="w-full mx-auto px-2 sm:px-4 lg:px-0">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
        <User className="w-6 h-6 text-[#27aae2]" />
        All Users
      </h2>
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading users...</div>
      ) : userList.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No users found</div>
      ) : (
        <>
      {/* Mobile Card Layout */}
      <div className="block sm:hidden space-y-4">
        {userList.map(user => (
          <div key={user.id} className="rounded-xl shadow border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 flex flex-col gap-2 cursor-pointer" onClick={() => setViewUser(user)}>
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-gray-900 dark:text-white">{user.name}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>{user.status}</span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">{user.email}</div>
            <div className="text-xs text-gray-600 dark:text-gray-300">Joined: {user.joined}</div>
            <div className="text-xs text-gray-600 dark:text-gray-300">Phone: {user.phone}</div>
            {/* Checkbox for mobile */}
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={selectedIds.includes(user.id)}
                onChange={e => { e.stopPropagation(); handleSelect(user.id); }}
                className="form-checkbox h-4 w-4 text-[#27aae2] border-gray-300 dark:border-gray-600 rounded"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">Select to enable actions</span>
            </div>
            {user.flagged && (
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 w-fit">Flagged</span>
            )}
            <div className="flex gap-2 mt-2">
              <button
                onClick={e => { e.stopPropagation(); handleFlag(user.id); }}
                disabled={!selectedIds.includes(user.id)}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold ${user.flagged ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'} hover:bg-yellow-100 dark:hover:bg-yellow-800 transition-colors ${!selectedIds.includes(user.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {user.flagged ? 'Unflag' : 'Flag'}
              </button>
              <button
                onClick={e => { e.stopPropagation(); handleDelete(user.id); }}
                disabled={!selectedIds.includes(user.id)}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 transition-colors ${!selectedIds.includes(user.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Desktop Table Layout */}
      <div className="hidden sm:block overflow-x-auto rounded-xl shadow border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
        <table className="min-w-full text-sm sm:text-base">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="py-2 sm:py-3 px-2 sm:px-4 text-center text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Select</th>
              <th className="py-2 sm:py-3 px-2 sm:px-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">User</th>
              <th className="py-2 sm:py-3 px-2 sm:px-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Phone</th>
              <th className="py-2 sm:py-3 px-2 sm:px-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Joined</th>
              <th className="py-2 sm:py-3 px-2 sm:px-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Status</th>
              <th className="py-2 sm:py-3 px-2 sm:px-4 text-center text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {userList.map(user => (
              <tr key={user.id} className="border-t border-gray-100 dark:border-gray-700 cursor-pointer" onClick={() => setViewUser(user)}>
                {/* Checkbox */}
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-center" onClick={e => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(user.id)}
                    onChange={() => handleSelect(user.id)}
                    className="form-checkbox h-4 w-4 text-[#27aae2] border-gray-300 dark:border-gray-600 rounded"
                  />
                </td>
                {/* Profile pic, name, email */}
                <td className="py-2 sm:py-3 px-2 sm:px-4 flex items-center gap-3 whitespace-nowrap">
                  <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-lg font-bold text-gray-500 dark:text-gray-400">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">{user.email}</div>
                  </div>
                </td>
                {/* Phone */}
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">{user.phone}</td>
                {/* Joined */}
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">{user.joined}</td>
                {/* Status */}
                <td className="py-2 sm:py-3 px-2 sm:px-4 whitespace-nowrap">
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${user.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {user.status}
                  </span>
                  {user.flagged && (
                    <span className="ml-2 px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Flagged</span>
                  )}
                </td>
                {/* Actions: flag and delete icons */}
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-center whitespace-nowrap" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => handleFlag(user.id)}
                    title={user.flagged ? 'Unflag' : 'Flag'}
                    disabled={!selectedIds.includes(user.id)}
                    className={`inline-flex items-center justify-center mr-2 p-2 rounded-full ${user.flagged ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'} hover:bg-yellow-100 dark:hover:bg-yellow-800 transition-colors ${!selectedIds.includes(user.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v16h16V4H4zm2 2h12v12H6V6zm2 2v8m4-8v8" /></svg>
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    title="Delete"
                    disabled={!selectedIds.includes(user.id)}
                    className={`inline-flex items-center justify-center p-2 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 transition-colors ${!selectedIds.includes(user.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        </>
      )}
    </div>
  );
}
