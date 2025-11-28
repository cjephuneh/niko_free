import React from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-2xl font-bold"
                onClick={() => {
                  setSelectedPartner(null);
                  setPartnerDetails(null);
                }}
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Partner Details</h2>
              
              {loadingPartnerDetails ? (
                <div className="text-center py-8 text-gray-500">Loading partner details...</div>
              ) : partnerDetails ? (
                <div className="space-y-4">
                  {/* Logo and Basic Info */}
                  <div className="flex items-center gap-4">
                    {partnerDetails.partner?.logo ? (
                      <img 
                        src={partnerDetails.partner.logo.startsWith('http') ? partnerDetails.partner.logo : `${API_BASE_URL}${partnerDetails.partner.logo}`}
                        alt={partnerDetails.partner.business_name}
                        className="w-16 h-16 rounded-xl object-cover border border-gray-200 dark:border-gray-700"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
                        <span className="text-gray-400 dark:text-gray-500 text-4xl font-bold">
                          {partnerDetails.partner?.business_name?.charAt(0) || selectedPartner.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-lg text-gray-900 dark:text-white">
                        {partnerDetails.partner?.business_name || selectedPartner.name}
                      </p>
                      <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 font-semibold">
                        {partnerDetails.partner?.status?.toUpperCase() || selectedPartner.status?.toUpperCase() || 'ACTIVE'}
                      </span>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <p className="font-semibold mb-1 text-gray-900 dark:text-gray-100">Email:</p>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {partnerDetails.partner?.email || ('email' in selectedPartner ? selectedPartner.email : 'N/A')}
                    </span>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <p className="font-semibold mb-1 text-gray-900 dark:text-gray-100">Phone Number:</p>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {partnerDetails.partner?.phone_number || 'Not provided'}
                    </span>
                  </div>

                  {/* Category */}
                  {partnerDetails.partner?.category && (
                    <div>
                      <p className="font-semibold mb-1 text-gray-900 dark:text-gray-100">Category:</p>
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 dark:text-blue-200 dark:bg-blue-800 rounded-full text-xs font-medium mr-2">
                        {partnerDetails.partner.category.name || partnerDetails.partner.category}
                      </span>
                    </div>
                  )}

                  {/* Location */}
                  {partnerDetails.partner?.location && (
                    <div>
                      <p className="font-semibold mb-1 text-gray-900 dark:text-gray-100">Location:</p>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {partnerDetails.partner.location}
                      </span>
                    </div>
                  )}

                  {/* Contact Person */}
                  {partnerDetails.partner?.contact_person && (
                    <div>
                      <p className="font-semibold mb-1 text-gray-900 dark:text-gray-100">Contact Person:</p>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {partnerDetails.partner.contact_person}
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  {partnerDetails.partner?.description && (
                    <div>
                      <p className="font-semibold mb-1 text-gray-900 dark:text-gray-100">Description:</p>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {partnerDetails.partner.description}
                      </span>
                    </div>
                  )}

                  {/* Interests */}
                  <div>
                    <p className="font-semibold mb-1 text-gray-900 dark:text-gray-100">Interests:</p>
                    {partnerDetails.partner?.interests ? (
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          try {
                            const interests = typeof partnerDetails.partner.interests === 'string' 
                              ? JSON.parse(partnerDetails.partner.interests) 
                              : partnerDetails.partner.interests;
                            if (Array.isArray(interests)) {
                              return interests.map((interest: string, idx: number) => (
                                <span key={idx} className="inline-block px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full text-xs font-medium">
                                  {interest}
                                </span>
                              ));
                            }
                          } catch (e) {
                            // If parsing fails, treat as comma-separated string
                            const interestsList = partnerDetails.partner.interests.split(',').map((i: string) => i.trim());
                            return interestsList.map((interest: string, idx: number) => (
                              <span key={idx} className="inline-block px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full text-xs font-medium">
                                {interest}
                              </span>
                            ));
                          }
                          return null;
                        })()}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">Not provided</span>
                    )}
                  </div>

                  {/* Total Events - Dynamic from API */}
                  <div>
                    <p className="font-semibold mb-1 text-gray-900 dark:text-gray-100">Total Events:</p>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {partnerDetails.events?.length || 0} events
                    </span>
                  </div>

                  {/* Total Bookings */}
                  {partnerDetails.total_bookings !== undefined && (
                    <div>
                      <p className="font-semibold mb-1 text-gray-900 dark:text-gray-100">Total Bookings:</p>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {partnerDetails.total_bookings} confirmed bookings
                      </span>
                    </div>
                  )}

                  {/* Total Revenue */}
                  {partnerDetails.partner?.total_earnings !== undefined && (
                    <div>
                      <p className="font-semibold mb-1 text-gray-900 dark:text-gray-100">Total Earnings:</p>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        KES {parseFloat(partnerDetails.partner.total_earnings || 0).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Pending Earnings */}
                  {partnerDetails.partner?.pending_earnings !== undefined && (
                    <div>
                      <p className="font-semibold mb-1 text-gray-900 dark:text-gray-100">Pending Earnings:</p>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        KES {parseFloat(partnerDetails.partner.pending_earnings || 0).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Website */}
                  {partnerDetails.partner?.website && (
                    <div>
                      <p className="font-semibold mb-1 text-gray-900 dark:text-gray-100">Website:</p>
                      <a 
                        href={partnerDetails.partner.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-[#27aae2] hover:underline"
                      >
                        {partnerDetails.partner.website}
                      </a>
                    </div>
                  )}

                  {/* Created Date */}
                  {partnerDetails.partner?.created_at && (
                    <div>
                      <p className="font-semibold mb-1 text-gray-900 dark:text-gray-100">Registered:</p>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {new Date(partnerDetails.partner.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {/* Approved Date */}
                  {partnerDetails.partner?.approved_at && (
                    <div>
                      <p className="font-semibold mb-1 text-gray-900 dark:text-gray-100">Approved:</p>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {new Date(partnerDetails.partner.approved_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {/* Contract Status */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-semibold text-gray-900 dark:text-white">Contract Status:</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      partnerDetails.partner?.contract_accepted 
                        ? 'bg-green-200 text-green-700 dark:bg-green-900 dark:text-green-300' 
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {partnerDetails.partner?.contract_accepted ? 'Signed Digitally' : 'Not Signed'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">Failed to load partner details</div>
              )}

              {/* Partner notes (always shown) */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Admin Notes:</p>
                <div className="space-y-2 max-h-36 overflow-y-auto mb-2">
                  {(selectedPartner && partnerNotes[selectedPartner.id]) ? (
                    partnerNotes[selectedPartner.id].map((n, i) => (
                      <div key={i} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-100 dark:border-gray-700 text-sm">
                        <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(n.date).toLocaleString()} · {n.type.toUpperCase()}</div>
                        <div className="text-gray-700 dark:text-gray-200">{n.text}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-600 dark:text-gray-400">No notes yet.</div>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={detailsNoteText}
                    onChange={e => setDetailsNoteText(e.target.value)}
                    placeholder="Add a note about this partner..."
                    className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                  />
                  <button
                    className="px-3 py-2 bg-[#27aae2] text-white rounded-lg"
                    onClick={() => {
                      if (!selectedPartner) return;
                      if (!detailsNoteText.trim()) return;
                      addNoteForPartner(selectedPartner.id, { text: detailsNoteText.trim(), type: 'note', date: new Date().toISOString() });
                      setDetailsNoteText('');
                    }}
                  >Add</button>
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
