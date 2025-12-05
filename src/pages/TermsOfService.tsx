import React from 'react';
import { ArrowLeft, FileText, Shield, CreditCard, Users, AlertCircle, Scale } from 'lucide-react';
import SEO from '../components/SEO';

interface TermsOfServiceProps {
  onNavigate: (page: string) => void;
}

export default function TermsOfService({ onNavigate }: TermsOfServiceProps) {
  return (
    <>
      <SEO
        title="Terms of Service - Niko Free"
        description="Read the Terms and Conditions governing your use of the Niko Free platform, including user responsibilities, payment terms, and privacy policies."
        keywords="terms of service, terms and conditions, user agreement, niko free terms, legal agreement, platform rules"
        url="https://niko-free.com/terms"
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
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Terms of Service</h1>
                <p className="text-white/80 mt-2">Last Updated: December 5, 2025</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Introduction */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 mb-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Welcome to <strong>NIKO FREE</strong>. These Terms and Conditions ("Terms") govern your access to and use of the NIKO FREE website (the "Website"), including all content, features, tools, and services offered. By accessing or using the Website, you agree to be bound by these Terms. If you do not agree, you must discontinue use immediately.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {/* 1. Acceptance of Terms */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    By accessing or using the Website, you confirm that you are at least 18 years old or have the legal capacity to enter these Terms. If you access the Website on behalf of an organization, you represent that you are authorized to bind that organization to these Terms.
                  </p>
                </div>
              </div>
            </section>

            {/* 2. Changes to Terms */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Changes to Terms</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We reserve the right to modify, update, or replace these Terms at any time. Changes will be effective immediately once posted on the Website. Your continued use after such changes constitutes acceptance of the revised Terms.
              </p>
            </section>

            {/* 3. Website Access */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Website Access and Availability</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We strive to ensure the Website is accessible at all times. However, we do not guarantee uninterrupted, error-free, or secure operation. We may suspend, withdraw, or restrict access to the Website for maintenance, updates, or technical reasons.
              </p>
            </section>

            {/* 4. User Accounts */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. User Accounts</h2>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">4.1 Account Creation</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    To access certain features, you may be required to create an account. You agree to provide accurate and complete information during registration and to keep your account information updated. All personal data is processed in accordance with the Data Protection Act (2019).
                  </p>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">4.2 Account Security</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    You are responsible for maintaining the confidentiality of your login credentials and for all activities occurring under your account. Notify us immediately if you suspect unauthorized access.
                  </p>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">4.3 Termination of Account</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    We may suspend or delete your account at our discretion if you violate these Terms or engage in suspicious or fraudulent behaviour.
                  </p>
                </div>
              </div>
            </section>

            {/* 5. User Responsibilities */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. User Responsibilities</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    You agree to use the Website lawfully and ethically. You may NOT:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                    <li>Use the Website for unlawful purposes.</li>
                    <li>Copy, modify, distribute, or sell any content without permission.</li>
                    <li>Upload or transmit harmful code, viruses, or malicious software.</li>
                    <li>Attempt to gain unauthorized access to the Website's systems.</li>
                    <li>Harass, exploit, or harm other users.</li>
                  </ul>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                    Failure to comply may result in account termination or legal action.
                  </p>
                </div>
              </div>
            </section>

            {/* 6. Content Ownership */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Content Ownership and Use</h2>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">6.1 Website Content</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                All content on the Website—such as text, graphics, logos, images, and software—is owned by NIKO FREE or its licensors and is protected by intellectual property laws.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">6.2 User-Generated Content</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                By posting or submitting content to the Website, you grant NIKO FREE a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, publish, and distribute such content in connection with the Website. You confirm that your content does not infringe any third-party rights.
              </p>
            </section>

            {/* 7. Prohibited Content */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Prohibited Content</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                You may not upload, post, or share content that is:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Illegal, harmful, or abusive.</li>
                <li>Pornographic, violent, or hateful.</li>
                <li>Misleading or fraudulent.</li>
                <li>In violation of copyrights, trademarks, or privacy rights.</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                We reserve the right to remove any content that violates these Terms.
              </p>
            </section>

            {/* 8. Privacy Policy */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Privacy Policy</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                By using the Website, you consent to the collection and processing of your personal data as described in our Privacy Policy. We take reasonable steps to protect your information but cannot guarantee absolute security.
              </p>
            </section>

            {/* 9. Payment Terms */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Payment Terms</h2>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">9.1 Fees and Billing</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    Certain features or services offered on the Website may require payment. All fees are clearly stated prior to purchase and must be paid using approved payment methods.
                  </p>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">9.2 Commission Terms</h3>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      For every ticket sold through the NIKO FREE platform, a <strong>7% commission fee</strong> is automatically deducted and retained by NIKO FREE as a service charge. This commission applies to all ticket categories, including but not limited to event tickets, travel tickets, activity reservations, and promotional offers.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
                      The partner (event organizer, vendor, or service provider) acknowledges and agrees that the 7% commission is non-negotiable and is automatically withheld from the total selling price before payout.
                    </p>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">9.3 Partner Payouts</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    Payouts to partners will be processed according to the payout schedule provided in the partner dashboard. NIKO FREE shall not be held responsible for delays caused by banks, third-party payment processors, or incorrect payout information provided by the partner.
                  </p>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">9.4 Refund Policy</h3>
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                      <strong>Refunds are strictly and solely an agreement between the Ticket Buyer and the Partner (Event Organizer, Vendor, or Service Provider).</strong>
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                      NIKO FREE is only a medium of transaction and does not issue refunds on behalf of partners. Any refund requests, disputes, or follow-ups must be handled directly between the buyer and the partner.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                      The buyer acknowledges that NIKO FREE:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4 mb-3">
                      <li>Does not guarantee refunds.</li>
                      <li>Does not intervene in refund negotiations.</li>
                      <li>Does not mediate disputes related to dissatisfaction, event cancellations, or service quality.</li>
                    </ul>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      Partners are responsible for clearly communicating their refund policy to customers. Failure to do so may lead to legal or reputational consequences, for which NIKO FREE will not be liable.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 10-18. Remaining Sections */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Third-Party Links and Services</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                The Website may contain links to third-party websites or services not owned or controlled by NIKO FREE. We are not responsible for their content, policies, or practices.
              </p>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">11. Disclaimer of Warranties</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                The Website is provided "as is" and "as available" without warranties of any kind, express or implied. We do not guarantee that:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>The Website will meet your expectations.</li>
                <li>The content is accurate, complete, or updated.</li>
                <li>The Website will be free of errors, malware, or interruptions.</li>
              </ul>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">12. Limitation of Liability</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                To the fullest extent permitted by law, NIKO FREE will NOT be liable for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4 mb-4">
                <li>Any direct or indirect damages.</li>
                <li>Loss of profits, data, or goodwill.</li>
                <li>Issues arising from unauthorized access to your account.</li>
                <li>Errors, delays, or service interruptions.</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Your sole remedy is to stop using the Website.
              </p>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">13. Indemnification</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                You agree to indemnify and hold harmless NIKO FREE from any claims, liabilities, damages, losses, or expenses arising from:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Your use of the Website.</li>
                <li>Your violation of these Terms.</li>
                <li>Your infringement of any third-party rights.</li>
              </ul>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">14. Termination</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We may suspend or terminate your access to the Website at any time without prior notice if you violate these Terms or engage in harmful activity.
              </p>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Scale className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">15. Governing Law and Dispute Resolution</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    These Terms shall be governed by the laws of Kenya. Any disputes will be resolved through negotiation, and if unresolved, through the courts of the stated jurisdiction.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">16. Severability</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                If any provision of these Terms is found invalid, unlawful, or unenforceable, the remaining provisions will continue in full force and effect.
              </p>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">17. Entire Agreement</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                These Terms constitute the entire agreement between you and NIKO FREE regarding the use of the Website and supersede any prior agreements.
              </p>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">18. Contact Information</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                If you have questions or concerns regarding these Terms, please contact us at:
              </p>
              <a 
                href="mailto:support@niko-free.com" 
                className="text-[#27aae2] hover:underline font-semibold"
              >
                support@niko-free.com
              </a>
            </section>

            {/* Acknowledgement */}
            <section className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">ACKNOWLEDGEMENT</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                By continuing to use the NIKO FREE Website, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4 mb-4">
                <li>The Terms and Conditions</li>
                <li>The Privacy Policy</li>
                <li>The Cookie Policy</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-semibold">
                These documents collectively constitute a legally binding agreement between you and NIKO FREE.
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
