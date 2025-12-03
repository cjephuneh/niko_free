import React from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';
import { toast } from 'react-toastify';

interface PendingPartner {
  id: string;
  name: string;
  email: string;
  category: string;
  submittedDate: string;
  status: string;
}

interface ApprovedPartner {
  id: string;
  name: string;
  totalEvents: number;
  totalRevenue: string;
  rating: number;
  status: string;
  category?: string;
}

interface PartnersProps {}

interface PartnerNote {
  text: string;
  type: 'note' | 'flag' | 'suspend' | 'delete';
  date: string; // ISO
  author?: string;
}

interface SuspendedPartner {
  id: string;
  name: string;
  email: string;
  category: string;
  suspendedDate: string;
  status: string;
  totalEvents?: number;
  totalRevenue?: string;
}

export default function PartnersSection({}: PartnersProps) {
  const [pendingPartners, setPendingPartners] = React.useState<PendingPartner[]>([]);
  const [approvedPartners, setApprovedPartners] = React.useState<ApprovedPartner[]>([]);
  const [suspendedPartners, setSuspendedPartners] = React.useState<SuspendedPartner[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchPartners = async () => {
      try {
        const { getPendingPartners } = await import('../../services/adminService');
        const { API_ENDPOINTS } = await import('../../config/api');
        const { getToken } = await import('../../services/authService');

        // Fetch pending partners
        const pendingResponse = await fetch(`${API_ENDPOINTS.admin.partners}?status=pending`, {
          headers: {
            'Content-Type': 'application/json',
            ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
          },
        });
        const pendingData = await pendingResponse.json();
        if (pendingResponse.ok) {
          setPendingPartners((pendingData.partners || []).map((p: any) => ({
            id: String(p.id),
            name: p.business_name || p.name,
            email: p.email,
            category: p.category?.name || 'N/A',
            submittedDate: new Date(p.created_at).toLocaleDateString(),
            status: p.status,
          })));
        }

        // Fetch approved partners
        const approvedResponse = await fetch(`${API_ENDPOINTS.admin.partners}?status=approved`, {
          headers: {
            'Content-Type': 'application/json',
            ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
          },
        });
        const approvedData = await approvedResponse.json();
        if (approvedResponse.ok) {
          setApprovedPartners((approvedData.partners || []).map((p: any) => ({
            id: String(p.id),
            name: p.business_name || p.name,
            totalEvents: p.total_events || 0,
            totalRevenue: `KES ${(p.total_revenue || 0).toLocaleString()}`,
            rating: p.rating || 0,
            status: p.status,
            category: p.category?.name,
          })));
        }

        // Fetch suspended partners
        const suspendedResponse = await fetch(`${API_ENDPOINTS.admin.partners}?status=suspended`, {
          headers: {
            'Content-Type': 'application/json',
            ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
          },
        });
        const suspendedData = await suspendedResponse.json();
        if (suspendedResponse.ok) {
          setSuspendedPartners((suspendedData.partners || []).map((p: any) => ({
            id: String(p.id),
            name: p.business_name || p.name,
            email: p.email,
            category: p.category?.name || 'N/A',
            suspendedDate: p.updated_at ? new Date(p.updated_at).toLocaleDateString() : new Date(p.created_at).toLocaleDateString(),
            status: p.status,
            totalEvents: p.total_events || 0,
            totalRevenue: p.total_earnings ? `KES ${parseFloat(p.total_earnings).toLocaleString()}` : 'KES 0',
          })));
        }
      } catch (error) {
        console.error('Failed to fetch partners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);
  // Search and filter state for active partners
  const [searchTerm, setSearchTerm] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('All');

  // Categories synced from LandingPage
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

  // (categories not used right now)

  // Filtered and searched partners
  const filteredPartners = approvedPartners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || partner.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  const [selectedPartner, setSelectedPartner] = React.useState<PendingPartner | ApprovedPartner | null>(null);
  const [partnerDetails, setPartnerDetails] = React.useState<any>(null);
  const [loadingPartnerDetails, setLoadingPartnerDetails] = React.useState(false);
  const [confirmAction, setConfirmAction] = React.useState<{
    type: 'flag' | 'delete' | 'suspend';
    partner: PendingPartner | ApprovedPartner | null;
  } | null>(null);
  const [confirmNoteText, setConfirmNoteText] = React.useState('');
  const [partnerNotes, setPartnerNotes] = React.useState<Record<string, PartnerNote[]>>({});
  const [detailsNoteText, setDetailsNoteText] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  // Handle approve partner
  const handleApprovePartner = async (partnerId: string) => {
    setActionLoading(partnerId);
    try {
      const { API_ENDPOINTS } = await import('../../config/api');
      const { getToken } = await import('../../services/authService');

      const response = await fetch(API_ENDPOINTS.admin.approvePartner(Number(partnerId)), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
        },
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMessage('Partner approved successfully. Email sent to partner.');
        toast.success('Partner approved successfully! Email sent to partner.', {
          position: 'top-right',
          autoClose: 3000,
        });
        // Refresh partners list
        const fetchPartners = async () => {
          const pendingResponse = await fetch(`${API_ENDPOINTS.admin.partners}?status=pending`, {
            headers: {
              'Content-Type': 'application/json',
              ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
            },
          });
          const pendingData = await pendingResponse.json();
          if (pendingResponse.ok) {
            setPendingPartners((pendingData.partners || []).map((p: any) => ({
              id: String(p.id),
              name: p.business_name || p.name,
              email: p.email,
              category: p.category?.name || 'N/A',
              submittedDate: new Date(p.created_at).toLocaleDateString(),
              status: p.status,
            })));
          }
        };
        fetchPartners();
      } else {
        setSuccessMessage(data.error || 'Failed to approve partner');
      }
    } catch (error) {
      console.error('Error approving partner:', error);
      setSuccessMessage('Error approving partner');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle reject partner
  const handleRejectPartner = async (partnerId: string) => {
    const reason = prompt('Enter rejection reason (optional):') || 'Application does not meet requirements';
    setActionLoading(partnerId);
    try {
      const { API_ENDPOINTS } = await import('../../config/api');
      const { getToken } = await import('../../services/authService');

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
        setSuccessMessage('Partner rejected. Email sent to partner.');
        // Refresh partners list
        const fetchPartners = async () => {
          const pendingResponse = await fetch(`${API_ENDPOINTS.admin.partners}?status=pending`, {
            headers: {
              'Content-Type': 'application/json',
              ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
            },
          });
          const pendingData = await pendingResponse.json();
          if (pendingResponse.ok) {
            setPendingPartners((pendingData.partners || []).map((p: any) => ({
              id: String(p.id),
              name: p.business_name || p.name,
              email: p.email,
              category: p.category?.name || 'N/A',
              submittedDate: new Date(p.created_at).toLocaleDateString(),
              status: p.status,
            })));
          }
        };
        fetchPartners();
      } else {
        setSuccessMessage(data.error || 'Failed to reject partner');
      }
    } catch (error) {
      console.error('Error rejecting partner:', error);
      setSuccessMessage('Error rejecting partner');
    } finally {
      setActionLoading(null);
    }
  };

  // Handler for showing confirmation modal
  const handleFlagPartner = (partner: PendingPartner | ApprovedPartner) => {
    setConfirmNoteText('');
    setConfirmAction({ type: 'flag', partner });
  };
  // delete handler removed (not used currently)
  const handleSuspendPartner = (partner: ApprovedPartner | PendingPartner) => {
    setConfirmNoteText('');
    setConfirmAction({ type: 'suspend', partner });
  };

  // Load/save notes to localStorage so different admins see them on the same machine
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
    try { localStorage.setItem('partnerNotes', JSON.stringify(notes)); } catch (err) { console.warn('Failed to save partner notes', err); }
  };

  const addNoteForPartner = (partnerId: string, note: PartnerNote) => {
    const next = { ...partnerNotes };
    next[partnerId] = next[partnerId] ? [note, ...next[partnerId]] : [note];
    saveNotes(next);
  };

  // Handle unsuspend (activate) partner
  const handleUnsuspendPartner = async (partnerId: string) => {
    setActionLoading(partnerId);
    try {
      const { API_ENDPOINTS } = await import('../../config/api');
      const { getToken } = await import('../../services/authService');

      const response = await fetch(API_ENDPOINTS.admin.activatePartner(Number(partnerId)), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
        },
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMessage('Partner unsuspended successfully. Account is now active.');
        toast.success('Partner unsuspended successfully! Account is now active.', {
          position: 'top-right',
          autoClose: 3000,
        });
        // Refresh partners lists
        const fetchPartners = async () => {
          const { API_ENDPOINTS } = await import('../../config/api');
          const { getToken } = await import('../../services/authService');

          // Refresh suspended partners
          const suspendedResponse = await fetch(`${API_ENDPOINTS.admin.partners}?status=suspended`, {
            headers: {
              'Content-Type': 'application/json',
              ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
            },
          });
          const suspendedData = await suspendedResponse.json();
          if (suspendedResponse.ok) {
            setSuspendedPartners((suspendedData.partners || []).map((p: any) => ({
              id: String(p.id),
              name: p.business_name || p.name,
              email: p.email,
              category: p.category?.name || 'N/A',
              suspendedDate: p.updated_at ? new Date(p.updated_at).toLocaleDateString() : new Date(p.created_at).toLocaleDateString(),
              status: p.status,
              totalEvents: p.total_events || 0,
              totalRevenue: p.total_earnings ? `KES ${parseFloat(p.total_earnings).toLocaleString()}` : 'KES 0',
            })));
          }

          // Refresh approved partners
          const approvedResponse = await fetch(`${API_ENDPOINTS.admin.partners}?status=approved`, {
            headers: {
              'Content-Type': 'application/json',
              ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
            },
          });
          const approvedData = await approvedResponse.json();
          if (approvedResponse.ok) {
            setApprovedPartners((approvedData.partners || []).map((p: any) => ({
              id: String(p.id),
              name: p.business_name || p.name,
              totalEvents: p.total_events || 0,
              totalRevenue: `KES ${(p.total_revenue || 0).toLocaleString()}`,
              rating: p.rating || 0,
              status: p.status,
              category: p.category?.name,
            })));
          }
        };
        fetchPartners();
      } else {
        setSuccessMessage(data.error || 'Failed to unsuspend partner');
      }
    } catch (error) {
      console.error('Error unsuspending partner:', error);
      setSuccessMessage('Error unsuspending partner');
    } finally {
      setActionLoading(null);
    }
  };

  // Handler for confirming action
  const handleConfirmAction = async () => {
    if (!confirmAction || !confirmAction.partner) return;
    
    const partnerId = confirmAction.partner.id;
    setActionLoading(partnerId);
    
    try {
      const { API_ENDPOINTS } = await import('../../config/api');
      const { getToken } = await import('../../services/authService');

      let response;
      if (confirmAction.type === 'suspend') {
        response = await fetch(API_ENDPOINTS.admin.suspendPartner(Number(partnerId)), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
          },
          body: JSON.stringify({ reason: confirmNoteText.trim() || 'Suspended by admin' }),
        });
      } else if (confirmAction.type === 'flag') {
        // Flag is just a note for now - you can add a flag API endpoint if needed
        if (partnerId && confirmNoteText.trim()) {
          addNoteForPartner(partnerId, {
            text: confirmNoteText.trim(),
            type: confirmAction.type,
            date: new Date().toISOString(),
          });
        }
        setSuccessMessage('Successfully flagged the partner.');
        toast.warning(`Partner flagged: ${confirmAction.partner.name}`, {
          position: 'top-right',
          autoClose: 3000,
        });
        setConfirmAction(null);
        setConfirmNoteText('');
        setActionLoading(null);
        return;
      } else {
        setActionLoading(null);
        return;
      }

      const data = await response.json();
      if (response.ok) {
        if (confirmAction.type === 'suspend') {
          setSuccessMessage('Successfully suspended the partner.');
          toast.error(`Partner suspended: ${confirmAction.partner.name}`, {
            position: 'top-right',
            autoClose: 3000,
          });
        }
        // Refresh partners lists
        const fetchPartners = async () => {
          const { API_ENDPOINTS } = await import('../../config/api');
          const { getToken } = await import('../../services/authService');

          // Refresh approved partners
          const approvedResponse = await fetch(`${API_ENDPOINTS.admin.partners}?status=approved`, {
            headers: {
              'Content-Type': 'application/json',
              ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
            },
          });
          const approvedData = await approvedResponse.json();
          if (approvedResponse.ok) {
            setApprovedPartners((approvedData.partners || []).map((p: any) => ({
              id: String(p.id),
              name: p.business_name || p.name,
              totalEvents: p.total_events || 0,
              totalRevenue: `KES ${(p.total_revenue || 0).toLocaleString()}`,
              rating: p.rating || 0,
              status: p.status,
              category: p.category?.name,
            })));
          }

          // Refresh suspended partners
          const suspendedResponse = await fetch(`${API_ENDPOINTS.admin.partners}?status=suspended`, {
            headers: {
              'Content-Type': 'application/json',
              ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
            },
          });
          const suspendedData = await suspendedResponse.json();
          if (suspendedResponse.ok) {
            setSuspendedPartners((suspendedData.partners || []).map((p: any) => ({
              id: String(p.id),
              name: p.business_name || p.name,
              email: p.email,
              category: p.category?.name || 'N/A',
              suspendedDate: p.updated_at ? new Date(p.updated_at).toLocaleDateString() : new Date(p.created_at).toLocaleDateString(),
              status: p.status,
              totalEvents: p.total_events || 0,
              totalRevenue: p.total_earnings ? `KES ${parseFloat(p.total_earnings).toLocaleString()}` : 'KES 0',
            })));
          }
        };
        fetchPartners();
      } else {
        setSuccessMessage(data.error || 'Failed to perform action');
      }
    } catch (error) {
      console.error('Error performing action:', error);
      setSuccessMessage('Error performing action');
    } finally {
      setConfirmAction(null);
      setConfirmNoteText('');
      setActionLoading(null);
    }
  };

  // Handler for closing success message
  const handleCloseSuccess = () => setSuccessMessage(null);

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
    <div className="space-y-8">
      {/* Pending Partner Applications */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Pending Partner Applications</h2>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : pendingPartners.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No pending partner applications</div>
        ) : (
          <div className="flex flex-col gap-y-4">
            {pendingPartners.map((partner) => (
            <div
              key={partner.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all p-6 border border-gray-100 dark:border-gray-700 cursor-pointer w-full"
              onClick={(e) => {
                if ((e.target as HTMLElement).tagName !== 'BUTTON' && (e.target as HTMLElement).tagName !== 'SPAN') {
                  setSelectedPartner(partner);
                }
              }}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 w-full">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{partner.name}</h3>
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>PENDING</span>
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">{partner.email}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>Category: {partner.category}</span>
                    <span>Submitted: {partner.submittedDate}</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <button
                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center space-x-2 w-full sm:w-auto disabled:opacity-50"
                    onClick={async (e) => {
                      e.stopPropagation();
                      await handleApprovePartner(partner.id);
                    }}
                    disabled={loading || actionLoading === partner.id}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{actionLoading === partner.id ? 'Processing...' : 'Approve'}</span>
                  </button>
                  <button
                    className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center space-x-2 w-full sm:w-auto disabled:opacity-50"
                    onClick={async (e) => {
                      e.stopPropagation();
                      await handleRejectPartner(partner.id);
                    }}
                    disabled={loading || actionLoading === partner.id}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
        {/* Partner Details Modal */}
        {selectedPartner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
            <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
              {/* Header with gradient background */}
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
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                              {partnerDetails.partner?.status?.toUpperCase() || selectedPartner.status?.toUpperCase() || 'ACTIVE'}
                            </span>
                            {partnerDetails.partner?.category && (
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full text-xs font-semibold">
                                {partnerDetails.partner.category.name || partnerDetails.partner.category}
                              </span>
                            )}
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              partnerDetails.partner?.contract_accepted 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {partnerDetails.partner?.contract_accepted ? '✓ Contract Signed' : 'Contract Pending'}
                            </span>
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
                            {partnerDetails.partner?.email || ('email' in selectedPartner ? selectedPartner.email : 'N/A')}
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Phone Number</p>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {partnerDetails.partner?.phone_number || 'Not provided'}
                          </p>
                        </div>
                        {partnerDetails.partner?.location && (
                          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Location</p>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {partnerDetails.partner.location}
                            </p>
                          </div>
                        )}
                        {partnerDetails.partner?.contact_person && (
                          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Contact Person</p>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {partnerDetails.partner.contact_person}
                            </p>
                          </div>
                        )}
                        {partnerDetails.partner?.website && (
                          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 md:col-span-2">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Website</p>
                            <a 
                              href={partnerDetails.partner.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-[#27aae2] hover:underline break-all"
                            >
                              {partnerDetails.partner.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

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
                        {partnerDetails.total_bookings !== undefined && (
                          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 text-center border border-green-200 dark:border-green-800">
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {partnerDetails.total_bookings}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Bookings</p>
                          </div>
                        )}
                        {partnerDetails.partner?.total_earnings !== undefined && (
                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 text-center border border-purple-200 dark:border-purple-800">
                            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                              KES {parseFloat(partnerDetails.partner.total_earnings || 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total Earnings</p>
                          </div>
                        )}
                        {partnerDetails.partner?.pending_earnings !== undefined && (
                          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 text-center border border-orange-200 dark:border-orange-800">
                            <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                              KES {parseFloat(partnerDetails.partner.pending_earnings || 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Pending</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description Card */}
                    {partnerDetails.partner?.description && (
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-3">About</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {partnerDetails.partner.description}
                        </p>
                      </div>
                    )}

                    {/* Interests Card */}
                    {partnerDetails.partner?.interests && (
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-3">Interests</h4>
                        <div className="flex flex-wrap gap-2">
                          {(() => {
                            try {
                              const interests = typeof partnerDetails.partner.interests === 'string' 
                                ? JSON.parse(partnerDetails.partner.interests) 
                                : partnerDetails.partner.interests;
                              if (Array.isArray(interests)) {
                                return interests.map((interest: string, idx: number) => (
                                  <span key={idx} className="px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 dark:from-green-900/40 dark:to-emerald-900/40 dark:text-green-300 rounded-full text-sm font-medium border border-green-200 dark:border-green-800">
                                    {interest}
                                  </span>
                                ));
                              }
                            } catch (e) {
                              const interestsList = partnerDetails.partner.interests.split(',').map((i: string) => i.trim());
                              return interestsList.map((interest: string, idx: number) => (
                                <span key={idx} className="px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 dark:from-green-900/40 dark:to-emerald-900/40 dark:text-green-300 rounded-full text-sm font-medium border border-green-200 dark:border-green-800">
                                  {interest}
                                </span>
                              ));
                            }
                            return <span className="text-sm text-gray-500 dark:text-gray-400">Not provided</span>;
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Timeline Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#27aae2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Timeline
                      </h4>
                      <div className="flex flex-col sm:flex-row gap-4">
                        {partnerDetails.partner?.created_at && (
                          <div className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Registered</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {new Date(partnerDetails.partner.created_at).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                        )}
                        {partnerDetails.partner?.approved_at && (
                          <div className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Approved</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {new Date(partnerDetails.partner.approved_at).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
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

              {/* Partner notes (always shown) */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
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
                      <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
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
    </div>

      {/* Suspended Partners */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Suspended Partners</h2>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : suspendedPartners.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No suspended partners</div>
        ) : (
          <div className="flex flex-col gap-y-4">
            {suspendedPartners.map((partner) => (
              <div
                key={partner.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all p-6 border border-gray-100 dark:border-gray-700 w-full"
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 w-full">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{partner.name}</h3>
                      <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-full text-xs font-semibold">
                        SUSPENDED
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">{partner.email}</p>
                    <div className="flex flex-wrap gap-6 text-sm text-gray-600 dark:text-gray-400 mt-3">
                      <span>Category: {partner.category}</span>
                      <span>Suspended: {partner.suspendedDate}</span>
                      {partner.totalEvents !== undefined && <span>{partner.totalEvents} events</span>}
                      {partner.totalRevenue && <span>Revenue: {partner.totalRevenue}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button
                      className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center space-x-2 w-full sm:w-auto disabled:opacity-50"
                      onClick={async () => {
                        await handleUnsuspendPartner(partner.id);
                      }}
                      disabled={loading || actionLoading === partner.id}
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{actionLoading === partner.id ? 'Processing...' : 'Unsuspend'}</span>
                    </button>
                    <button
                      className="px-6 py-2.5 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:border-[#27aae2] hover:text-[#27aae2] transition-all w-full sm:w-auto"
                      onClick={() => setSelectedPartner(partner)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Partners */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Active Partners</h2>
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by partner name..."
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-full sm:w-1/2"
          />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-full sm:w-1/3"
          >
            {landingCategories.map(cat => (
              <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
            ))}
          </select>
        </div>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : filteredPartners.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No active partners found</div>
        ) : (
          <div className="flex flex-col gap-y-4">
            {filteredPartners.map((partner) => (
            <div
              key={partner.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all p-6 border border-gray-100 dark:border-gray-700 w-full"
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 w-full">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{partner.name}</h3>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      ACTIVE
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-6 text-sm text-gray-600 dark:text-gray-400 mt-3">
                    <span>{partner.totalEvents} events</span>
                    <span>Revenue: {partner.totalRevenue}</span>
                    <span>Rating: {partner.rating}/5.0</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <button className="px-6 py-2.5 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:border-[#27aae2] hover:text-[#27aae2] transition-all w-full sm:w-auto"
                    onClick={() => setSelectedPartner(partner)}
                  >
                    View Details
                  </button>
                  <button
                    className="px-6 py-2.5 border-2 border-red-200 dark:border-red-700 text-red-600 rounded-lg font-semibold hover:border-red-500 transition-all flex items-center space-x-2 w-full sm:w-auto"
                    onClick={() => handleSuspendPartner(partner)}
                  >
                    <span>Suspend</span>
                  </button>
                  <button
                    className="px-6 py-2.5 border-2 border-yellow-200 dark:border-yellow-700 text-yellow-600 rounded-lg font-semibold hover:border-yellow-500 transition-all flex items-center space-x-2 w-full sm:w-auto"
                    onClick={() => handleFlagPartner(partner)}
                  >
                    <span role="img" aria-label="flag">🚩</span>
                    <span>Flag</span>
                  </button>
                  {/* Confirmation Modal for Flag/Delete/Suspend */}
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
                          {confirmAction.type === 'delete' && 'Do you want to delete this partner?'}
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

                  {/* Success Message Modal */}
                  {successMessage && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 max-w-sm w-full text-center relative">
                        <button
                          className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-2xl font-bold"
                          onClick={handleCloseSuccess}
                        >
                          &times;
                        </button>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Success</h2>
                        <p className="mb-6 text-gray-700 dark:text-gray-300">{successMessage}</p>
                        <button
                          className="px-6 py-2.5 bg-[#27aae2] text-white rounded-lg font-semibold hover:bg-[#1a8ec4] transition-colors"
                          onClick={handleCloseSuccess}
                        >
                          OK
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
