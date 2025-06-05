import * as SibApiV3Sdk from "@getbrevo/brevo";
import axios, { AxiosError } from "axios";
import { generateS3FileUrl } from "./aws-s3-bucket.utils";
import CONFIGURATIONS from "@/configurations/configurations";

// Loading the template from AWS
async function loadTemplate(templateName: string): Promise<string> {
  const objectKey = `emails/${templateName}.hbs`;
  const templateUrl = generateS3FileUrl(objectKey);
  try {
    const response = await axios.get(templateUrl);
    return response.data;
  } catch (error) {
    console.error("Error loading template from S3:", error);
    throw error;
  }
}

// Replace placeholders in the template content with actual values
function replaceTemplateVariables(
  templateContent: string,
  params: Record<string, any>
): string {
  Object.keys(params).forEach((key) => {
    const placeholder = `{{${key}}}`;
    const value = params[key];
    templateContent = templateContent.replace(
      new RegExp(placeholder, "g"),
      value
    );
  });

  return templateContent;
}

// Initialize TransactionalEmailsApi instance
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
function setApiKey(apiInstance: any, apiKey: string): void {
  const apiKeyObject = apiInstance.authentications["apiKey"];
  apiKeyObject.apiKey = apiKey;
}

async function sendTransactionalEmail(sendSmtpEmail: any): Promise<any> {
  try {
    const SibApiV3Sdk = await import("@getbrevo/brevo");
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    setApiKey(apiInstance, CONFIGURATIONS.MAIL_SERVICE.API_KEY);
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(
      "API called successfully. Returned data: ",
      JSON.stringify(data)
    );
  } catch (error) {
    console.error(error);
  }
}

async function createEmail(
  templateContent: string,
  params: Record<string, any>
): Promise<any> {
  try {
    const replacedContent = replaceTemplateVariables(templateContent, params);
    if (replacedContent) {
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      sendSmtpEmail.subject = params?.subject;
      sendSmtpEmail.htmlContent = replacedContent;
      sendSmtpEmail.sender = {
        name: CONFIGURATIONS.MAIL_SERVICE.FROM_NAME,
        email: CONFIGURATIONS.MAIL_SERVICE.FROM_ADDRESS,
      };
      sendSmtpEmail.to = [{ email: params?.email, name: params?.name }];
      sendSmtpEmail.replyTo = {
        email: CONFIGURATIONS.MAIL_SERVICE.REPLY_TO_ADDRESS,
        name: CONFIGURATIONS.MAIL_SERVICE.REPLY_TO_NAME,
      };
      sendSmtpEmail.headers = { "Some-Custom-Name": "unique-id-1234" };
      sendSmtpEmail.params = params;
      return sendSmtpEmail;
    }
  } catch (error) {
    console.error("Error creating email:", error);
    throw error;
  }
}

// Define email template types
enum EmailTemplate {
  WELCOME = "welcome",
  FORGOT_PASSWORD = "forgot-password",
  USER_INVITATION = "user-invitation",
  OTP = "otp",
}

// Define params interface for each template type
interface BaseEmailParams {
  email: string;
  name: string;
  subject: string;
}

interface WelcomeEmailParams extends BaseEmailParams {
  portalLink: string;
}

interface ForgotPasswordParams extends BaseEmailParams {
  resetLink: string;
}

interface UserInvitationParams extends BaseEmailParams {
  inviteRole: string;
  invitationLink: string;
}

interface OtpEmailParams extends BaseEmailParams {
  otp: string;
}

type EmailParams =
  | WelcomeEmailParams
  | ForgotPasswordParams
  | UserInvitationParams
  | OtpEmailParams;

// Generic email sending function
export async function sendEmail<T extends EmailParams>(
  template: EmailTemplate,
  params: T
): Promise<void> {
  try {
    if (!params.email || !params.name) {
      throw new Error("Missing required parameters");
    }
    setApiKey(apiInstance, CONFIGURATIONS.MAIL_SERVICE.API_KEY);
    const templateContent = await loadTemplate(template);
    const sendSmtpEmail = await createEmail(templateContent, params);
    await sendTransactionalEmail(sendSmtpEmail);
  } catch (error) {
    console.error(`Error sending ${template} email:`, error);
    throw error;
  }
}

// Helper functions to create specific email types
export async function sendWelcomeEmail(
  email: string,
  name: string,
  portalLink: string
): Promise<void> {
  await sendEmail<WelcomeEmailParams>(EmailTemplate.WELCOME, {
    email,
    name,
    subject: "Welcome to Our Platform",
    portalLink,
  });
}

export async function sendForgotPasswordEmail(
  email: string,
  name: string,
  resetLink: string
): Promise<void> {
  await sendEmail<ForgotPasswordParams>(EmailTemplate.FORGOT_PASSWORD, {
    email,
    name,
    subject: "Reset Your Password",
    resetLink,
  });
}

export async function sendUserInvitationEmail(
  email: string,
  name: string,
  inviteRole: string,
  invitationLink: string
): Promise<void> {
  await sendEmail<UserInvitationParams>(EmailTemplate.USER_INVITATION, {
    email,
    name,
    subject: "You're Invited!",
    inviteRole,
    invitationLink,
  });
}

export async function sendOtpEmail(
  email: string,
  name: string,
  otp: string
): Promise<void> {
  await sendEmail<OtpEmailParams>(EmailTemplate.OTP, {
    email,
    name,
    subject: "Your OTP Code",
    otp,
  });
}
