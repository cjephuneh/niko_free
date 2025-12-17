import React from 'react';
import { Clock, CheckCircle, XCircle, Search, Users, AlertTriangle } from 'lucide-react';
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
  rejected_partners: number;
  active_partners: number;
}

export default function PartnersSection({}: PartnersProps) {
  const [allPartners, setAllPartners] = React.useState<Partner[]>([]);
  const [partnerStats, setPartnerStats] = React.useState<PartnerStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'all' | 'pending' | 'approved' | 'suspended' | 'rejected'>('all');
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
  const [rejectModalOpen, setRejectModalOpen] = React.useState(false);
  const [partnerToReject, setPartnerToReject] = React.useState<Partner | null>(null);
  const [selectedRejectionReason, setSelectedRejectionReason] = React.useState('');
  const [internalRejectionNote, setInternalRejectionNote] = React.useState('');
  const [showRejectionConfirm, setShowRejectionConfirm] = React.useState(false);

  // Rejection reasons - fetched from API
  const [rejectionReasons, setRejectionReasons] = React.useState<Array<{
    id: number;
    title: string;
    description: string;
  }>>([]);

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
          
          // Debug: Log suspended partners
          const suspendedPartners = partners.filter(p => p.status === 'suspended');
          console.log('Total partners fetched:', partners.length);
          console.log('Suspended partners found:', suspendedPartners.length);
          if (suspendedPartners.length > 0) {
            console.log('Suspended partner names:', suspendedPartners.map(p => p.name));
          }
          
          setAllPartners(partners);
        }
      } catch (error) {
        console.error('Failed to fetch partners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Fetch rejection reasons
    const fetchRejectionReasons = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.admin.rejectionReasons, {
          headers: {
            'Content-Type': 'application/json',
            ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
          },
        });
        if (response.ok) {
          const data = await response.json();
          setRejectionReasons(data.reasons || []);
        }
      } catch (error) {
        console.error('Failed to fetch rejection reasons:', error);
      }
    };
    
    fetchRejectionReasons();
  }, []);

  // Filter partners based on active tab, search, and category
  const filteredPartners = React.useMemo(() => {
    let filtered = allPartners;

    // Filter by status tab
    if (activeTab !== 'all') {
      if (activeTab === 'suspended') {
        filtered = filtered.filter(p => {
          const isSuspended = p.status === 'suspended';
          if (isSuspended) {
            console.log('Found suspended partner:', p.name, p.status);
          }
          return isSuspended;
        });
        console.log('Suspended tab - Total partners:', allPartners.length);
        console.log('Suspended tab - Suspended partners:', filtered.length);
        console.log('All partner statuses:', allPartners.map(p => ({ name: p.name, status: p.status })));
      } else if (activeTab === 'rejected') {
        filtered = filtered.filter(p => p.status === 'rejected');
        console.log('Rejected tab - Total partners:', allPartners.length);
        console.log('Rejected tab - Rejected partners:', filtered.length);
      } else if (activeTab === 'approved') {
        filtered = filtered.filter(p => p.status === 'approved');
      } else if (activeTab === 'pending') {
        filtered = filtered.filter(p => p.status === 'pending');
      }
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
        // Update local state instead of reloading
        setAllPartners(prevPartners => 
          prevPartners.map(p => 
            p.id === partnerId ? { ...p, status: 'approved' } : p
          )
        );
        // Refresh stats
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

  // Handle reject partner - open modal
  const handleRejectPartner = (partner: Partner) => {
    setPartnerToReject(partner);
    setSelectedRejectionReason('');
    setInternalRejectionNote('');
    setRejectModalOpen(true);
  };

  // Confirm reject partner
  const confirmRejectPartner = async () => {
    if (!partnerToReject || !selectedRejectionReason) return;
    
    // Find the reason object by ID
    const reasonObj = rejectionReasons.find(r => r.id === Number(selectedRejectionReason));
    if (!reasonObj) return;
    
    setActionLoading(partnerToReject.id);
    
    try {
      const response = await fetch(API_ENDPOINTS.admin.rejectPartner(Number(partnerToReject.id)), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
        },
        body: JSON.stringify({ 
          rejection_reason_id: reasonObj.id,
          internal_note: internalRejectionNote.trim() || undefined // Optional admin note
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Partner rejected. Email sent to partner.');
        // Update local state instead of reloading
        setAllPartners(prevPartners => 
          prevPartners.map(p => 
            p.id === partnerToReject.id ? { ...p, status: 'rejected' } : p
          )
        );
        // Refresh stats
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
        toast.error('❌ Partner rejected. Email sent to partner.', {
          position: 'top-right',
          autoClose: 4000,
        });
        
        // Add note to partner notes with both reason and internal note
        const noteText = internalRejectionNote.trim() 
          ? `Rejected: ${reasonObj.title}\nInternal Note: ${internalRejectionNote.trim()}`
          : `Rejected: ${reasonObj.title}`;
        
        addNoteForPartner(partnerToReject.id, {
          text: noteText,
          type: 'delete',
          date: new Date().toISOString(),
          author: 'Admin',
        });
        
        // Update local state
        setAllPartners(prev => prev.filter(p => p.id !== partnerToReject.id));
        
        // Update stats
        if (partnerStats) {
          setPartnerStats({
            ...partnerStats,
            pending_partners: partnerStats.pending_partners - 1,
            total_partners: partnerStats.total_partners - 1,
          });
        }
        
        // Close modal and reset state
        setRejectModalOpen(false);
        setPartnerToReject(null);
        setSelectedRejectionReason('');
        setInternalRejectionNote('');
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

  // Show rejection confirmation step
  const handleShowRejectionConfirm = () => {
    if (!selectedRejectionReason || !internalRejectionNote.trim()) return;
    setShowRejectionConfirm(true);
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
        // Refresh partners list from API
        const refreshResponse = await fetch(API_ENDPOINTS.admin.partners, {
          headers: {
            'Content-Type': 'application/json',
            ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
          },
        });
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          const refreshedPartners = (refreshData.partners || []).map((p: any) => ({
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
          setAllPartners(refreshedPartners);
        }
        // Refresh stats
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

  // Handle unreject partner
  const [unrejectModalOpen, setUnrejectModalOpen] = React.useState(false);
  const [partnerToUnreject, setPartnerToUnreject] = React.useState<Partner | null>(null);
  const [unrejectReason, setUnrejectReason] = React.useState('');

  const handleUnrejectPartner = (partner: Partner) => {
    setPartnerToUnreject(partner);
    setUnrejectReason('');
    setUnrejectModalOpen(true);
  };

  const confirmUnrejectPartner = async () => {
    if (!partnerToUnreject || !unrejectReason.trim()) {
      toast.error('Please provide a reason for unrejecting the partner');
      return;
    }

    setActionLoading(partnerToUnreject.id);
    try {
      const response = await fetch(API_ENDPOINTS.admin.unrejectPartner(Number(partnerToUnreject.id)), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
        },
        body: JSON.stringify({ reason: unrejectReason.trim() }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Partner record deleted. Email is now available for fresh registration.');
        
        // Remove partner from local list (since it's been deleted)
        setAllPartners(prev => prev.filter(p => p.id !== partnerToUnreject.id));
        
        // Refresh stats
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
        
        setUnrejectModalOpen(false);
        setPartnerToUnreject(null);
        setUnrejectReason('');
      } else {
        toast.error(data.error || 'Failed to unreject partner');
      }
    } catch (error) {
      console.error('Error unrejecting partner:', error);
      toast.error('Error unrejecting partner');
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
        const reason = confirmNoteText.trim() || 'Suspended by admin';
        const response = await fetch(API_ENDPOINTS.admin.suspendPartner(Number(partnerId)), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
          },
          body: JSON.stringify({ reason }),
        });

        const data = await response.json();
        if (response.ok) {
          toast.warning(`⚠️ Partner suspended: ${confirmAction.partner.name}`, {
            position: 'top-right',
            autoClose: 4000,
          });
          
          // Add note to partner
          addNoteForPartner(partnerId, {
            text: `Suspended: ${reason}`,
            type: 'suspend',
            date: new Date().toISOString(),
            author: 'Admin',
          });
          
          // Refresh partners list from API to get accurate data
          const refreshResponse = await fetch(API_ENDPOINTS.admin.partners, {
            headers: {
              'Content-Type': 'application/json',
              ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
            },
          });
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            const refreshedPartners = (refreshData.partners || []).map((p: any) => ({
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
            setAllPartners(refreshedPartners);
            console.log('Partners refreshed after suspend. Suspended count:', refreshedPartners.filter(p => p.status === 'suspended').length);
          } else {
            // Fallback to local update
            setAllPartners(prev => prev.map(p => 
              p.id === partnerId ? { ...p, status: 'suspended', suspendedDate: new Date().toLocaleDateString() } : p
            ));
          }
          
          // Refresh stats
          const statsResponse = await fetch(API_ENDPOINTS.admin.partnerStats, {
            headers: {
              'Content-Type': 'application/json',
              ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
            },
          });
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            setPartnerStats(statsData);
          } else if (partnerStats) {
            // Fallback to local update if stats fetch fails
            setPartnerStats({
              ...partnerStats,
              suspended_partners: partnerStats.suspended_partners + 1,
              active_partners: partnerStats.active_partners - 1,
            });
          }
        } else {
          toast.error(data.error || 'Failed to suspend partner');
        }
      } else if (confirmAction.type === 'flag') {
        if (partnerId && confirmNoteText.trim()) {
          addNoteForPartner(partnerId, {
            text: confirmNoteText.trim(),
            type: confirmAction.type,
            date: new Date().toISOString(),
            author: 'Admin',
          });
          toast.warning(`🚩 Partner flagged: ${confirmAction.partner.name}`, {
            position: 'top-right',
            autoClose: 4000,
          });
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
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

          <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-100 text-sm font-medium mb-1">Rejected</p>
                <p className="text-3xl font-bold">{partnerStats.rejected_partners || 0}</p>
              </div>
              <div className="bg-white/20 rounded-xl p-3">
                <XCircle className="w-8 h-8" />
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
          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-4 py-2 font-semibold transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'rejected'
                ? 'border-[#27aae2] text-[#27aae2]'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <XCircle className="w-4 h-4" />
            Rejected
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
          <p className="text-gray-500 text-lg">
            {activeTab === 'suspended' 
              ? 'No suspended partners found' 
              : activeTab === 'rejected'
              ? 'No rejected partners found'
              : 'No partners found'}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            {activeTab === 'suspended' 
              ? 'There are currently no suspended partners. Suspend a partner from the Active tab to see them here.' 
              : activeTab === 'rejected'
              ? 'There are currently no rejected partners. Reject a partner from the Pending tab to see them here.'
              : 'Try adjusting your filters'}
          </p>
          {activeTab === 'suspended' && (
            <button
              onClick={() => setActiveTab('approved')}
              className="mt-4 px-4 py-2 bg-[#27aae2] text-white rounded-lg font-semibold hover:bg-[#1e8bb8] transition-colors"
            >
              Go to Active Partners
            </button>
          )}
          {activeTab === 'rejected' && (
            <button
              onClick={() => setActiveTab('pending')}
              className="mt-4 px-4 py-2 bg-[#27aae2] text-white rounded-lg font-semibold hover:bg-[#1e8bb8] transition-colors"
            >
              Go to Pending Partners
            </button>
          )}
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
                      partner.status === 'rejected' ? 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300' :
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRejectPartner(partner);
                      }}
                      disabled={actionLoading === partner.id}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </>
                )}
                {partner.status === 'suspended' && (
                  <>
                    <button
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 shadow-lg"
                      onClick={async (e) => {
                        e.stopPropagation();
                        await handleUnsuspendPartner(partner.id);
                      }}
                      disabled={actionLoading === partner.id}
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{actionLoading === partner.id ? 'Processing...' : 'Unsuspend'}</span>
                    </button>
                    <button
                      className="px-4 py-2 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:border-[#27aae2] hover:text-[#27aae2] transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPartner(partner);
                      }}
                    >
                      View Details
                    </button>
                  </>
                )}
                {partner.status === 'rejected' && (
                  <>
                    <button
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnrejectPartner(partner);
                      }}
                      disabled={actionLoading === partner.id}
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{actionLoading === partner.id ? 'Processing...' : 'Unreject'}</span>
                    </button>
                    <button
                      className="px-4 py-2 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:border-[#27aae2] hover:text-[#27aae2] transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPartner(partner);
                      }}
                    >
                      View Details
                    </button>
                  </>
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
                {partner.status !== 'suspended' && partner.status !== 'rejected' && (
                  <button
                    className="px-4 py-2 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:border-[#27aae2] hover:text-[#27aae2] transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPartner(partner);
                    }}
                  >
                    View Details
                  </button>
                )}
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
                          loading="lazy"
                          decoding="async"
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

                  {/* Rejection Reason Section - Only show if partner is rejected */}
                  {partnerDetails.partner?.status === 'rejected' && partnerDetails.partner?.rejection_reason && (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border-2 border-red-200 dark:border-red-800 shadow-sm">
                      <h4 className="font-bold text-lg text-red-900 dark:text-red-200 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        Rejection Reason
                      </h4>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-red-200 dark:border-red-700">
                        <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">
                          {partnerDetails.partner.rejection_reason}
                        </p>
                        {partnerDetails.partner.rejection_reason_id && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Reason ID: {partnerDetails.partner.rejection_reason_id}
                          </p>
                        )}
                      </div>
                      {partnerDetails.partner?.internal_rejection_note && (
                        <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700">
                          <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                            Internal Note (Admin Only):
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {partnerDetails.partner.internal_rejection_note}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Additional Interests Section */}
                  {partnerDetails.partner?.interests && Array.isArray(partnerDetails.partner.interests) && partnerDetails.partner.interests.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#27aae2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Additional Interests
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {partnerDetails.partner.interests.map((interest: string, index: number) => (
                          <span
                            key={index}
                            className="px-4 py-2 bg-gradient-to-r from-[#27aae2] to-[#1e8bb8] text-white rounded-full text-sm font-medium shadow-sm"
                          >
                            {interest}
                          </span>
                        ))}
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

      {/* Rejection Modal */}
      {rejectModalOpen && partnerToReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full relative animate-fadeIn max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 rounded-t-2xl z-10">
              <button
                className="absolute top-4 right-4 text-white hover:text-gray-200 text-2xl font-bold transition-colors w-8 h-8 flex items-center justify-center"
                onClick={() => {
                  setRejectModalOpen(false);
                  setPartnerToReject(null);
                  setSelectedRejectionReason('');
                  setInternalRejectionNote('');
                  setShowRejectionConfirm(false);
                }}
              >
                &times;
              </button>
              <div className="flex items-center gap-3">
                <XCircle className="w-8 h-8 text-white" />
                <h2 className="text-2xl font-bold text-white">Reject Partner Application</h2>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {!showRejectionConfirm ? (
                <>
                  {/* Partner Info */}
                  <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                        <span className="text-white text-xl font-bold">
                          {partnerToReject.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{partnerToReject.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{partnerToReject.email}</p>
                      </div>
                    </div>
                    <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                      ⚠️ Select a rejection reason and add an internal note before confirming.
                    </p>
                  </div>

                  {/* Rejection Reason Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Rejection Reason <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                      This reason will be sent to the partner via email.
                    </p>
                    <div className="space-y-2">
                      {rejectionReasons.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Loading rejection reasons...</p>
                      ) : (
                        rejectionReasons.map((reason) => (
                          <label
                            key={reason.id}
                            className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              selectedRejectionReason === String(reason.id)
                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 bg-white dark:bg-gray-800'
                            }`}
                          >
                            <input
                              type="radio"
                              name="rejectionReason"
                              value={reason.id}
                              checked={selectedRejectionReason === String(reason.id)}
                              onChange={(e) => setSelectedRejectionReason(e.target.value)}
                              className="mt-1 w-4 h-4 text-red-600 focus:ring-red-500"
                            />
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900 dark:text-white block mb-1">
                                {reason.title}
                              </span>
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {reason.description}
                              </span>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Internal Note */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Internal Note <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                      This note is for admin records only and will NOT be sent to the partner.
                    </p>
                    <textarea
                      value={internalRejectionNote}
                      onChange={(e) => setInternalRejectionNote(e.target.value)}
                      placeholder="Add internal details about why this partner is being rejected (e.g., specific issues found, red flags, etc.)"
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {internalRejectionNote.length}/500 characters
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                      onClick={() => {
                        setRejectModalOpen(false);
                        setPartnerToReject(null);
                        setSelectedRejectionReason('');
                        setInternalRejectionNote('');
                        setShowRejectionConfirm(false);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      onClick={handleShowRejectionConfirm}
                      disabled={!selectedRejectionReason || !internalRejectionNote.trim()}
                    >
                      <span>Continue to Confirmation</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Confirmation Step */}
                  <div className="mb-6">
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-300 dark:border-red-700 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                          <AlertTriangle className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Confirm Rejection</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Please review the details before proceeding
                          </p>
                        </div>
                      </div>

                      {/* Partner Details */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Partner</p>
                        <p className="font-bold text-gray-900 dark:text-white">{partnerToReject.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{partnerToReject.email}</p>
                      </div>

                      {/* Selected Reason */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                          Rejection Reason (will be sent in email)
                        </p>
                        {(() => {
                          const reason = rejectionReasons.find(r => r.id === Number(selectedRejectionReason));
                          return reason ? (
                            <div>
                              <p className="font-semibold text-red-600 dark:text-red-400 mb-2">
                                {reason.title}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {reason.description}
                              </p>
                            </div>
                          ) : (
                            <p className="font-semibold text-red-600 dark:text-red-400">
                              {selectedRejectionReason}
                            </p>
                          );
                        })()}
                      </div>

                      {/* Internal Note */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                          Internal Note (admin only)
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {internalRejectionNote}
                        </p>
                      </div>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-800 dark:text-yellow-200">
                        <p className="font-semibold mb-1">Important:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>This action cannot be undone</li>
                          <li>An automatic rejection email will be sent to the partner</li>
                          <li>The partner will be removed from the pending list</li>
                          <li>Internal notes will be saved in admin records</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Confirmation Actions */}
                  <div className="flex gap-3">
                    <button
                      className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2"
                      onClick={() => setShowRejectionConfirm(false)}
                      disabled={actionLoading === partnerToReject.id}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      <span>Go Back</span>
                    </button>
                    <button
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      onClick={confirmRejectPartner}
                      disabled={actionLoading === partnerToReject.id}
                    >
                      {actionLoading === partnerToReject.id ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Rejecting...</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5" />
                          <span>Confirm Rejection</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
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

      {/* Unreject Partner Modal */}
      {unrejectModalOpen && partnerToUnreject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full relative animate-fadeIn max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 rounded-t-2xl z-10">
              <button
                className="absolute top-4 right-4 text-white hover:text-gray-200 text-2xl font-bold transition-colors w-8 h-8 flex items-center justify-center"
                onClick={() => {
                  setUnrejectModalOpen(false);
                  setPartnerToUnreject(null);
                  setUnrejectReason('');
                }}
              >
                &times;
              </button>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-white" />
                <h2 className="text-2xl font-bold text-white">Unreject Partner Application</h2>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Partner Info */}
              <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl font-bold">
                      {partnerToUnreject.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{partnerToUnreject.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{partnerToUnreject.email}</p>
                  </div>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                  ✅ This will reopen the partner's application for corrections. They will receive an email and SMS with the reason.
                </p>
              </div>

              {/* Reason Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Reason for Unrejecting <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  This reason will be sent to the partner via email and SMS to help them understand what corrections are needed.
                </p>
                <textarea
                  value={unrejectReason}
                  onChange={(e) => setUnrejectReason(e.target.value)}
                  placeholder="Explain why you're reopening this partner's application and what corrections they need to make..."
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                  rows={6}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {unrejectReason.length}/500 characters
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                  onClick={() => {
                    setUnrejectModalOpen(false);
                    setPartnerToUnreject(null);
                    setUnrejectReason('');
                  }}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  onClick={confirmUnrejectPartner}
                  disabled={actionLoading === partnerToUnreject.id || !unrejectReason.trim()}
                >
                  {actionLoading === partnerToUnreject.id ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Unrejecting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Confirm Unreject</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unreject Partner Modal */}
      {unrejectModalOpen && partnerToUnreject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full relative animate-fadeIn max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 rounded-t-2xl z-10">
              <button
                className="absolute top-4 right-4 text-white hover:text-gray-200 text-2xl font-bold transition-colors w-8 h-8 flex items-center justify-center"
                onClick={() => {
                  setUnrejectModalOpen(false);
                  setPartnerToUnreject(null);
                  setUnrejectReason('');
                }}
              >
                &times;
              </button>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-white" />
                <h2 className="text-2xl font-bold text-white">Unreject Partner Application</h2>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Partner Info */}
              <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl font-bold">
                      {partnerToUnreject.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{partnerToUnreject.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{partnerToUnreject.email}</p>
                  </div>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                  ✅ This will reopen the partner's application for corrections. They will receive an email and SMS with the reason.
                </p>
              </div>

              {/* Reason Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Reason for Unrejecting <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  This reason will be sent to the partner via email and SMS to help them understand what corrections are needed.
                </p>
                <textarea
                  value={unrejectReason}
                  onChange={(e) => setUnrejectReason(e.target.value)}
                  placeholder="Explain why you're reopening this partner's application and what corrections they need to make..."
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                  rows={6}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {unrejectReason.length}/500 characters
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                  onClick={() => {
                    setUnrejectModalOpen(false);
                    setPartnerToUnreject(null);
                    setUnrejectReason('');
                  }}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  onClick={confirmUnrejectPartner}
                  disabled={actionLoading === partnerToUnreject.id || !unrejectReason.trim()}
                >
                  {actionLoading === partnerToUnreject.id ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Unrejecting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Confirm Unreject</span>
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
