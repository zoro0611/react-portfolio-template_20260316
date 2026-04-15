import "./NavVisitorCounter.scss"
import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import NumberAnimation from '/src/components/generic/NumberAnimation.jsx'
import VisitorStatsModal from '/src/components/modals/VisitorStatsModal.jsx'
import { useVisitorStats } from '/src/hooks/useVisitorStats.js'
import { useLanguage } from '/src/providers/LanguageProvider.jsx'

function NavVisitorCounter({ expanded }) {
    const language = useLanguage()
    const { stats, loading } = useVisitorStats()
    const [showModal, setShowModal] = useState(false)

    if (!expanded || loading || !stats) return null

    return (
        <>
            <div className="nav-visitor-counter" onClick={() => setShowModal(true)}>
                <i className="fa-regular fa-eye"/>
                <NumberAnimation id="visitor-counter-badge"
                                 targetValue={stats.total}
                                 format={language.getString("visitor_stats_badge_format")}/>
                <i className="fa-solid fa-chevron-right nav-visitor-counter-arrow"/>
            </div>

            {showModal && ReactDOM.createPortal(
                <VisitorStatsModal stats={stats} onDismiss={() => setShowModal(false)}/>,
                document.body
            )}
        </>
    )
}

export default NavVisitorCounter
