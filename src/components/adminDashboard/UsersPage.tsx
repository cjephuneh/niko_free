import React, { useEffect, useState } from 'react';
import { User, Search, Ban, XCircle, CheckCircle, AlertCircle, Loader, X } from 'lucide-react';
import { API_BASE_URL, getImageUrl, API_ENDPOINTS } from '../../config/api';
import { getToken } from '../../services/authService';
import UserDetailPage from './UserDetailPage';

export default function UsersPage() {
  const [viewUser, setViewUser] = React.useState<any | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [userList, setUserList] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const [selectedUserForFlag, setSelectedUserForFlag] = useState<any | null>(null);
  const [flagNotes, setFlagNotes] = useState('');
  const [isFlagging, setIsFlagging] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'recent' | 'inactive' | 'dormant'>('all');

  // Helper function to map user data with activity status
  const mapUserWithActivityStatus = (u: any) => {
    // Calculate user activity status based on last_login
    let activityStatus = 'dormant';
    
    if (u.last_login) {
      const lastLoginDate = new Date(u.last_login);
      const now = new Date();
      
      // Validate the date
      if (isNaN(lastLoginDate.getTime())) {
        // Invalid date, treat as never logged in
        activityStatus = 'dormant';
      } else {
        // Calculate difference in milliseconds
        const diffMs = now.getTime() - lastLoginDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        const diffMonths = diffDays / 30;
        
        // Check if last login is in the future (data error)
        if (diffMs < 0) {
          // Future date - treat as active (data might be wrong but user is likely active)
          activityStatus = 'active';
        } else if (diffDays <= 30) {
          // Within last 30 days (1 month)
          activityStatus = 'active';
        } else if (diffDays <= 90) {
          // 31-90 days (2-3 months)
          activityStatus = 'recent';
        } else if (diffDays <= 180) {
          // 91-180 days (4-6 months)
          activityStatus = 'inactive';
        } else {
          // Over 180 days (over 6 months)
          activityStatus = 'dormant';
        }
      }
    } else {
      // Never logged in - check if account is very new (created within last month)
      // If account is new and never logged in, they might just be new users
      if (u.created_at) {
        const createdDate = new Date(u.created_at);
        const now = new Date();
        const daysSinceCreation = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
        
        // If account was created less than 30 days ago and never logged in, mark as active (new user)
        // Otherwise, mark as dormant (old account that never logged in)
        if (daysSinceCreation <= 30 && !isNaN(createdDate.getTime())) {
          activityStatus = 'active'; // New user who hasn't logged in yet
        } else {
          activityStatus = 'dormant'; // Old account that never logged in
        }
      } else {
        activityStatus = 'dormant'; // No creation date, treat as dormant
      }
    }

    // Determine last active display
    let lastActiveDisplay = 'Never';
    let lastActiveDate = null;
    
    if (u.last_login) {
      lastActiveDisplay = new Date(u.last_login).toLocaleDateString();
      lastActiveDate = new Date(u.last_login);
    } else if (u.created_at) {
      // If never logged in, show registration date with indicator
      lastActiveDisplay = `${new Date(u.created_at).toLocaleDateString()} (Registered)`;
      lastActiveDate = new Date(u.created_at);
    }

    return {
      id: String(u.id),
      name: `${u.first_name} ${u.last_name}`,
      email: u.email,
      joined: u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A',
      lastActive: lastActiveDisplay,
      lastActiveDate: lastActiveDate,
      status: u.is_active ? 'Active' : 'Inactive',
      activityStatus: activityStatus,
      flagged: !u.is_active,
      phone: u.phone_number || 'No phone',
      first_name: u.first_name,
      last_name: u.last_name,
      is_active: u.is_active,
      is_verified: u.is_verified,
      created_at: u.created_at,
      last_login: u.last_login,
      phone_number: u.phone_number,
      profile_picture: u.profile_picture,
    };
  };

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
          const regularUsers = (data.users || []).map(mapUserWithActivityStatus);
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

  const handleFlag = async (user: any) => {
    setSelectedUserForFlag(user);
    setIsFlagModalOpen(true);
  };

  const handleFlagUser = async () => {
    if (!selectedUserForFlag || !flagNotes.trim()) {
      alert('Please provide notes when flagging a user');
      return;
    }

    setIsFlagging(true);
    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(API_ENDPOINTS.admin.flagUser(Number(selectedUserForFlag.id)), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: flagNotes.trim() }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to flag user');

      // Refresh users list
      const usersResponse = await fetch(API_ENDPOINTS.admin.users, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const usersData = await usersResponse.json();
      if (usersResponse.ok) {
        const regularUsers = (usersData.users || []).map(mapUserWithActivityStatus);
        setUserList(regularUsers);
      }

      setIsFlagModalOpen(false);
      setSelectedUserForFlag(null);
      setFlagNotes('');
      alert('User flagged successfully');
    } catch (error: any) {
      alert(error.message || 'Failed to flag user');
    } finally {
      setIsFlagging(false);
    }
  };

  const handleUnflag = async (user: any) => {
    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(API_ENDPOINTS.admin.unflagUser(Number(user.id)), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to unflag user');

      // Refresh users list
      const usersResponse = await fetch(API_ENDPOINTS.admin.users, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const usersData = await usersResponse.json();
      if (usersResponse.ok) {
        const regularUsers = (usersData.users || []).map(mapUserWithActivityStatus);
        setUserList(regularUsers);
      }
      alert('User unflagged successfully');
    } catch (error: any) {
      alert(error.message || 'Failed to unflag user');
    }
  };

  const handleDelete = (user: any) => {
    setSelectedUserForDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUserForDelete) return;

    setIsDeleting(true);
    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(API_ENDPOINTS.admin.deleteUser(Number(selectedUserForDelete.id)), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete user');

      // Refresh users list
      const usersResponse = await fetch(API_ENDPOINTS.admin.users, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const usersData = await usersResponse.json();
      if (usersResponse.ok) {
        const regularUsers = (usersData.users || []).map(mapUserWithActivityStatus);
        setUserList(regularUsers);
      }

      setIsDeleteModalOpen(false);
      setSelectedUserForDelete(null);
      alert('User deleted successfully');
    } catch (error: any) {
      alert(error.message || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter users based on search query and status filter
  const filteredUsers = userList.filter(user => {
    // Search filter
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.phone.toLowerCase().includes(query)
    );

    // Status filter
    const matchesStatus = statusFilter === 'all' || user.activityStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Count users by activity status
  const statusCounts = {
    all: userList.length,
    active: userList.filter(u => u.activityStatus === 'active').length,
    recent: userList.filter(u => u.activityStatus === 'recent').length,
    inactive: userList.filter(u => u.activityStatus === 'inactive').length,
    dormant: userList.filter(u => u.activityStatus === 'dormant').length,
  };

  // Show user detail page if a user is selected
  if (viewUser) {
    return <UserDetailPage user={viewUser} onBack={() => setViewUser(null)} />;
  }

  return (
    <div className="w-full mx-auto px-2 sm:px-4 lg:px-0">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <User className="w-6 h-6 text-[#27aae2]" />
              All Users
            </h2>
            <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold border border-blue-300 dark:border-blue-700">
              {filteredUsers.length} / {userList.length}
            </span>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#27aae2] focus:border-transparent"
            />
          </div>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              statusFilter === 'all'
                ? 'bg-gradient-to-r from-[#27aae2] to-[#1e8bb8] text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All ({statusCounts.all})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              statusFilter === 'active'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Active ({statusCounts.active})
          </button>
          <button
            onClick={() => setStatusFilter('recent')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              statusFilter === 'recent'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Recent ({statusCounts.recent})
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              statusFilter === 'inactive'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Inactive ({statusCounts.inactive})
          </button>
          <button
            onClick={() => setStatusFilter('dormant')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              statusFilter === 'dormant'
                ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Dormant ({statusCounts.dormant})
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading users...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchQuery ? 'No users found matching your search' : 'No users found'}
        </div>
      ) : (
        <>
      {/* Mobile Card Layout */}
      <div className="block sm:hidden space-y-4">
        {filteredUsers.map(user => {
          const profileImageUrl = user.profile_picture 
            ? getImageUrl(user.profile_picture)
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=27aae2&color=fff&size=128`;
          
          return (
          <div key={user.id} className="rounded-xl shadow border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 flex flex-col gap-2 cursor-pointer" onClick={() => setViewUser(user)}>
            <div className="flex items-center gap-3">
              <img
                src={profileImageUrl}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=27aae2&color=fff&size=128`;
                }}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-gray-900 dark:text-white">{user.name}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    user.activityStatus === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    user.activityStatus === 'recent' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    user.activityStatus === 'inactive' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                    'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {user.activityStatus === 'active' ? 'Active' :
                     user.activityStatus === 'recent' ? 'Recent' :
                     user.activityStatus === 'inactive' ? 'Inactive' :
                     'Dormant'}
                  </span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">{user.email}</div>
              </div>
            </div>
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
            <div className="text-xs text-gray-600 dark:text-gray-300">Last Active: {user.lastActive}</div>
            <div className="flex gap-2 mt-2">
              {user.flagged ? (
                <button
                  onClick={e => { e.stopPropagation(); handleUnflag(user); }}
                  className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold bg-green-200 text-green-800 dark:bg-green-900/40 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
                >
                  Unflag
                </button>
              ) : (
                <button
                  onClick={e => { e.stopPropagation(); handleFlag(user); }}
                  className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold bg-orange-200 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-800 transition-colors"
                >
                  Flag
                </button>
              )}
              <button
                onClick={e => { e.stopPropagation(); handleDelete(user); }}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
          );
        })}
      </div>
      {/* Desktop Table Layout */}
      <div className="hidden sm:block overflow-x-auto rounded-xl shadow border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
        <table className="min-w-full text-sm sm:text-base">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="py-2 sm:py-3 px-2 sm:px-4 text-center text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Select</th>
              <th 
                className="py-2 sm:py-3 px-2 sm:px-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                onClick={() => handleSort('name')}
              >
                User {getSortIcon('name')}
              </th>
              <th className="py-2 sm:py-3 px-2 sm:px-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Phone</th>
              <th className="py-2 sm:py-3 px-2 sm:px-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Joined</th>
              <th className="py-2 sm:py-3 px-2 sm:px-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Last Active</th>
              <th className="py-2 sm:py-3 px-2 sm:px-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Status</th>
              <th className="py-2 sm:py-3 px-2 sm:px-4 text-center text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
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
                  {user.profile_picture ? (
                    <img
                      src={getImageUrl(user.profile_picture)}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=27aae2&color=fff&size=128`;
                      }}
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-lg font-bold text-gray-500 dark:text-gray-400">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">{user.email}</div>
                  </div>
                </td>
                {/* Phone */}
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">{user.phone}</td>
                {/* Joined */}
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">{user.joined}</td>
                {/* Last Active */}
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">{user.lastActive}</td>
                {/* Status */}
                <td className="py-2 sm:py-3 px-2 sm:px-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold w-fit ${
                      user.activityStatus === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      user.activityStatus === 'recent' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      user.activityStatus === 'inactive' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                      'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {user.activityStatus === 'active' ? 'Active' :
                       user.activityStatus === 'recent' ? 'Recent' :
                       user.activityStatus === 'inactive' ? 'Inactive' :
                       'Dormant'}
                    </span>
                    {user.flagged && (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 w-fit">Flagged</span>
                    )}
                  </div>
                </td>
                {/* Actions: flag and delete icons */}
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-center whitespace-nowrap" onClick={e => e.stopPropagation()}>
                  {user.flagged ? (
                    <button
                      onClick={() => handleUnflag(user)}
                      title="Unflag"
                      className="inline-flex items-center justify-center mr-2 p-2 rounded-full bg-green-200 text-green-800 dark:bg-green-900/40 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleFlag(user)}
                      title="Flag"
                      className="inline-flex items-center justify-center mr-2 p-2 rounded-full bg-orange-200 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-800 transition-colors"
                    >
                      <Ban className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(user)}
                    title="Delete"
                    className="inline-flex items-center justify-center p-2 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        </>
      )}

      {/* Flag User Modal */}
      {isFlagModalOpen && selectedUserForFlag && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Flag User</h2>
              <button
                onClick={() => {
                  setIsFlagModalOpen(false);
                  setSelectedUserForFlag(null);
                  setFlagNotes('');
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  You are about to flag <strong>{selectedUserForFlag.first_name} {selectedUserForFlag.last_name}</strong> ({selectedUserForFlag.email}).
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Please provide notes explaining why this user is being flagged. This will help track the reason for flagging.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes *
                </label>
                <textarea
                  value={flagNotes}
                  onChange={(e) => setFlagNotes(e.target.value)}
                  placeholder="Enter notes explaining why this user is being flagged..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2] resize-none"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  These notes will be logged in the admin activity log
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setIsFlagModalOpen(false);
                    setSelectedUserForFlag(null);
                    setFlagNotes('');
                  }}
                  className="px-6 py-2.5 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:border-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFlagUser}
                  disabled={isFlagging || !flagNotes.trim()}
                  className={`px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-all flex items-center space-x-2 ${
                    isFlagging || !flagNotes.trim() ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isFlagging ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Flagging...</span>
                    </>
                  ) : (
                    <>
                      <Ban className="w-4 h-4" />
                      <span>Flag User</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {isDeleteModalOpen && selectedUserForDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Confirm User Deletion</h2>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedUserForDelete(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-start space-x-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      Are you absolutely sure you want to delete <strong>{selectedUserForDelete.first_name} {selectedUserForDelete.last_name}</strong> ({selectedUserForDelete.email})?
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      This action is <strong className="text-red-600 dark:text-red-400">irreversible</strong> and will permanently remove:
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-2 ml-4">
                      <li>User account and profile</li>
                      <li>All bookings and tickets</li>
                      <li>All notifications</li>
                      <li>All associated data</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedUserForDelete(null);
                  }}
                  className="px-6 py-2.5 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:border-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={isDeleting}
                  className={`px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all flex items-center space-x-2 ${
                    isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isDeleting ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>Delete User</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
