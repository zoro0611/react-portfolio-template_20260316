import "./VisitorStatsModal.scss"
import React, { useState } from 'react'
import { ModalWrapper, ModalWrapperTitle, ModalWrapperBody } from '/src/components/modals/base/ModalWrapper'
import NumberAnimation from '/src/components/generic/NumberAnimation.jsx'
import { useLanguage } from '/src/providers/LanguageProvider.jsx'

function VisitorStatsModal({ stats, onDismiss }) {
    const language = useLanguage()
    const [shouldDismiss, setShouldDismiss] = useState(false)

    const total = stats?.total || 0
    const byCountry = stats?.by_country || []

    const _onClose = () => setShouldDismiss(true)

    const getCountryName = (code) => {
        if (!code || code === '—') return language.getString("visitor_stats_unknown")
        try {
            const locale = language.selectedLanguageId === 'zh' ? 'zh-TW' : (language.selectedLanguageId || 'en')
            const displayNames = new Intl.DisplayNames([locale], { type: 'region' })
            return displayNames.of(code.toUpperCase()) || code
        } catch {
            return code
        }
    }

    const FlagImage = ({ code }) => {
        if (!code || code === '—') return <span style={{ fontSize: '1rem', lineHeight: 1 }}>🌐</span>
        return (
            <img
                src={`https://flagcdn.com/20x15/${code.toLowerCase()}.png`}
                srcSet={`https://flagcdn.com/40x30/${code.toLowerCase()}.png 2x`}
                width="20"
                height="15"
                alt={code}
                style={{ objectFit: 'cover', borderRadius: '2px', display: 'block' }}
            />
        )
    }

    return (
        <ModalWrapper id="visitor-stats-modal"
                      shouldDismiss={shouldDismiss}
                      onDismiss={onDismiss}
                      dialogClassName="modal-dialog-centered">
            <ModalWrapperTitle title={language.getString("visitor_stats")}
                               faIcon="fa-regular fa-eye"
                               onClose={_onClose}/>
            <ModalWrapperBody className="visitor-stats-modal-body">
                <div className="visitor-stats-total">
                    <i className="fa-regular fa-user visitor-stats-total-icon"/>
                    <NumberAnimation id="visitor-stats-total"
                                     targetValue={total}
                                     className="visitor-stats-total-number"/>
                    <span className="visitor-stats-total-label">{language.getString("visitor_stats_total_label")}</span>
                </div>

                {byCountry.length > 0 && (
                    <div className="visitor-stats-table">
                        {byCountry.map(({ country, count }) => {
                            const pct = Math.round(count / total * 100)
                            return (
                                <div key={country} className="visitor-stats-row">
                                    <span className="visitor-stats-flag"><FlagImage code={country}/></span>
                                    <span className="visitor-stats-country">{getCountryName(country)}</span>
                                    <div className="visitor-stats-bar-wrap">
                                        <div className="visitor-stats-bar" style={{ width: `${pct}%` }}/>
                                    </div>
                                    <span className="visitor-stats-count">{count}</span>
                                    <span className="visitor-stats-pct">{pct}%</span>
                                </div>
                            )
                        })}
                    </div>
                )}
            </ModalWrapperBody>
        </ModalWrapper>
    )
}

export default VisitorStatsModal
