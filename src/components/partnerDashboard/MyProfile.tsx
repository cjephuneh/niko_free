import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Building2, Globe, Camera, Save, AlertCircle, FileText, Trash2, X } from 'lucide-react';
import { getPartnerProfile, updatePartnerProfile, uploadPartnerLogo, getPartner } from '../../services/partnerService';
import { getImageUrl } from '../../config/api';

export default function MyProfile() {
  const [formData, setFormData] = useState({
    organizationName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    location: '',
    website: '',
    description: '',
  });
  const [logo, setLogo] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null); // For preview only
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch partner profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const partner = getPartner();
        
        // Try to get from localStorage first (faster)
        if (partner) {
          setFormData({
            organizationName: partner.business_name || '',
            contactPerson: partner.contact_person || '',
            email: partner.email || '',
            phone: partner.phone_number || '',
            address: partner.address || '',
            location: partner.location || '',
            website: partner.website || '',
            description: partner.description || '',
          });
          // Filter out base64 data URIs
          const partnerLogo = partner.logo;
          if (partnerLogo && !partnerLogo.startsWith('data:image')) {
            setLogo(partnerLogo);
          }
        }

        // Then fetch fresh data from API
        const response = await getPartnerProfile();
        if (response && response.partner) {
          const data = response.partner;
          setFormData({
            organizationName: data.business_name || '',
            contactPerson: data.contact_person || '',
            email: data.email || '',
            phone: data.phone_number || '',
            address: data.address || '',
            location: data.location || '',
            website: data.website || '',
            description: data.description || '',
          });
          // Filter out base64 data URIs - only use valid file paths
          const apiLogo = data.logo;
          if (apiLogo && !apiLogo.startsWith('data:image')) {
            setLogo(apiLogo);
          } else {
            setLogo(null);
          }
        }
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');
      setSuccess(false);

      // Upload logo first if changed
      if (logoFile) {
        const uploadResponse = await uploadPartnerLogo(logoFile);
        setLogoFile(null);
        setLogoPreview(null); // Clear preview after upload
        
        // Update logo with the new URL from API response
        if (uploadResponse.partner && uploadResponse.partner.logo) {
          const newLogo = uploadResponse.partner.logo;
          // Only set if it's not a base64 string
          if (!newLogo.startsWith('data:image')) {
            setLogo(newLogo);
          }
        }
        
        // Refresh profile to get latest data
        const profileResponse = await getPartnerProfile();
        if (profileResponse && profileResponse.partner && profileResponse.partner.logo) {
          const freshLogo = profileResponse.partner.logo;
          if (!freshLogo.startsWith('data:image')) {
            setLogo(freshLogo);
          }
        }
      }

      // Update profile
      const updateResponse = await updatePartnerProfile({
        business_name: formData.organizationName,
        contact_person: formData.contactPerson,
        phone_number: formData.phone,
        address: formData.address,
        location: formData.location,
        website: formData.website,
        description: formData.description,
      });

      // Update form data with the response from API to ensure we have the latest data
      if (updateResponse && updateResponse.partner) {
        const updatedPartner = updateResponse.partner;
        setFormData({
          organizationName: updatedPartner.business_name || '',
          contactPerson: updatedPartner.contact_person || '',
          email: updatedPartner.email || '',
          phone: updatedPartner.phone_number || '',
          address: updatedPartner.address || '',
          location: updatedPartner.location || '',
          website: updatedPartner.website || '',
          description: updatedPartner.description || '',
        });
      } else {
        // Fallback: refresh from API if response doesn't have partner data
        const profileResponse = await getPartnerProfile();
        if (profileResponse && profileResponse.partner) {
          const data = profileResponse.partner;
          setFormData({
            organizationName: data.business_name || '',
            contactPerson: data.contact_person || '',
            email: data.email || '',
            phone: data.phone_number || '',
            address: data.address || '',
            location: data.location || '',
            website: data.website || '',
            description: data.description || '',
          });
        }
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setLogoFile(file);
      
      // Preview (use separate state for preview, not the actual logo)
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setError('Please type DELETE to confirm account deletion');
      return;
    }

    try {
      setIsDeleting(true);
      setError('');

      // TODO: Call delete account API
      // For now, just show a message
      alert('Account deletion is being processed. You will be logged out shortly.');
      
      // Clear local storage and redirect to login
      localStorage.removeItem('partner_token');
      localStorage.removeItem('partner');
      window.location.href = '/partner-login';
    } catch (err: any) {
      console.error('Error deleting account:', err);
      setError(err.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27aae2]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">My Profile</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage your profile information</p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-4 flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-xl p-4 flex items-start space-x-2">
          <Save className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700 dark:text-green-400">Profile updated successfully!</p>
        </div>
      )}

      {/* Profile Picture Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Picture</h3>
        <div className="flex items-center space-x-6">
          <div className="relative">
            {logoPreview ? (
              // Show preview if available (user just selected a file)
              <img 
                src={logoPreview}
                alt="Logo Preview"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
              />
            ) : logo && !logo.startsWith('data:image') ? (
              // Show actual logo from API (only if it's not a base64 string)
              <img 
                src={getImageUrl(logo)}
                alt="Logo"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                onError={(e) => {
                  // If image fails to load, show placeholder
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    const placeholder = document.createElement('div');
                    placeholder.className = 'w-24 h-24 bg-gradient-to-br from-[#27aae2] to-[#1e8bb8] rounded-full flex items-center justify-center';
                    placeholder.innerHTML = '<svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>';
                    parent.appendChild(placeholder);
                  }
                }}
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-[#27aae2] to-[#1e8bb8] rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
            )}
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-lg border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors cursor-pointer">
              <Camera className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{formData.organizationName || 'Organization Name'}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{formData.email || 'Email'}</p>
            <label className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer inline-block">
              Change Picture
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Organization Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Organization Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Building2 className="w-4 h-4 inline mr-1" />
              Organization Name
            </label>
            <input
              type="text"
              value={formData.organizationName}
              onChange={(e) => handleInputChange('organizationName', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Contact Person
            </label>
            <input
              type="text"
              value={formData.contactPerson}
              onChange={(e) => handleInputChange('contactPerson', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              About
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
              placeholder="Tell us about your business, what events you organize, and your experience..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
              placeholder="City, Country"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Globe className="w-4 h-4 inline mr-1" />
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
              placeholder="https://example.com"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
              placeholder="Tell us about your organization..."
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center space-x-2 px-6 py-3 bg-[#27aae2] text-white rounded-lg font-medium hover:bg-[#1e8bb8] transition-colors shadow-sm ${
            isSaving ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isSaving ? (
            <>
              <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* Danger Zone - Delete Account */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-red-500 p-6">
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Danger Zone
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          <Trash2 className="w-5 h-5" />
          <span>Delete My Account</span>
        </button>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75 backdrop-blur-sm"
              onClick={() => setShowDeleteModal(false)}
            />

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Delete Account</h3>
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                <div className="mb-6">
                  <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-4">
                    This action <strong className="text-red-600 dark:text-red-400">cannot be undone</strong>. 
                    This will permanently delete your partner account and remove all associated data.
                  </p>
                </div>

                {/* Warning box */}
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg mb-6">
                  <div className="flex">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="ml-3">
                      <p className="text-sm text-red-800 dark:text-red-300 font-medium mb-2">
                        This will permanently delete:
                      </p>
                      <ul className="text-sm text-red-700 dark:text-red-400 list-disc list-inside space-y-1">
                        <li>Your partner profile and account</li>
                        <li>All your events (upcoming and past)</li>
                        <li>All ticket types and bookings</li>
                        <li>All analytics and revenue data</li>
                        <li>All promo codes and promotions</li>
                        <li>Team members and permissions</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Confirmation Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type <span className="font-bold text-red-600 dark:text-red-400">DELETE</span> to confirm:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-500 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmText('');
                    setError('');
                  }}
                  className="px-6 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteConfirmText !== 'DELETE'}
                  className={`px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 ${
                    isDeleting || deleteConfirmText !== 'DELETE' ? 'opacity-50 cursor-not-allowed' : 'hover:from-red-700 hover:to-red-800'
                  }`}
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Delete My Account</span>
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
