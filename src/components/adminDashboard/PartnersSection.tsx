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
}

interface PartnersProps {
  pendingPartners: PendingPartner[];
  approvedPartners: ApprovedPartner[];
}

export default function PartnersSection({ pendingPartners, approvedPartners }: PartnersProps) {
  const [selectedPartner, setSelectedPartner] = React.useState<PendingPartner | ApprovedPartner | null>(null);
  const [confirmAction, setConfirmAction] = React.useState<{
    type: 'flag' | 'delete' | 'suspend';
    partner: PendingPartner | ApprovedPartner | null;
  } | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // Handler for showing confirmation modal
  const handleFlagPartner = (partner: PendingPartner | ApprovedPartner) => {
    setConfirmAction({ type: 'flag', partner });
  };
  const handleDeletePartner = (partner: PendingPartner | ApprovedPartner) => {
    setConfirmAction({ type: 'delete', partner });
  };
  const handleSuspendPartner = (partner: ApprovedPartner | PendingPartner) => {
    setConfirmAction({ type: 'suspend', partner });
  };

  // Handler for confirming action
  const handleConfirmAction = () => {
    if (!confirmAction) return;
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
    }, 700);
  };

  // Handler for closing success message
  const handleCloseSuccess = () => setSuccessMessage(null);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Pending Partner Applications</h2>
        <div className="space-y-4">
          {pendingPartners.map((partner) => (
            <div
              key={partner.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all p-6 border border-gray-100 dark:border-gray-700 cursor-pointer"
              onClick={(e) => {
                // Only open modal if the card itself is clicked, not a button inside
                if ((e.target as HTMLElement).tagName !== 'BUTTON' && (e.target as HTMLElement).tagName !== 'SPAN') {
                  setSelectedPartner(partner);
                }
              }}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
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
                <div className="flex gap-2">
                  <button
                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center space-x-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Add approve logic here
                    }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center space-x-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Add reject logic here
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 max-w-lg w-full relative">
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
                  <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                    <span className="text-gray-400 dark:text-gray-500 text-4xl font-bold">{selectedPartner.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-lg text-gray-900 dark:text-white">{selectedPartner.name}</p>
                    <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700 font-semibold">{selectedPartner.status?.toUpperCase() || 'ACTIVE'}</span>
                  </div>
                </div>

                {/* Categories & Interests */}
                {'category' in selectedPartner && (
                  <div>
                    <p className="font-semibold mb-1">Categories (Closed Ended):</p>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium mr-2">{selectedPartner.category}</span>
                  </div>
                )}
                <div>
                  <p className="font-semibold mb-1">Interests (Open Ended):</p>
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Not Provided</span>
                </div>

                {/* Details */}
                {'email' in selectedPartner && (
                  <div>
                    <p className="font-semibold mb-1">Email to receive RSVPs:</p>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{selectedPartner.email}</span>
                  </div>
                )}
                {'totalEvents' in selectedPartner && (
                  <div>
                    <p className="font-semibold mb-1">Total Events:</p>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{selectedPartner.totalEvents}</span>
                  </div>
                )}
                {'totalRevenue' in selectedPartner && (
                  <div>
                    <p className="font-semibold mb-1">Total Revenue:</p>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{selectedPartner.totalRevenue}</span>
                  </div>
                )}
                {'rating' in selectedPartner && (
                  <div>
                    <p className="font-semibold mb-1">Rating:</p>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{selectedPartner.rating}/5.0</span>
                  </div>
                )}
                <div>
                  <p className="font-semibold mb-1">Contact Phone Number:</p>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Not Provided</span>
                </div>

                {/* Contract & Terms */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-semibold">Partner Contract:</span>
                  <span className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">Signed Digitally</span>
                </div>
                <div>
                  <a href="#" className="text-sm text-[#27aae2] hover:underline">Read Terms and Conditions</a>
                </div>

                {/* Submission Date */}
                {'submittedDate' in selectedPartner && (
                  <div>
                    <p className="font-semibold mb-1">Submitted:</p>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{selectedPartner.submittedDate}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Active Partners</h2>
        <div className="space-y-4">
          {approvedPartners.map((partner) => (
            <div
              key={partner.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all p-6 border border-gray-100 dark:border-gray-700"
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
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
                <div className="flex gap-2">
                  <button className="px-6 py-2.5 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:border-[#27aae2] hover:text-[#27aae2] transition-all"
                    onClick={() => setSelectedPartner(partner)}
                  >
                    View Details
                  </button>
                  <button
                    className="px-6 py-2.5 border-2 border-red-200 dark:border-red-700 text-red-600 rounded-lg font-semibold hover:border-red-500 transition-all flex items-center space-x-2"
                    onClick={() => handleSuspendPartner(partner)}
                  >
                    <span>Suspend</span>
                  </button>
                  <button
                    className="px-6 py-2.5 border-2 border-yellow-200 dark:border-yellow-700 text-yellow-600 rounded-lg font-semibold hover:border-yellow-500 transition-all flex items-center space-x-2"
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
