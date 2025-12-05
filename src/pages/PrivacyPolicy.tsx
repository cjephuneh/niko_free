import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, Database, Cookie, UserCheck, Bell, Globe, Mail } from 'lucide-react';
import SEO from '../components/SEO';

interface PrivacyPolicyProps {
  onNavigate: (page: string) => void;
}

export default function PrivacyPolicy({ onNavigate }: PrivacyPolicyProps) {
  return (
    <>
      <SEO
        title="Privacy Policy - Niko Free"
        description="Learn how Niko Free collects, uses, and protects your personal information. Our commitment to your privacy and data security in compliance with Kenya's Data Protection Act (2019)."
        keywords="privacy policy, data protection, personal information, niko free privacy, data security, GDPR, Kenya data protection act"
        url="https://niko-free.com/privacy"
      />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#27aae2] to-[#1e8bb8] text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Privacy Policy</h1>
                <p className="text-white/80 mt-2">Last Updated: December 5, 2025</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Introduction */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 mb-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              At <strong>NIKO FREE</strong>, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, store, and protect your data when you use our website and services.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              By using the NIKO FREE platform, you consent to the practices described in this Privacy Policy. We comply with the <strong>Data Protection Act (2019)</strong> of Kenya and other applicable data protection regulations.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {/* 1. Information We Collect */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Information We Collect</h2>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">1.1 Personal Information</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                    When you create an account, purchase tickets, or interact with our platform, we may collect:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4 mb-4">
                    <li>Full name</li>
                    <li>Email address</li>
                    <li>Phone number</li>
                    <li>Payment information (processed securely through third-party payment providers)</li>
                    <li>Profile information (profile picture, preferences, interests)</li>
                    <li>Location data (if you enable location services)</li>
                  </ul>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">1.2 Automatically Collected Information</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                    We automatically collect certain information when you visit our website:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4 mb-4">
                    <li>IP address</li>
                    <li>Browser type and version</li>
                    <li>Device information (type, operating system)</li>
                    <li>Pages visited and time spent on each page</li>
                    <li>Referring website or source</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">1.3 Partner and Event Organizer Information</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                    If you register as a partner or event organizer, we collect:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4">
                    <li>Business name and registration details</li>
                    <li>Business contact information</li>
                    <li>Bank account details for payouts</li>
                    <li>Event details and promotional materials</li>
                    <li>Tax identification information (if applicable)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 2. How We Use Your Information */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. How We Use Your Information</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                    We use your personal information for the following purposes:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                    <li><strong>Account Management:</strong> To create and manage your account</li>
                    <li><strong>Service Delivery:</strong> To process ticket purchases, event registrations, and bookings</li>
                    <li><strong>Payment Processing:</strong> To facilitate secure payments and transactions</li>
                    <li><strong>Communication:</strong> To send booking confirmations, event updates, and customer support responses</li>
                    <li><strong>Personalization:</strong> To recommend events based on your preferences and browsing history</li>
                    <li><strong>Marketing:</strong> To send promotional offers and newsletters (you can opt-out anytime)</li>
                    <li><strong>Analytics:</strong> To analyze platform usage and improve our services</li>
                    <li><strong>Security:</strong> To detect and prevent fraud, unauthorized access, and security threats</li>
                    <li><strong>Legal Compliance:</strong> To comply with legal obligations and regulatory requirements</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 3. Cookies and Tracking */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Cookie className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Cookies and Tracking Technologies</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    We use cookies and similar technologies to enhance your browsing experience. Cookies are small text files stored on your device that help us:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4 mb-4">
                    <li>Remember your login information</li>
                    <li>Track your preferences and settings</li>
                    <li>Analyze website traffic and performance</li>
                    <li>Deliver targeted advertisements</li>
                    <li>Improve website functionality</li>
                  </ul>
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      <strong>Cookie Control:</strong> You can manage or disable cookies through your browser settings. However, disabling cookies may affect some features of our website.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Data Sharing */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Globe className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. How We Share Your Information</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    We do not sell your personal information to third parties. However, we may share your information in the following circumstances:
                  </p>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">4.1 With Event Organizers and Partners</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    When you purchase a ticket or register for an event, we share necessary information (name, email, phone number) with the event organizer to facilitate your attendance.
                  </p>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">4.2 With Service Providers</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                    We work with trusted third-party service providers for:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4 mb-4">
                    <li>Payment processing (M-Pesa, credit card processors)</li>
                    <li>Email delivery and communication services</li>
                    <li>Cloud hosting and data storage</li>
                    <li>Analytics and advertising platforms</li>
                    <li>Customer support tools</li>
                  </ul>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">4.3 Legal Requirements</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    We may disclose your information if required by law, court order, or government request, or to protect our rights, property, or safety.
                  </p>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">4.4 Business Transfers</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new entity.
                  </p>
                </div>
              </div>
            </section>

            {/* 5. Data Security */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lock className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Data Security</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                    We implement industry-standard security measures to protect your personal information:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4 mb-4">
                    <li>SSL/TLS encryption for data transmission</li>
                    <li>Secure password hashing and storage</li>
                    <li>Regular security audits and vulnerability assessments</li>
                    <li>Access controls and authentication mechanisms</li>
                    <li>Secure data centers with physical security measures</li>
                    <li>Regular backups and disaster recovery procedures</li>
                  </ul>
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      <strong>Important:</strong> While we take reasonable steps to protect your data, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 6. Your Rights */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <UserCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Your Data Rights</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                    Under the Data Protection Act (2019) of Kenya, you have the following rights:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4 mb-4">
                    <li><strong>Right to Access:</strong> Request a copy of your personal data we hold</li>
                    <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete data</li>
                    <li><strong>Right to Erasure:</strong> Request deletion of your personal data (subject to legal requirements)</li>
                    <li><strong>Right to Restriction:</strong> Request limitation on how we process your data</li>
                    <li><strong>Right to Data Portability:</strong> Request your data in a portable format</li>
                    <li><strong>Right to Object:</strong> Object to processing of your data for marketing purposes</li>
                    <li><strong>Right to Withdraw Consent:</strong> Withdraw consent for data processing at any time</li>
                  </ul>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    To exercise any of these rights, please contact us at <a href="mailto:privacy@niko-free.com" className="text-[#27aae2] hover:underline font-semibold">privacy@niko-free.com</a>
                  </p>
                </div>
              </div>
            </section>

            {/* 7. Data Retention */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Data Retention</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                We retain your personal information for as long as necessary to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4 mb-4">
                <li>Provide our services and maintain your account</li>
                <li>Comply with legal and regulatory requirements</li>
                <li>Resolve disputes and enforce our agreements</li>
                <li>Prevent fraud and security incidents</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                When your data is no longer needed, we will securely delete or anonymize it.
              </p>
            </section>

            {/* 8. Children's Privacy */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Children's Privacy</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
              </p>
            </section>

            {/* 9. Marketing Communications */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Bell className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Marketing Communications</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    With your consent, we may send you promotional emails, newsletters, and event recommendations. You can opt-out at any time by:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4">
                    <li>Clicking the "Unsubscribe" link in any email</li>
                    <li>Updating your communication preferences in your account settings</li>
                    <li>Contacting our support team</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 10. Third-Party Links */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Third-Party Links</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Our website may contain links to third-party websites, social media platforms, or services. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before providing any personal information.
              </p>
            </section>

            {/* 11. International Data Transfers */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">11. International Data Transfers</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Your information may be transferred to and processed in countries outside Kenya. We ensure that appropriate safeguards are in place to protect your data in accordance with applicable data protection laws.
              </p>
            </section>

            {/* 12. Changes to Privacy Policy */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">12. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of significant changes by posting a notice on our website or sending you an email. Your continued use of our services after such changes constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* 13. Contact Us */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">13. Contact Information</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
                  </p>
                  <div className="space-y-2">
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Email:</strong> <a href="mailto:privacy@niko-free.com" className="text-[#27aae2] hover:underline">privacy@niko-free.com</a>
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>General Support:</strong> <a href="mailto:support@niko-free.com" className="text-[#27aae2] hover:underline">support@niko-free.com</a>
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Data Protection Officer:</strong> <a href="mailto:dpo@niko-free.com" className="text-[#27aae2] hover:underline">dpo@niko-free.com</a>
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Consent */}
            <section className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Consent</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                By using the NIKO FREE website and services, you acknowledge that you have read and understood this Privacy Policy and consent to the collection, use, and disclosure of your personal information as described herein.
              </p>
            </section>
          </div>

          {/* Back to Top Button */}
          <div className="mt-12 text-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-6 py-3 bg-[#27aae2] text-white rounded-lg font-semibold hover:bg-[#1e8bb8] transition-colors"
            >
              Back to Top
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
