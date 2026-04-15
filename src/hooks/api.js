/**
 * @author Ryan Balieiro
 * @date 2025-05-10
 * @description This hook provides methods to interact with external APIs.
 */

import emailjs from "@emailjs/browser"
import {useConstants} from "/src/hooks/constants.js"
import {useUtils} from "/src/hooks/utils.js"
import {insertVisitorLog} from "/src/lib/supabase.js"

const constants = useConstants()
const utils = useUtils()

export const useApi = () => {
    return {
        validators,
        handlers,
        analytics
    }
}

const validators = {
     /**

     * @param {String} name

     * @param {String} email

     * @param {String} subject

     * @param {String} message

     */
    validateEmailRequest: (name, email, subject, message) => {
        // 定義最小字元長度 (中英文通用)
        // 建議設為 5，因為 "你好嗎" 太短，"我想詢問" 剛好 4 個字
        const minCharLength = 5; 

        const validations = [
            { 
                errorCode: constants.ErrorCodes.VALIDATION_EMPTY_FIELDS, 
                errorCondition: !name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim() 
            },
            { 
                errorCode: constants.ErrorCodes.VALIDATION_EMAIL, 
                errorCondition: !utils.validation.validateEmail(email) 
            },
            { 
                // 修改這裡：改用長度判斷，並確保移除前後空白
                errorCode: constants.ErrorCodes.VALIDATION_MESSAGE_LENGTH, 
                errorCondition: (message?.trim().length || 0) < minCharLength, 
                messageParameter: minCharLength 
            },
            { 
                errorCode: constants.ErrorCodes.VALIDATION_MESSAGE_SPAM, 
                errorCondition: utils.validation.isSpam(message) 
            },
        ]

        const error = validations.find(validation => validation.errorCondition)
        
        return {
            success: !error,
            errorCode: error?.errorCode,
            errorParameter: error?.messageParameter,
            bundle: {
                name: name,
                from_name: name,
                email: email,
                from_email: email,
                custom_subject: subject,
                message: message,
                custom_source: utils.url.getAbsoluteLocation(),
                custom_source_name: "React Portfolio"
            }
        }
    }
}

const handlers = {
    /**
     * @return {Promise<{success: (*|boolean)}>}
     */
    dummyRequest: async () => {
        await new Promise((resolve) => setTimeout(resolve, 700))
        window._dummyRequestSuccess = !window._dummyRequestSuccess

        return {
            success: window._dummyRequestSuccess
        }
    },

    /**
     * @param {Object} validationBundle
     * @param {String} publicKey
     * @param {String} serviceId
     * @param {String} templateId
     * @return {Promise<{success: boolean}>}
     */
    sendEmailRequest: async (validationBundle, publicKey, serviceId, templateId) => {
        emailjs.init(publicKey)

        const response = {success: false}

        try {
            const result = await emailjs.send(serviceId, templateId, validationBundle)
            response.success = result.status === 200
        } catch (error) {
            response.success = false
        }

        return response
    },

    /**
     * 送出資料到 n8n Webhook
     * @param {Object} validationBundle 
     * @param {String} webhookUrl n8n 的 Webhook URL
     */
    sendToN8n: async (validationBundle, webhookUrl) => {
        const response = { success: false };

        try {
            const result = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(validationBundle)
            });

            // n8n 成功接收通常會回傳 200 OK
            response.success = result.ok;
        } catch (error) {
            console.error("n8n Webhook Error:", error);
            response.success = false;
        }

        return response;
    }
}

const analytics = {
    /**
     * @description 記錄訪客資訊到 Supabase visitor_logs 資料表
     * 收集瀏覽器、OS、裝置、螢幕、來源網址、IP 地理位置等資訊
     * @returns {Promise<void>}
     */
    reportVisit: async () => {
        try {
            // ── 1. 解析 User Agent（瀏覽器 / OS / 裝置）──────────────────
            const ua = navigator.userAgent

            const getBrowser = (ua) => {
                if (/Edg\//.test(ua)) return "Edge"
                if (/OPR\/|Opera/.test(ua)) return "Opera"
                if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) return "Chrome"
                if (/Firefox\//.test(ua)) return "Firefox"
                if (/Safari\//.test(ua) && !/Chrome/.test(ua)) return "Safari"
                return "Unknown"
            }

            const getOS = (ua) => {
                if (/Windows NT/.test(ua)) return "Windows"
                if (/Mac OS X/.test(ua) && !/iPhone|iPad/.test(ua)) return "macOS"
                if (/Android/.test(ua)) return "Android"
                if (/iPhone|iPad/.test(ua)) return "iOS"
                if (/Linux/.test(ua)) return "Linux"
                return "Unknown"
            }

            const getDeviceType = (ua) => {
                if (/Mobi|Android|iPhone/.test(ua)) return "mobile"
                if (/iPad|Tablet/.test(ua)) return "tablet"
                return "desktop"
            }

            // ── 2. 取得 IP 地理位置（免費 API，不需要 key）────────────────
            let country = null
            let city = null
            let ip = null

            try {
                const geoRes = await fetch("https://ipinfo.io/json")
                const geoData = await geoRes.json()
                if (geoData.ip) {
                    ip = geoData.ip || null
                    city = geoData.city || null
                    country = geoData.country || null
                }
            } catch (_) {
                // 地理位置抓不到也沒關係，繼續寫入其他資料
            }

            // ── 3. 組合 payload ────────────────────────────────────────────
            const payload = {
                visited_at: new Date().toLocaleString("sv-SE", { timeZone: "Asia/Taipei" }).replace(" ", "T"),
                ip: ip,
                country: country,
                city: city,
                browser: getBrowser(ua),
                os: getOS(ua),
                device_type: getDeviceType(ua),
                referrer: document.referrer || null,
                page_url: window.location.href,
                screen_size: `${window.screen.width}x${window.screen.height}`
            }

            // ── 4. 寫入 Supabase ───────────────────────────────────────────
            await insertVisitorLog(payload)

        } catch (err) {
            // 追蹤失敗不影響使用者體驗，靜默處理
            console.warn("[VisitorTracker] 記錄失敗：", err)
        }
    }
}
