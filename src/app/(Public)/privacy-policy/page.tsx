"use client";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto max-w-4xl py-16 px-6 lg:px-12">
      <h1 className="text-3xl font-bold mb-6 text-center">Privacy Policy</h1>
      <Card>
        <CardContent className="p-6 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
            <p className="text-muted-foreground">
              Welcome to our Privacy Policy. Your privacy is important to us.
              This policy explains how we collect, use, and protect your
              information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              2. Information We Collect
            </h2>
            <p className="text-muted-foreground">
              We may collect personal details such as your name, email, and
              contact information when you use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              3. How We Use Your Information
            </h2>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>To provide and improve our services</li>
              <li>To communicate important updates</li>
              <li>To enhance user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Data Security</h2>
            <p className="text-muted-foreground">
              We implement industry-standard security measures to protect your
              data. However, no online service is completely secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              5. Third-Party Services
            </h2>
            <p className="text-muted-foreground">
              We may share your data with trusted third-party services for
              analytics and functionality improvements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Your Rights</h2>
            <p className="text-muted-foreground">
              You have the right to access, modify, or delete your personal
              data. Contact us for any requests.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              7. Updates to This Policy
            </h2>
            <p className="text-muted-foreground">
              We may update this policy periodically. Please review it regularly
              for changes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">8. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about this Privacy Policy, please
              contact us at support@example.com.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
