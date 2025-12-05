import React from 'react';
import { Clock, CheckCircle, XCircle, Search, Users } from 'lucide-react';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import { toast } from 'react-toastify';
import { getToken } from '../../services/authService';

interface Partner {
  id: string;
  name: string;
  email: string;
  category: string;
  submittedDate?: string;
  suspendedDate?: string;
  status: string;
  totalEvents?: number;
  totalRevenue?: string;
  rating?: number;
}

interface PartnersProps {}

interface PartnerNote {
  text: string;
  type: 'note' | 'flag' | 'suspend' | 'delete';
  date: string;
  author?: string;
}

interface PartnerStats {
  total_partners: number;
  pending_partners: number;
  suspended_partners: number;
  active_partners: number;
}

export default function PartnersSection({}: PartnersProps) {
  const [allPartners, setAllPartners] = React.useState<Partner[]>([]);
  const [partnerStats, setPartnerStats] = React.useState<PartnerStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'all' | 'pending' | 'approved' | 'suspended'>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('All');
  const [selectedPartner, setSelectedPartner] = React.useState<Partner | null>(null);
  const [partnerDetails, setPartnerDetails] = React.useState<any>(null);
  const [loadingPartnerDetails, setLoadingPartnerDetails] = React.useState(false);
  const [confirmAction, setConfirmAction] = React.useState<{
    type: 'flag' | 'delete' | 'suspend';
    partner: Partner | null;
  } | null>(null);
  const [confirmNoteText, setConfirmNoteText] = React.useState('');
  const [partnerNotes, setPartnerNotes] = React.useState<Record<string, PartnerNote[]>>({});
  const [detailsNoteText, setDetailsNoteText] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  // Categories
  const landingCategories = [
    'All',
    'Explore-Kenya',
    'Hiking',
    'Sports & Fitness',
    'Social Activities',
    'Hobbies & Interests',
    'Religious',
    'Autofest',
    'Health & Wellbeing',
    'Music & Dance',
    'Culture',
    'Pets & Animals',
    'Coaching & Support',
    'Business & Networking',
    'Technology',
    'Live Plays',
    'Art & Photography',
    'Shopping',
    'Gaming'
  ];

  // Fetch partners and stats
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stats
        const statsResponse = await fetch(API_ENDPOINTS.admin.partnerStats, {
          headers: {
            'Content-Type': 'application/json',
            ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
          },
        });
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setPartnerStats(statsData);
        }

        // Fetch all partners
        const allResponse = await fetch(API_ENDPOINTS.admin.partners, {
          headers: {
            'Content-Type': 'application/json',
            ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
          },
        });
        if (allResponse.ok) {
          const allData = await allResponse.json();
          const partners = (allData.partners || []).map((p: any) => ({
            id: String(p.id),
            name: p.business_name || p.name,
            email: p.email,
            category: p.category?.name || 'N/A',
            submittedDate: p.created_at ? new Date(p.created_at).toLocaleDateString() : '',
            suspendedDate: p.updated_at && p.status === 'suspended' ? new Date(p.updated_at).toLocaleDateString() : undefined,
            status: p.status,
            totalEvents: p.total_events || 0,
            totalRevenue: p.total_revenue ? `KES ${parseFloat(p.total_revenue).toLocaleString()}` : undefined,
            rating: p.rating || 0,
          }));
          setAllPartners(partners);
        }
      } catch (error) {
        console.error('Failed to fetch partners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter partners based on active tab, search, and category
  const filteredPartners = React.useMemo(() => {
    let filtered = allPartners;

    // Filter by status tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(p => p.status === activeTab);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (categoryFilter !== 'All') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    return filtered;
  }, [allPartners, activeTab, searchQuery, categoryFilter]);

  // Load/save notes
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('partnerNotes');
      if (raw) setPartnerNotes(JSON.parse(raw));
    } catch (err) {
      console.warn('Failed to load partner notes', err);
    }
  }, []);

  const saveNotes = (notes: Record<string, PartnerNote[]>) => {
    setPartnerNotes(notes);
    try { 
      localStorage.setItem('partnerNotes', JSON.stringify(notes)); 
    } catch (err) { 
      console.warn('Failed to save partner notes', err); 
    }
  };

  const addNoteForPartner = (partnerId: string, note: PartnerNote) => {
    const next = { ...partnerNotes };
    next[partnerId] = next[partnerId] ? [note, ...next[partnerId]] : [note];
    saveNotes(next);
  };

  // Handle approve partner
  const handleApprovePartner = async (partnerId: string) => {
    setActionLoading(partnerId);
    try {
      const response = await fetch(API_ENDPOINTS.admin.approvePartner(Number(partnerId)), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
        },
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Partner approved successfully! Email sent to partner.');
        // Refresh data
        window.location.reload();
      } else {
        toast.error(data.error || 'Failed to approve partner');
      }
    } catch (error) {
      console.error('Error approving partner:', error);
      toast.error('Error approving partner');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle reject partner
  const handleRejectPartner = async (partnerId: string) => {
    const reason = prompt('Enter rejection reason (optional):') || 'Application does not meet requirements';
    setActionLoading(partnerId);
    try {
      const response = await fetch(API_ENDPOINTS.admin.rejectPartner(Number(partnerId)), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
        },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Partner rejected. Email sent to partner.');
        window.location.reload();
      } else {
        toast.error(data.error || 'Failed to reject partner');
      }
    } catch (error) {
      console.error('Error rejecting partner:', error);
      toast.error('Error rejecting partner');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle suspend partner
  const handleSuspendPartner = (partner: Partner) => {
    setConfirmNoteText('');
    setConfirmAction({ type: 'suspend', partner });
  };

  // Handle unsuspend partner
  const handleUnsuspendPartner = async (partnerId: string) => {
    setActionLoading(partnerId);
    try {
      const response = await fetch(API_ENDPOINTS.admin.activatePartner(Number(partnerId)), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
        },
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Partner unsuspended successfully! Account is now active.');
        window.location.reload();
      } else {
        toast.error(data.error || 'Failed to unsuspend partner');
      }
    } catch (error) {
      console.error('Error unsuspending partner:', error);
      toast.error('Error unsuspending partner');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle flag partner
  const handleFlagPartner = (partner: Partner) => {
    setConfirmNoteText('');
    setConfirmAction({ type: 'flag', partner });
  };

  // Handle confirm action
  const handleConfirmAction = async () => {
    if (!confirmAction || !confirmAction.partner) return;
    
    const partnerId = confirmAction.partner.id;
    setActionLoading(partnerId);
    
    try {
      if (confirmAction.type === 'suspend') {
        const response = await fetch(API_ENDPOINTS.admin.suspendPartner(Number(partnerId)), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
          },
          body: JSON.stringify({ reason: confirmNoteText.trim() || 'Suspended by admin' }),
        });

        const data = await response.json();
        if (response.ok) {
          toast.error(`Partner suspended: ${confirmAction.partner.name}`);
          window.location.reload();
        } else {
          toast.error(data.error || 'Failed to suspend partner');
        }
      } else if (confirmAction.type === 'flag') {
        if (partnerId && confirmNoteText.trim()) {
          addNoteForPartner(partnerId, {
            text: confirmNoteText.trim(),
            type: confirmAction.type,
            date: new Date().toISOString(),
          });
          toast.warning(`Partner flagged: ${confirmAction.partner.name}`);
        }
      }
    } catch (error) {
      console.error('Error performing action:', error);
      toast.error('Error performing action');
    } finally {
      setConfirmAction(null);
      setConfirmNoteText('');
      setActionLoading(null);
    }
  };

  // Fetch partner details when modal opens
  React.useEffect(() => {
    const fetchPartnerDetails = async () => {
      if (!selectedPartner) {
        setPartnerDetails(null);
        return;
      }

      setLoadingPartnerDetails(true);
      try {
        const { getPartner } = await import('../../services/adminService');
        const details = await getPartner(Number(selectedPartner.id));
        setPartnerDetails(details);
      } catch (error) {
        console.error('Error fetching partner details:', error);
        setPartnerDetails(null);
      } finally {
        setLoadingPartnerDetails(false);
      }
    };

    fetchPartnerDetails();
  }, [selectedPartner]);

  return (
    <div>
      {/* Partner Statistics Cards */}
      {activeTab === 'all' && partnerStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Total Partners</p>
                <p className="text-3xl font-bold">{partnerStats.total_partners || 0}</p>
              </div>
              <div className="bg-white/20 rounded-xl p-3">
                <Users className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium mb-1">Pending</p>
                <p className="text-3xl font-bold">{partnerStats.pending_partners || 0}</p>
              </div>
              <div className="bg-white/20 rounded-xl p-3">
                <Clock className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium mb-1">Suspended</p>
                <p className="text-3xl font-bold">{partnerStats.suspended_partners || 0}</p>
              </div>
              <div className="bg-white/20 rounded-xl p-3">
                <XCircle className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">Active</p>
                <p className="text-3xl font-bold">{partnerStats.active_partners || 0}</p>
              </div>
              <div className="bg-white/20 rounded-xl p-3">
                <CheckCircle className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Partner Management</h2>
          <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold border border-blue-300 dark:border-blue-700">
            {filteredPartners.length}
          </span>
        </div>
        
        <div className="w-full sm:w-96">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search partners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#27aae2] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 font-semibold transition-colors border-b-2 ${
              activeTab === 'all'
                ? 'border-[#27aae2] text-[#27aae2]'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            All Partners
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 font-semibold transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'border-[#27aae2] text-[#27aae2]'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            Pending
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-2 font-semibold transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'approved'
                ? 'border-[#27aae2] text-[#27aae2]'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Active
          </button>
          <button
            onClick={() => setActiveTab('suspended')}
            className={`px-4 py-2 font-semibold transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'suspended'
                ? 'border-[#27aae2] text-[#27aae2]'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <XCircle className="w-4 h-4" />
            Suspended
          </button>
        </div>
      </div>

      {/* Status and Category Filter */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="category-filter" className="font-semibold text-gray-700 dark:text-gray-300">Category:</label>
          <select
            id="category-filter"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {landingCategories.map(cat => (
              <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Partners Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27aae2] mx-auto mb-4"></div>
          <p className="text-gray-500">Loading partners...</p>
        </div>
      ) : filteredPartners.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No partners found</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.map((partner) => (
            <div
              key={partner.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all p-6 border border-gray-100 dark:border-gray-700 cursor-pointer"
              onClick={(e) => {
                if ((e.target as HTMLElement).tagName !== 'BUTTON' && (e.target as HTMLElement).tagName !== 'SPAN') {
                  setSelectedPartner(partner);
                }
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{partner.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{partner.email}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      partner.status === 'pending' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' :
                      partner.status === 'suspended' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                      'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    }`}>
                      {partner.status.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full text-xs font-semibold">
                      {partner.category}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    {partner.totalEvents !== undefined && <span>{partner.totalEvents} events</span>}
                    {partner.totalRevenue && <span>{partner.totalRevenue}</span>}
                    {partner.rating !== undefined && <span>Rating: {partner.rating}/5.0</span>}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {partner.status === 'pending' && (
                  <>
                    <button
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                      onClick={async (e) => {
                        e.stopPropagation();
                        await handleApprovePartner(partner.id);
                      }}
                      disabled={actionLoading === partner.id}
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{actionLoading === partner.id ? 'Processing...' : 'Approve'}</span>
                    </button>
                    <button
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                      onClick={async (e) => {
                        e.stopPropagation();
                        await handleRejectPartner(partner.id);
                      }}
                      disabled={actionLoading === partner.id}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </>
                )}
                {partner.status === 'suspended' && (
                  <button
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                    onClick={async (e) => {
                      e.stopPropagation();
                      await handleUnsuspendPartner(partner.id);
                    }}
                    disabled={actionLoading === partner.id}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{actionLoading === partner.id ? 'Processing...' : 'Unsuspend'}</span>
                  </button>
                )}
                {partner.status === 'approved' && (
                  <>
                    <button
                      className="px-4 py-2 border-2 border-red-200 dark:border-red-700 text-red-600 rounded-lg font-semibold hover:border-red-500 transition-all flex items-center space-x-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSuspendPartner(partner);
                      }}
                    >
                      <span>Suspend</span>
                    </button>
                    <button
                      className="px-4 py-2 border-2 border-yellow-200 dark:border-yellow-700 text-yellow-600 rounded-lg font-semibold hover:border-yellow-500 transition-all flex items-center space-x-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFlagPartner(partner);
                      }}
                    >
                      <span role="img" aria-label="flag">🚩</span>
                      <span>Flag</span>
                    </button>
                  </>
                )}
                <button
                  className="px-4 py-2 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:border-[#27aae2] hover:text-[#27aae2] transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPartner(partner);
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Partner Details Modal - Keep existing modal code */}
      {selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
          <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            <div className="sticky top-0 z-10 bg-gradient-to-r from-[#27aae2] to-[#1e8bb8] px-6 py-4 rounded-t-2xl">
              <button
                className="absolute top-4 right-4 text-white hover:text-gray-200 text-3xl font-bold transition-colors w-10 h-10 flex items-center justify-center"
                onClick={() => {
                  setSelectedPartner(null);
                  setPartnerDetails(null);
                }}
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold text-white">Partner Details</h2>
            </div>

            <div className="p-6">
              {loadingPartnerDetails ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27aae2] mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading partner details...</p>
                </div>
              ) : partnerDetails ? (
                <div className="space-y-6">
                  {/* Logo and Basic Info Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-blue-100 dark:border-gray-600">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                      {partnerDetails.partner?.logo ? (
                        <img 
                          src={partnerDetails.partner.logo.startsWith('http') ? partnerDetails.partner.logo : `${API_BASE_URL}${partnerDetails.partner.logo}`}
                          alt={partnerDetails.partner.business_name}
                          className="w-20 h-20 rounded-xl object-cover border-2 border-white dark:border-gray-600 shadow-lg"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#27aae2] to-[#1e8bb8] flex items-center justify-center shadow-lg">
                          <span className="text-white text-3xl font-bold">
                            {partnerDetails.partner?.business_name?.charAt(0) || selectedPartner.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="font-bold text-2xl text-gray-900 dark:text-white mb-2">
                          {partnerDetails.partner?.business_name || selectedPartner.name}
                        </h3>
                        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            partnerDetails.partner?.status === 'pending' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' :
                            partnerDetails.partner?.status === 'suspended' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                            'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          }`}>
                            {partnerDetails.partner?.status?.toUpperCase() || selectedPartner.status?.toUpperCase() || 'ACTIVE'}
                          </span>
                          {partnerDetails.partner?.category && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full text-xs font-semibold">
                              {partnerDetails.partner.category.name || partnerDetails.partner.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#27aae2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Contact Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Email</p>
                        <p className="text-sm text-gray-900 dark:text-white break-all">
                          {partnerDetails.partner?.email || selectedPartner.email}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Phone Number</p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {partnerDetails.partner?.phone_number || 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* About Section */}
                  {partnerDetails.partner?.description && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#27aae2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        About
                      </h4>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                          {partnerDetails.partner.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Business Metrics Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#27aae2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Business Metrics
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 text-center border border-blue-200 dark:border-blue-800">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {partnerDetails.events?.length || 0}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total Events</p>
                      </div>
                      {partnerDetails.partner?.total_earnings !== undefined && (
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 text-center border border-purple-200 dark:border-purple-800">
                          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            KES {parseFloat(partnerDetails.partner.total_earnings || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total Earnings</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500">Failed to load partner details</p>
                </div>
              )}

              {/* Partner notes */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm mt-6">
                <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#27aae2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Admin Notes
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                  {(selectedPartner && partnerNotes[selectedPartner.id]) ? (
                    partnerNotes[selectedPartner.id].map((n, i) => (
                      <div key={i} className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            n.type === 'flag' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                            n.type === 'suspend' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                          }`}>
                            {n.type.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(n.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {new Date(n.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-200">{n.text}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-400 dark:text-gray-500">
                      <p className="text-sm">No notes yet</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={detailsNoteText}
                    onChange={e => setDetailsNoteText(e.target.value)}
                    placeholder="Add a note about this partner..."
                    className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2] focus:border-transparent transition-all"
                  />
                  <button
                    className="px-5 py-2.5 bg-gradient-to-r from-[#27aae2] to-[#1e8bb8] text-white rounded-lg font-medium hover:from-[#1e8bb8] hover:to-[#27aae2] transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => {
                      if (!selectedPartner) return;
                      if (!detailsNoteText.trim()) return;
                      addNoteForPartner(selectedPartner.id, { text: detailsNoteText.trim(), type: 'note', date: new Date().toISOString() });
                      setDetailsNoteText('');
                    }}
                    disabled={!detailsNoteText.trim()}
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 max-w-sm w-full text-center relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-2xl font-bold"
              onClick={() => setConfirmAction(null)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Confirm Action</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              {confirmAction.type === 'flag' && 'Do you want to flag this partner?'}
              {confirmAction.type === 'suspend' && 'Do you want to suspend this partner?'}
            </p>
            <div className="mb-4">
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Add a note (optional)</label>
              <textarea
                value={confirmNoteText}
                onChange={e => setConfirmNoteText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                placeholder="Explain why you're flagging / suspending this partner..."
                rows={3}
              />
            </div>
            <div className="flex justify-center gap-4">
              <button
                className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setConfirmAction(null)}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2.5 bg-[#27aae2] text-white rounded-lg font-semibold hover:bg-[#1a8ec4] transition-colors"
                onClick={handleConfirmAction}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
