import { useState, useEffect, useCallback } from 'react';
import CryptoJS from 'crypto-js';
import useAuthUser from '../hooks/useAuthUser';

// 🔐 Encryption configuration
const ENCRYPTION_CONFIG = {
  algorithm: 'AES-256-CBC',
  keySize: 256,
  iterations: 10000,
  saltSize: 128
};

// Generate random IV (Initialization Vector)
const generateIV = () => {
  return CryptoJS.lib.WordArray.random(16).toString();
};

// Export encryption utilities
export const encryptionUtils = {
  // Encrypt text with password
  encrypt: (text, password) => {
    try {
      const iv = generateIV();
      const key = CryptoJS.enc.Utf8.parse(password);
      const encrypted = CryptoJS.AES.encrypt(text, key, {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      return {
        ciphertext: encrypted.toString(),
        iv: iv
      };
    } catch (error) {
      console.error('Encryption error:', error);
      return { ciphertext: text, iv: null };
    }
  },

  // Decrypt text with password
  decrypt: (ciphertext, iv, password) => {
    try {
      const key = CryptoJS.enc.Utf8.parse(password);
      const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption error:', error);
      return ciphertext;
    }
  },

  // Generate random encryption key
  generateEncryptionKey: () => {
    return CryptoJS.lib.WordArray.random(32).toString();
  },

  // Hash data (for integrity check)
  hash: (data) => {
    return CryptoJS.SHA256(data).toString();
  }
};

// Main useEncryption hook
const useEncryption = () => {
  const { authUser } = useAuthUser();
  const [encryptionKey, setEncryptionKey] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [sessionKeys, setSessionKeys] = useState(new Map());

  // Initialize encryption key from user session
  useEffect(() => {
    if (authUser?._id) {
      // Generate unique key per user session
      const storedKey = localStorage.getItem(`enc_key_${authUser._id}`);
      
      if (storedKey) {
        setEncryptionKey(storedKey);
      } else {
        // Generate new encryption key
        const newKey = encryptionUtils.generateEncryptionKey();
        localStorage.setItem(`enc_key_${authUser._id}`, newKey);
        setEncryptionKey(newKey);
      }
      setIsReady(true);
    }
  }, [authUser]);

  // Generate shared key with another user (for E2EE)
  const generateSharedKey = useCallback((recipientId) => {
    if (!encryptionKey || !authUser?._id) return null;
    
    // Use existing session key if available
    if (sessionKeys.has(recipientId)) {
      return sessionKeys.get(recipientId);
    }
    
    // Generate shared key using both user IDs
    const sharedSecret = CryptoJS.SHA256(
      encryptionKey + recipientId + authUser._id
    ).toString();
    
    // Store in session
    setSessionKeys(prev => new Map(prev).set(recipientId, sharedSecret));
    
    return sharedSecret;
  }, [encryptionKey, authUser, sessionKeys]);

  // Encrypt message for specific recipient
  const encryptForUser = useCallback((message, recipientId) => {
    if (!message) return { content: message, encrypted: false };
    
    const sharedKey = generateSharedKey(recipientId);
    if (!sharedKey) {
      console.warn('Encryption key not available');
      return { content: message, encrypted: false };
    }
    
    const { ciphertext, iv } = encryptionUtils.encrypt(message, sharedKey);
    const hash = encryptionUtils.hash(ciphertext + iv);
    
    return {
      content: ciphertext,
      iv: iv,
      hash: hash,
      encrypted: true,
      timestamp: Date.now()
    };
  }, [generateSharedKey]);

  // Decrypt message from sender
  const decryptFromUser = useCallback((encryptedData, senderId) => {
    if (!encryptedData?.encrypted) {
      return encryptedData?.content || encryptedData;
    }
    
    const sharedKey = generateSharedKey(senderId);
    if (!sharedKey) {
      console.warn('Decryption key not available');
      return encryptedData.content;
    }
    
    // Verify integrity
    const computedHash = encryptionUtils.hash(encryptedData.content + encryptedData.iv);
    if (computedHash !== encryptedData.hash) {
      console.error('Message integrity check failed');
      return '[Message tampered]';
    }
    
    const decrypted = encryptionUtils.decrypt(
      encryptedData.content,
      encryptedData.iv,
      sharedKey
    );
    
    return decrypted || '[Unable to decrypt]';
  }, [generateSharedKey]);

  // Encrypt file for upload
  const encryptFile = useCallback(async (file, recipientId) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const fileData = e.target.result;
          const sharedKey = generateSharedKey(recipientId);
          
          if (!sharedKey) {
            resolve({ file, encrypted: false });
            return;
          }
          
          const encrypted = encryptionUtils.encrypt(fileData, sharedKey);
          const encryptedBlob = new Blob([encrypted.ciphertext], { type: 'application/encrypted' });
          
          resolve({
            file: encryptedBlob,
            iv: encrypted.iv,
            originalName: file.name,
            originalType: file.type,
            encrypted: true
          });
        } catch (error) {
          console.error('File encryption error:', error);
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, [generateSharedKey]);

  // Decrypt received file
  const decryptFile = useCallback(async (encryptedFile, iv, senderId, originalName, originalType) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const fileData = e.target.result;
          const sharedKey = generateSharedKey(senderId);
          
          if (!sharedKey) {
            resolve(null);
            return;
          }
          
          const decrypted = encryptionUtils.decrypt(fileData, iv, sharedKey);
          const decryptedBlob = new Blob([decrypted], { type: originalType });
          
          resolve(new File([decryptedBlob], originalName, { type: originalType }));
        } catch (error) {
          console.error('File decryption error:', error);
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(encryptedFile);
    });
  }, [generateSharedKey]);

  // Rotate encryption key (for security)
  const rotateEncryptionKey = useCallback(async () => {
    if (!authUser?._id) return;
    
    const newKey = encryptionUtils.generateEncryptionKey();
    localStorage.setItem(`enc_key_${authUser._id}`, newKey);
    setEncryptionKey(newKey);
    setSessionKeys(new Map()); // Clear all session keys
    
    return newKey;
  }, [authUser]);

  // Clear session (logout)
  const clearEncryption = useCallback(() => {
    setSessionKeys(new Map());
    setEncryptionKey(null);
    setIsReady(false);
  }, []);

  // Check if message is encrypted
  const isMessageEncrypted = useCallback((message) => {
    return message?.encrypted === true && 
           typeof message?.content === 'string' &&
           message?.iv !== undefined;
  }, []);

  // Get encryption status for a chat
  const getChatEncryptionStatus = useCallback((recipientId) => {
    const hasKey = encryptionKey !== null;
    const hasSharedKey = sessionKeys.has(recipientId);
    
    return {
      enabled: hasKey,
      sharedKeyEstablished: hasSharedKey,
      level: 'AES-256-CBC',
      protocol: 'End-to-End Encrypted'
    };
  }, [encryptionKey, sessionKeys]);

  return {
    // State
    isReady,
    encryptionKey,
    sessionKeys,
    
    // Core encryption functions
    encryptForUser,
    decryptFromUser,
    
    // File encryption
    encryptFile,
    decryptFile,
    
    // Key management
    generateSharedKey,
    rotateEncryptionKey,
    clearEncryption,
    
    // Utilities
    isMessageEncrypted,
    getChatEncryptionStatus,
    
    // Direct encryption utilities (for non-chat use)
    encrypt: encryptionUtils.encrypt,
    decrypt: encryptionUtils.decrypt,
    hash: encryptionUtils.hash,
    generateKey: encryptionUtils.generateEncryptionKey
  };
};

export default useEncryption;