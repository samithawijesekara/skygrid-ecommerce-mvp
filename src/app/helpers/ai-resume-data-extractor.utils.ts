import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import CONFIGURATIONS from "@/configurations/configurations";

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(
  CONFIGURATIONS.LLM.GEMINI_API_KEY as string
);

// Function to extract text from PDF buffer
export async function extractDataFromPDF(resumeText: string) {
  try {
    const prompt = `
        Extract the following details from the CV/resume text:
        - Candidate Name
        - Phone Number
        - Email
        - Location
        - Total Experience
        - Key Skills
        - Current Employment Details
        - Previous Experience Details
        - Education
        - Languages
        - Certifications
        - Profile Summary (limit to a maximum of 400 characters)
        - Projects
        - Resume Summary (a full summary of the extracted data)
        For the education details, include the type of qualification (UG for undergraduate, PG for postgraduate, PPG for post-postgraduate, N/A if not applicable) based on the degree information.
        Use this JSON schema:
        {
            "type": "object",
            "properties": {
                "candidateName": { "type": "string" },
                "phoneNumber": { "type": "string" },
                "email": { "type": "string" },
                "location": { "type": "string" },
                "totalExperience": { "type": "number" },
                "keySkills": { "type": "array", "items": { "type": "string" } },
                "currentEmployment": {
                    "type": "object",
                    "properties": {
                        "designation": { "type": "string" },
                        "companyName": { "type": "string" },
                        "duration": { "type": "string" },
                        "projectsDetails": { "type": "array", "items": { "type": "string" } },
                        "responsibilities": { "type": "array", "items": { "type": "string" } }
                    }
                },
                "previousExperience": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "designation": { "type": "string" },
                            "companyName": { "type": "string" },
                            "duration": { "type": "string" },
                            "projectsDetails": { "type": "array", "items": { "type": "string" } },
                            "responsibilities": { "type": "array", "items": { "type": "string" } }
                        }
                    }
                },
                "education": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "degree": { "type": "string" },
                            "institution": { "type": "string" },
                            "year": { "type": "number" },
                            "type": { "type": "string" }
                        }
                    }
                },
                "languages": { "type": "array", "items": { "type": "string" } },
                "certifications": { "type": "array", "items": { "type": "string" } },
                "profileSummary": { 
                    "type": "string", 
                    "maxLength": 400 
                },
                "projects": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "name": { "type": "string" },
                            "description": { "type": "string" },
                            "year": { "type": "string" },
                            "link": { "type": "string" }
                        }
                    }
                },
                "resumeSummary": { "type": "string" }
            }
        }
        CV/Resume Text: ${resumeText}
    `;

    // Assuming `genAI` is already initialized and configured correctly
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      // Set the `responseMimeType` to output JSON
      generationConfig: { responseMimeType: "application/json" },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    // // Log the raw response for debugging
    // console.log("Raw Response:", response);

    // Parse the JSON string from the response
    const jsonOutput = JSON.parse(response);
    // console.log("JSON OUTPUT:", jsonOutput);

    return jsonOutput;

    return;
  } catch (error) {
    console.error("Error extracting data from PDF:", error);
  }
}
