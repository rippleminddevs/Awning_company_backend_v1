import { ContentService } from '../modules/content/contentService'

export class ContentSeeder {
  private contentService: ContentService

  constructor() {
    this.contentService = new ContentService()
  }

  public async seed(): Promise<void> {
    console.log('🔄 Checking if content needs to be seeded...')

    try {
      // Seed About section
      await this.seedAboutSection()

      // Seed Privacy Policy
      await this.seedPrivacyPolicy()

      // Seed Terms & Conditions
      await this.seedTermsAndConditions()

      // Seed FAQs
      await this.seedFAQs()

      console.log('✅ Content seeded successfully')
    } catch (error) {
      console.error('❌ Error seeding content:', error)
    }
  }

  private async seedAboutSection(): Promise<void> {
    const aboutContent = await this.contentService.getAboutContent()

    if (!aboutContent) {
      const aboutData = {
        type: 'about' as const,
        title: 'About Awning Company',
        content: this.formatAboutContent(),
      }

      await this.contentService.updateAboutSection(aboutData)
      console.log('  📄 About section seeded')
    } else {
      console.log('  📄 About section already exists, skipping')
    }
  }

  private async seedPrivacyPolicy(): Promise<void> {
    const privacyContent = await this.contentService.getPrivacyContent()

    if (!privacyContent) {
      const privacyData = {
        type: 'privacy' as const,
        title: 'Privacy Policy',
        content: this.formatPrivacyContent(),
      }

      await this.contentService.updatePrivacySection(privacyData)
      console.log('  🔒 Privacy Policy seeded')
    } else {
      console.log('  🔒 Privacy Policy already exists, skipping')
    }
  }

  private async seedTermsAndConditions(): Promise<void> {
    const termsContent = await this.contentService.getTermsContent()

    if (!termsContent) {
      const termsData = {
        type: 'terms' as const,
        title: 'Terms & Conditions',
        content: this.formatTermsContent(),
      }

      await this.contentService.updateTermsSection(termsData)
      console.log('  📜 Terms & Conditions seeded')
    } else {
      console.log('  📜 Terms & Conditions already exists, skipping')
    }
  }

  private async seedFAQs(): Promise<void> {
    // Check if FAQs exist by querying the model directly
    const faqList = await this.contentService.getAllFAQsForAdmin({ page: 1, limit: 1 })

    if (faqList.total === 0) {
      // Create all FAQs from infoApp.md
      const faqData = [
        {
          type: 'faq' as const,
          question: 'What is Awning Company?',
          answer:
            'Awning Company is a B2B SaaS platform designed for awning manufacturing and installation businesses. It manages the complete customer lifecycle from lead generation to installation.',
          order: 1,
        },
        {
          type: 'faq' as const,
          question: 'How do I create a customer?',
          answer:
            'Navigate to the Customers section, click "Add New Customer", and fill in the required information. You can categorize customers as Residential, Commercial, or Contractor.',
          order: 2,
        },
        {
          type: 'faq' as const,
          question: 'Can I schedule appointments for customers?',
          answer:
            'Yes! Use the Appointment module to schedule visits, assign sales team members, and set reminders. You can also track appointment status and history.',
          order: 3,
        },
        {
          type: 'faq' as const,
          question: 'How do I generate quotes for customers?',
          answer:
            'Create a quote by selecting the customer, adding products, and configuring specifications. The system supports complex pricing calculations with customizable terms.',
          order: 4,
        },
        {
          type: 'faq' as const,
          question: 'Can I track order progress?',
          answer:
            'Yes. Once a quote is approved and becomes an order, you can track it through manufacturing and installation workflows. All status updates are tracked in real-time.',
          order: 5,
        },
        {
          type: 'faq' as const,
          question: 'What customer types are supported?',
          answer:
            'The system supports three customer types: Residential (homeowners), Commercial (businesses), and Contractors (trade professionals). Each type has tailored workflows.',
          order: 6,
        },
        {
          type: 'faq' as const,
          question: 'How do I view sales analytics?',
          answer:
            'Visit the Sales module to view revenue tracking, salesperson performance, order statistics, and other business intelligence metrics.',
          order: 7,
        },
        {
          type: 'faq' as const,
          question: 'How do I contact support?',
          answer:
            'Email us at support@awningcompany.com for technical help or account-related queries.',
          order: 8,
        },
      ]

      for (const faq of faqData) {
        await this.contentService.createFAQ(faq)
      }

      console.log('  ❓ FAQs seeded (8 questions)')
    } else {
      console.log('  ❓ FAQs already exist, skipping')
    }
  }

  private formatAboutContent(): string {
    return `<h1>About Awning Company</h1>
<p>Awning Company is a comprehensive B2B SaaS platform designed specifically for awning manufacturing and installation businesses.</p>
<p>Our platform manages the complete customer lifecycle from lead generation through to final installation and ongoing customer relationship management.</p>

<h2>With Awning Company, businesses can:</h2>
<ul>
  <li>Manage customers across Residential, Commercial, and Contractor categories</li>
  <li>Schedule appointments and assign sales team members</li>
  <li>Generate complex quotes with dynamic pricing and product customization</li>
  <li>Track orders through manufacturing and installation workflows</li>
  <li>Monitor sales performance and business analytics</li>
  <li>Communicate in real-time with team members and customers</li>
</ul>

<h2>Key Features:</h2>
<ul>
  <li><strong>CRM System:</strong> Complete customer relationship management with lead tracking</li>
  <li><strong>Appointment Scheduling:</strong> Efficient calendar management for sales visits</li>
  <li><strong>Quote Engine:</strong> Advanced pricing calculations for awning specifications</li>
  <li><strong>Order Management:</strong> Manufacturing and installation workflow tracking</li>
  <li><strong>Sales Analytics:</strong> Revenue tracking and performance metrics</li>
  <li><strong>Real-time Communication:</strong> Chat and notification system</li>
</ul>

<p><strong>Our mission:</strong> Empower awning businesses with modern tools to streamline operations, improve customer experience, and grow their business efficiently.</p>`
  }

  private formatPrivacyContent(): string {
    return `<h1>Privacy Policy</h1>

<h2>1. Introduction</h2>
<p>Awning Company (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) respects your privacy. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our app or website (&quot;Services&quot;).</p>
<p>By using Awning Company, you agree to the terms of this Privacy Policy.</p>

<h2>2. Information We Collect</h2>
<p>We may collect the following types of information:</p>

<h3>a. Personal Information:</h3>
<ul>
  <li>Name, email address, phone number, and profile photo</li>
  <li>Customer information, quotes, and order details</li>
  <li>Payment details (if purchasing premium features)</li>
</ul>

<h3>b. App Usage Data:</h3>
<ul>
  <li>Login activity and session duration</li>
  <li>Device information, IP address, and browser type</li>
  <li>Pages visited, actions taken, and interaction logs</li>
</ul>

<h3>c. Business Data:</h3>
<ul>
  <li>Customer records and communication history</li>
  <li>Quote and order information</li>
  <li>Appointment schedules and sales data</li>
</ul>

<h2>3. How We Use Your Information</h2>
<p>We use collected information to:</p>
<ul>
  <li>Provide CRM and business management services</li>
  <li>Facilitate appointment scheduling and quote generation</li>
  <li>Process orders and track installation progress</li>
  <li>Improve app performance and user experience</li>
  <li>Communicate updates, offers, or notifications</li>
  <li>Process payments for premium services</li>
</ul>

<h2>4. Data Sharing and Disclosure</h2>
<p>We do not sell your personal data.</p>
<p>We may share information only with:</p>
<ul>
  <li>Authorized team members within your organization</li>
  <li>Payment processors (for secure transactions)</li>
  <li>Service providers assisting in app functionality</li>
  <li>Authorities, if required by law</li>
</ul>

<h2>5. Data Storage and Security</h2>
<p>Your data is stored securely using encryption and restricted access measures.</p>
<p>We take all reasonable steps to prevent unauthorized access, alteration, disclosure, or destruction of your data.</p>

<h2>6. Your Rights</h2>
<p>You can:</p>
<ul>
  <li>Access and update your profile information</li>
  <li>Request deletion of your account and associated data</li>
  <li>Opt out of promotional emails</li>
</ul>
<p>To exercise your rights, contact us at <a href="mailto:privacy@awningcompany.com">privacy@awningcompany.com</a>.</p>

<h2>7. Business Data Ownership</h2>
<p>Your business data belongs to you. We do not claim ownership of customer information, quotes, orders, or other business data you input into the system.</p>

<h2>8. Updates to This Policy</h2>
<p>We may update this Privacy Policy from time to time. Changes will be posted within the app with the updated date.</p>

<h2>9. Contact Us</h2>
<p>For questions or concerns about this Privacy Policy, contact us at:</p>
<p>📧 <a href="mailto:privacy@awningcompany.com">privacy@awningcompany.com</a></p>`
  }

  private formatTermsContent(): string {
    return `<h1>Terms & Conditions</h1>

<h2>1. Acceptance of Terms</h2>
<p>By accessing or using Awning Company (&quot;App&quot;, &quot;Service&quot;), you agree to be bound by these Terms & Conditions.</p>
<p>If you do not agree, please do not use our services.</p>

<h2>2. Description of Service</h2>
<p>Awning Company is a B2B SaaS platform that enables awning businesses to manage customers, appointments, quotes, orders, and installations.</p>

<h2>3. User Responsibilities</h2>
<p>Users agree to:</p>
<ul>
  <li>Provide accurate and truthful information</li>
  <li>Use the app only for lawful business purposes</li>
  <li>Refrain from uploading offensive, misleading, or illegal content</li>
  <li>Respect the privacy and rights of other users</li>
  <li>Protect customer data in accordance with privacy laws</li>
</ul>
<p>Awning Company reserves the right to suspend or terminate accounts that violate these terms.</p>

<h2>4. Account Security</h2>
<p>Users are responsible for maintaining the confidentiality of their login credentials.</p>
<p>Any activity under your account is your responsibility.</p>

<h2>5. Payments & Subscriptions</h2>
<p>Some features are available only through paid subscriptions.</p>
<p>All payments are processed securely. Subscription fees are non-refundable except as required by law.</p>

<h2>6. Intellectual Property</h2>
<p>All app content, including text, logos, designs, and software, is owned by Awning Company or its licensors.</p>
<p>Users may not copy, distribute, or modify Awning Company materials without permission.</p>

<h2>7. Data Ownership & Backup</h2>
<p>Your business data remains your property. You are responsible for backing up your data.</p>
<p>We implement reasonable backup procedures but cannot guarantee data recovery in all scenarios.</p>

<h2>8. Limitation of Liability</h2>
<p>Awning Company is provided &quot;as is.&quot;</p>
<p>We are not responsible for:</p>
<ul>
  <li>Business decisions made using the platform</li>
  <li>Accuracy of quotes or order information</li>
  <li>Technical issues, data loss, or system downtime</li>
  <li>Customer disputes or business relationships</li>
</ul>

<h2>9. Termination</h2>
<p>We may suspend or terminate accounts at our discretion if terms are violated or misuse is detected.</p>

<h2>10. Governing Law</h2>
<p>These Terms are governed by the laws of Pakistan.</p>
<p>Any disputes will be resolved under the jurisdiction of the courts of Pakistan.</p>

<h2>11. Contact Information</h2>
<p>For legal or account matters, contact:</p>
<p>📧 <a href="mailto:legal@awningcompany.com">legal@awningcompany.com</a></p>`
  }
}
