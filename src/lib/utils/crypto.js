import CryptoJS from 'crypto-js'
import { SECRET_KEY } from '../../config/constants'

export function encryptTargetWord(word, secretKey = SECRET_KEY) {
  return CryptoJS.AES.encrypt(word, secretKey).toString()
}

export function decryptTargetWord(encryptedWord, secretKey = SECRET_KEY) {
  const bytes = CryptoJS.AES.decrypt(encryptedWord, secretKey)
  return bytes.toString(CryptoJS.enc.Utf8)
}
