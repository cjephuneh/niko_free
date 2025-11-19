import React from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

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

interface PartnersProps {
  pendingPartners: PendingPartner[];
  approvedPartners: ApprovedPartner[];
}

interface PartnerNote {
  text: string;
  type: 'note' | 'flag' | 'suspend' | 'delete';
  date: string; // ISO
  author?: string;
}

export default function PartnersSection({ pendingPartners, approvedPartners }: PartnersProps) {
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
  const [confirmAction, setConfirmAction] = React.useState<{
    type: 'flag' | 'delete' | 'suspend';
    partner: PendingPartner | ApprovedPartner | null;
  } | null>(null);
  const [confirmNoteText, setConfirmNoteText] = React.useState('');
  const [partnerNotes, setPartnerNotes] = React.useState<Record<string, PartnerNote[]>>({});
  const [detailsNoteText, setDetailsNoteText] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

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

  // Handler for confirming action
  const handleConfirmAction = () => {
    if (!confirmAction) return;
    // If admin provided a note during confirmation, save it with the action type
    const partnerId = confirmAction.partner?.id;
    if (partnerId && confirmNoteText.trim()) {
      addNoteForPartner(partnerId, {
        text: confirmNoteText.trim(),
        type: confirmAction.type,
        date: new Date().toISOString(),
      });
    }
    // Simulate async success
    setTimeout(() => {
      if (confirmAction.type === 'flag') {
        setSuccessMessage('Successfully flagged the partner.');
      } else if (confirmAction.type === 'delete') {
        setSuccessMessage('Successfully deleted the partner.');
      } else if (confirmAction.type === 'suspend') {
        setSuccessMessage('Successfully suspended the partner.');
      }
      setConfirmAction(null);
      setConfirmNoteText('');
    }, 700);
  };

  // Handler for closing success message
  const handleCloseSuccess = () => setSuccessMessage(null);

  return (
    <div className="space-y-8">
      {/* Pending Partner Applications */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Pending Partner Applications</h2>
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
                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center space-x-2 w-full sm:w-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center space-x-2 w-full sm:w-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Partner Details Modal */}
        {selectedPartner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-8 max-w-lg w-full relative">
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-2xl font-bold"
                onClick={() => setSelectedPartner(null)}
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Partner Registration Details</h2>
              <div className="space-y-4">
                {/* Logo */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
                    <span className="text-gray-400 dark:text-gray-500 text-4xl font-bold">{selectedPartner.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-lg text-gray-900 dark:text-white">{selectedPartner.name}</p>
                    <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 font-semibold">{selectedPartner.status?.toUpperCase() || 'ACTIVE'}</span>
                  </div>
                </div>

                {/* Category */}
                {'category' in selectedPartner && (
                  <div>
                    <p className="font-semibold mb-1 text-gray-900 dark:text-gray-100">Category:</p>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 dark:text-blue-200 dark:bg-blue-800 rounded-full text-xs font-medium mr-2">
                      {selectedPartner.category}
                    </span>
                  </div>
                )}

                {/* Category */}
                {'category' in selectedPartner && (
                  <div>
                    <p className="font-semibold mb-1 text-gray-900 dark:text-gray-100">Category:</p>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 dark:text-blue-200 dark:bg-blue-800 rounded-full text-xs font-medium mr-2">
                      {selectedPartner.category}
                    </span>
                  </div>
                )}

                {/* Email (pending partner) */}
                {'email' in selectedPartner && (
                  <div>
                    <p className="font-semibold mb-1 text-gray-900 dark:text-gray-100">Email to receive RSVPs:</p>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{selectedPartner.email}</span>
                  </div>
                )}

                {/* Total Events (approved partner) */}
                {'totalEvents' in selectedPartner && (
                  <div>
                    <p className="font-semibold mb-1 text-gray-900 dark:text-gray-100">Total Events:</p>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{selectedPartner.totalEvents}</span>
                  </div>
                )}

                {/* Total Revenue (approved partner) */}
                {'totalRevenue' in selectedPartner && (
                  <div>
                    <p className="font-semibold mb-1 text-gray-900 dark:text-gray-100">Total Revenue:</p>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{selectedPartner.totalRevenue}</span>
                  </div>
                )}

                {/* Rating (approved partner) */}
                {'rating' in selectedPartner && (
                  <div>
                    <p className="font-semibold mb-1 text-gray-900 dark:text-gray-100">Rating:</p>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{selectedPartner.rating}/5.0</span>
                  </div>
                )}

                {/* Submitted Date (pending partner) */}
                {'submittedDate' in selectedPartner && (
                  <div>
                    <p className="font-semibold mb-1 text-gray-900 dark:text-gray-100">Submitted:</p>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{selectedPartner.submittedDate}</span>
                  </div>
                )}

                {/* Interests (placeholder) */}
                <div>
                  <p className="font-semibold mb-1 text-gray-900 dark:text-gray-100">Interests (Open Ended):</p>
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full text-xs font-medium">Not Provided</span>
                </div>

                {/* Contact Phone Number (placeholder) */}
                <div>
                  <p className="font-semibold mb-1 text-gray-900 dark:text-gray-100">Contact Phone Number:</p>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Not Provided</span>
                </div>

                {/* Contract (placeholder) */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-semibold text-gray-900 dark:text-white">Partner Contract:</span>
                  <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300">Signed Digitally</span>
                </div>
                {/* Partner notes (moved to bottom) */}
                <div>
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
      </div>
    </div>
  );
}
