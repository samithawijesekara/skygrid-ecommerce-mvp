import superjson from "superjson";
import { PersistStorage } from "zustand/middleware";
import CryptoJS from "crypto-js";
import CONFIGURATIONS from "@/configurations/configurations";

// You should store this in your environment variables
const ENCRYPTION_KEY = "189c88542e834c180bd990fb32327664451d9ec9f22d1";

const zustandStorageEncryption: PersistStorage<any> = {
  getItem: (name) => {
    const str = localStorage.getItem(name);
    if (!str) return null;

    try {
      // Decrypt the data
      const bytes = CryptoJS.AES.decrypt(str, ENCRYPTION_KEY);
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

      // Parse the decrypted data
      return superjson.parse(decryptedData);
    } catch (error) {
      console.error("Error decrypting data:", error);
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      // Stringify the data first
      const stringifiedData = superjson.stringify(value);

      // Encrypt the data
      const encryptedData = CryptoJS.AES.encrypt(
        stringifiedData,
        ENCRYPTION_KEY
      ).toString();

      // Save to localStorage
      localStorage.setItem(name, encryptedData);
    } catch (error) {
      console.error("Error encrypting data:", error);
    }
  },
  removeItem: (name) => localStorage.removeItem(name),
};

export default zustandStorageEncryption;
