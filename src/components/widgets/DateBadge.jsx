import "./DateBadge.scss"
import React, {useEffect, useState} from 'react'
import InfoBadge from "/src/components/generic/InfoBadge.jsx"
import {useLanguage} from "/src/providers/LanguageProvider.jsx" // 1. 引入語系鉤子

function DateBadge({ dateStart, dateEnd, variant = "default", className = "" }) {
    const language = useLanguage() // 2. 使用語系鉤子
    const isPresent = !dateEnd || dateEnd === "null" || dateEnd === "date.null";
    const finalDateEnd = isPresent ? language.getString("current") : dateEnd;

    return (
        <div className={`date-badge-wrapper date-badge-wrapper-${variant} ${className}`}>
            <InfoBadge className={`date-badge w-100`}
                       faIcon={`fa-regular fa-calendar`}>
                {/* 1. 開始日期 */}
                {dateStart && (
                    <span className={``}
                          dangerouslySetInnerHTML={{__html: dateStart}}/>
                )}
                {/* 2. 箭頭：只要有開始日期，就應該顯示箭頭（因為我們現在要支援 "至今"） */}
                {(dateStart && dateEnd) && (
                    <i className={`fa-solid fa-arrow-right-long mx-2 opacity-75`}/>
                )}
                {/* 3. 結束日期：如果有值就顯示值，沒值就顯示預設文字 
                {dateEnd && (
                    <span className={``}
                          dangerouslySetInnerHTML={{__html: dateEnd}}/>
                )}
                */}
                <span dangerouslySetInnerHTML={{__html: finalDateEnd}}/>
                


            </InfoBadge>
        </div>
    )
}

DateBadge.Variants = {
    DEFAULT: "default",
    TRANSPARENT: "transparent",
}

export default DateBadge