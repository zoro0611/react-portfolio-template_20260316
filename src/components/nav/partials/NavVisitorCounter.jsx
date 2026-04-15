import "./NavVisitorCounter.scss"
import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import NumberAnimation from '/src/components/generic/NumberAnimation.jsx'
import VisitorStatsModal from '/src/components/modals/VisitorStatsModal.jsx'
import { useVisitorStats } from '/src/hooks/useVisitorStats.js'

function NavVisitorCounter({ expanded }) {
    const { stats, loading } = useVisitorStats()
    const [showModal, setShowModal] = useState(false)

    if (!expanded || loading || !stats) return null

    return (
        <>
            <div className="nav-visitor-counter" onClick={() => setShowModal(true)}>
                <i className="fa-regular fa-eye"/>
                <NumberAnimation id="visitor-counter-badge"
                                 targetValue={stats.total}
                                 format="{n} visits"/>
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
