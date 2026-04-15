/**
 * @description Supabase 連線設定
 * 請將下方的 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY
 * 填入你自己的 Supabase 專案資訊（在 .env 檔案中設定）
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * 直接用 fetch 呼叫 Supabase REST API，不需要安裝 @supabase/supabase-js
 * @param {Object} payload 要寫入的資料
 * @returns {Promise<{success: boolean, error: any}>}
 */
export const insertVisitorLog = async (payload) => {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/visitor_logs`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                "Prefer": "return=minimal"
            },
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.warn("[VisitorTracker] Supabase 寫入失敗：", errorText)
            return { success: false, error: errorText }
        }

        return { success: true }
    } catch (err) {
        console.warn("[VisitorTracker] 網路錯誤：", err)
        return { success: false, error: err }
    }
}
