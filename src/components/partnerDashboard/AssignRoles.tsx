import { UserPlus, Users, Shield, Trash2, Mail, Phone, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getTeamMembers, addTeamMember, removeTeamMember } from '../../services/partnerService';

interface TeamUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  permissions: string[];
  added_at?: string;
}

export default function AssignRoles() {
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Invite modal state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteRole, setInviteRole] = useState<'Manager' | 'Staff'>('Manager');
  const [inviteSubmitting, setInviteSubmitting] = useState(false);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setIsLoading(true);
        setError('');
        const members = await getTeamMembers();
        setUsers(
          members.map((m: any) => ({
            id: m.id,
            name: m.name,
            email: m.email,
            phone: m.phone,
            role: m.role || 'Manager',
            permissions: m.permissions || [],
            added_at: m.added_at,
          }))
        );
      } catch (err: any) {
        console.error('Error fetching team members:', err);
        setError(err.message || 'Failed to load team members');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeam();
  }, []);

  const openInviteModal = () => {
    setInviteName('');
    setInviteEmail('');
    setInvitePhone('');
    setInviteRole('Manager');
    setIsInviteOpen(true);
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    try {
      setInviteSubmitting(true);
      const role = inviteRole;
      const defaultPermissions =
        role.toLowerCase() === 'manager'
          ? ['Edit Events', 'Manage Tickets', 'View Analytics']
          : ['View Events', 'Scan Tickets'];

      const created = await addTeamMember({
        name: inviteName.trim(),
        email: inviteEmail.trim(),
        phone: invitePhone.trim() || undefined,
        role,
        permissions: defaultPermissions,
      });

      setUsers(prev => [
        ...prev,
        {
          id: created.id,
          name: created.name,
          email: created.email,
          phone: created.phone,
          role: created.role || role,
          permissions: created.permissions || defaultPermissions,
          added_at: created.added_at,
        },
      ]);

      setIsInviteOpen(false);
    } catch (err: any) {
      console.error('Error adding team member:', err);
      alert(err.message || 'Failed to add team member');
    } finally {
      setInviteSubmitting(false);
    }
  };

  const handleRemoveUser = async (id: number) => {
    if (!window.confirm('Remove this team member?')) return;
    try {
      await removeTeamMember(id);
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (err: any) {
      console.error('Error removing team member:', err);
      alert(err.message || 'Failed to remove team member');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Assign Roles</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage team members and promotional agents
        </p>
      </div>

      {/* Team Members Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-[#27aae2]" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Team Members
            </h3>
          </div>
          <button
            onClick={openInviteModal}
            className="flex items-center space-x-2 bg-[#27aae2] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#1e8bc3] transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>

        <div className="space-y-4">
          {isLoading && (
            <div className="text-gray-500 dark:text-gray-400 text-sm">Loading team members...</div>
          )}
          {error && !isLoading && (
            <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
          )}
          {!isLoading && !error && users.length === 0 && (
            <div className="text-gray-500 dark:text-gray-400 text-sm">
              No team members yet. Use &quot;Add User&quot; to invite fellow managers.
            </div>
          )}
          {users.map((user) => (
            <div
              key={user.id}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {user.name}
                    </h4>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded">
                      {user.role}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>{user.phone}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {user.permissions.map((permission, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveUser(user.id)}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              About Roles & Permissions
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Team members can help manage your events with assigned permissions. 
              Promotional agents earn commission on ticket sales and can promote up to your events.
              You can have up to 3 promotional agents at a time.
            </p>
          </div>
        </div>
      </div>

      {/* Invite Team Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setIsInviteOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
              Invite Team Member
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Add a fellow manager or staff member to help manage your events.
            </p>
            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number (optional)
                </label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                  value={invitePhone}
                  onChange={e => setInvitePhone(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setInviteRole('Manager')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border ${
                      inviteRole === 'Manager'
                        ? 'bg-[#27aae2] text-white border-[#27aae2]'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700'
                    }`}
                  >
                    Manager
                  </button>
                  <button
                    type="button"
                    onClick={() => setInviteRole('Staff')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border ${
                      inviteRole === 'Staff'
                        ? 'bg-[#27aae2] text-white border-[#27aae2]'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700'
                    }`}
                  >
                    Staff
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Managers can edit events, manage tickets and view analytics. Staff can view events and scan tickets.
                </p>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteSubmitting}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#27aae2] text-white hover:bg-[#1e8bc3] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {inviteSubmitting ? 'Inviting...' : 'Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
