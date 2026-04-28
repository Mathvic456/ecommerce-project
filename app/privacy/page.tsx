import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { MobileNav } from "@/components/mobile-nav"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Matthew's Mart",
  description: "Learn how Matthew's Mart collects, uses, and protects your personal information.",
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        {/* Header */}
        <div className="mb-12">
          <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-4">Legal</p>
          <h1 className="text-4xl md:text-5xl font-serif mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: January 2025</p>
        </div>

        {/* Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <section className="mb-10">
            <h2 className="text-2xl font-serif mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Matthew's Mart ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              By using our website and services, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-serif mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-medium mt-6 mb-3">Personal Information</h3>
            <p className="text-muted-foreground leading-relaxed">
              We may collect personal information that you voluntarily provide to us when you:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-3 space-y-2">
              <li>Create an account</li>
              <li>Place an order</li>
              <li>Subscribe to our newsletter</li>
              <li>Contact us for support</li>
              <li>Participate in promotions or surveys</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              This information may include:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-3 space-y-2">
              <li>Name and contact information (email, phone number, address)</li>
              <li>Billing and shipping addresses</li>
              <li>Payment information (processed securely through our payment providers)</li>
              <li>Account credentials</li>
              <li>Order history and preferences</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">Automatically Collected Information</h3>
            <p className="text-muted-foreground leading-relaxed">
              When you visit our website, we automatically collect certain information, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-3 space-y-2">
              <li>IP address and device information</li>
              <li>Browser type and version</li>
              <li>Pages visited and time spent on pages</li>
              <li>Referring website addresses</li>
              <li>Geographic location (country/region)</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-serif mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-3 space-y-2">
              <li>Process and fulfill your orders</li>
              <li>Communicate with you about your orders and account</li>
              <li>Send promotional emails and newsletters (with your consent)</li>
              <li>Improve our website and services</li>
              <li>Personalize your shopping experience</li>
              <li>Prevent fraud and enhance security</li>
              <li>Comply with legal obligations</li>
              <li>Respond to customer service requests</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-serif mb-4">4. Information Sharing</h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not sell, trade, or rent your personal information to third parties. We may share your information with:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-3 space-y-2">
              <li><strong>Service Providers:</strong> Third parties who help us operate our business (payment processors, shipping companies, email services)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              All third-party service providers are contractually obligated to keep your information confidential and use it only for the purposes we specify.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-serif mb-4">5. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-3 space-y-2">
              <li>SSL/TLS encryption for data transmission</li>
              <li>Secure data storage with encryption at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication measures</li>
              <li>Secure payment processing through trusted providers (Paystack, Stripe)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              However, no method of transmission over the Internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-serif mb-4">6. Cookies and Tracking Technologies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and similar tracking technologies to enhance your experience on our website. These include:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-3 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site</li>
              <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              You can control cookies through your browser settings. However, disabling cookies may affect your ability to use certain features of our website.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-serif mb-4">7. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-3 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal information</li>
              <li><strong>Correction:</strong> Request correction of inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Request transfer of your data to another service</li>
              <li><strong>Objection:</strong> Object to certain processing of your information</li>
              <li><strong>Withdrawal of Consent:</strong> Withdraw consent where processing is based on consent</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              To exercise these rights, please contact us using the information provided below.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-serif mb-4">8. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your personal information for as long as necessary to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-3 space-y-2">
              <li>Provide our services to you</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes</li>
              <li>Enforce our agreements</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              When your information is no longer needed, we will securely delete or anonymize it.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-serif mb-4">9. Third-Party Links</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our website may contain links to third-party websites. We are not responsible for the privacy practices of these sites. We encourage you to read the privacy policies of any third-party sites you visit.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-serif mb-4">10. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our services are not intended for children under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-serif mb-4">11. International Data Transfers</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this privacy policy.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-serif mb-4">12. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-serif mb-4">13. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="mt-4 p-6 bg-secondary rounded-lg">
              <p className="font-medium">Matthew's Mart</p>
              <p className="text-muted-foreground mt-2">Email: privacy@matthewsmart.com</p>
              <p className="text-muted-foreground">Phone: +234 (0) 123 456 7890</p>
              <p className="text-muted-foreground">Address: Lagos, Nigeria</p>
            </div>
            <p className="text-muted-foreground leading-relaxed mt-4">
              You can also use our <a href="/contact" className="text-primary underline hover:no-underline">contact form</a> to reach us.
            </p>
          </section>
        </div>
      </div>

      <Footer />
      <MobileNav />

      {/* Spacer for mobile nav */}
      <div className="h-16 lg:hidden" />
    </main>
  )
}
