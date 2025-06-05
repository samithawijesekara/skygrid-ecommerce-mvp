import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const TermsAndConditions = () => {
  return (
    <div className="container mx-auto py-10 px-4 md:px-8 lg:px-16">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">
            Terms & Conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] p-4 border rounded-md">
            <p className="mb-4">
              Welcome to our website! By accessing and using our services, you
              agree to comply with the following terms and conditions.
            </p>

            <h2 className="text-xl font-semibold mt-6">
              1. Acceptance of Terms
            </h2>
            <p className="mb-4">
              By accessing this website, you agree to be bound by these Terms
              and Conditions.
            </p>

            <h2 className="text-xl font-semibold mt-6">
              2. Use of the Website
            </h2>
            <p className="mb-4">
              You agree to use this website only for lawful purposes. Any
              unauthorized use or modification of the content is prohibited.
            </p>

            <h2 className="text-xl font-semibold mt-6">
              3. Intellectual Property
            </h2>
            <p className="mb-4">
              All content, trademarks, and logos are the property of our company
              and cannot be used without prior written consent.
            </p>

            <h2 className="text-xl font-semibold mt-6">
              4. Limitation of Liability
            </h2>
            <p className="mb-4">
              We are not responsible for any direct, indirect, or consequential
              damages arising from your use of this website.
            </p>

            <h2 className="text-xl font-semibold mt-6">5. Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right to modify these Terms and Conditions at any
              time. Changes will be effective immediately upon posting.
            </p>

            <h2 className="text-xl font-semibold mt-6">6. Governing Law</h2>
            <p className="mb-4">
              These terms shall be governed by and construed in accordance with
              the laws of [Your Country].
            </p>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default TermsAndConditions;
