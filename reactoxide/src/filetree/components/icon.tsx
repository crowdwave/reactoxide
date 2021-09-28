import React from 'react'

// fontawesome icons in svg format: https://github.com/Rush/Font-Awesome-SVG-PNG
// https://github.com/feathericons/feather

type WrapperProps = {
    onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    color?: string;
    hoverColor?: string;
    width?: number;
    height?: number;
    iconname: string;
    tooltip?: string | undefined;
}

type IconProps = {
    getMouseOver?: boolean;
    color?: string;
    hoverColor?: string;
    width?: number;
    height?: number;
}

export const Icon: React.FC<WrapperProps> = ({
                                                 onClick = () => {
                                                 },
                                                 color = "#c4c4c4",
                                                 hoverColor = "#00ff00",
                                                 width = 20,
                                                 height = 20,
                                                 tooltip = undefined,
                                                 ...props
                                             }) => {
    const [getMouseOver, setMouseOver] = React.useState(false)

    const iconProps = {width, height, hoverColor, color, getMouseOver}

    return (
        <div
            title={tooltip}
            onClick={onClick}
            onMouseOver={() => setMouseOver(true)}
            onMouseLeave={() => setMouseOver(false)}
        >
            {(props.iconname === "IconQuestionmark") && <IconQuestionmark {...iconProps}/>}
            {(props.iconname === "IconUpload") && <IconUpload {...iconProps}/>}
            {(props.iconname === "IconCopy") && <IconCopy {...iconProps}/>}
            {(props.iconname === "IconRename") && <IconRename {...iconProps}/>}
            {(props.iconname === "IconDelete") && <IconDelete {...iconProps}/>}
            {(props.iconname === "IconNewfile") && <IconNewfile {...iconProps}/>}
            {(props.iconname === "IconNewfolder") && <IconNewfolder {...iconProps}/>}
            {(props.iconname === "IconClosedDirectory") && <IconClosedDirectory {...iconProps}/>}
            {(props.iconname === "IconOpenDirectory") && <IconOpenDirectory {...iconProps}/>}
            {(props.iconname === "IconJs") && <IconJs {...iconProps}/>}
            {(props.iconname === "IconCss") && <IconCss {...iconProps}/>}
            {(props.iconname === "IconJson") && <IconJson {...iconProps}/>}
            {(props.iconname === "IconHtml") && <IconHtml {...iconProps}/>}
            {(props.iconname === "IconFile") && <IconFile {...iconProps}/>}
        </div>
    )
}

export const IconDelete = (props: IconProps) => (
    <svg width={props.width} height={props.height} viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M1277 1122q0-26-19-45l-181-181 181-181q19-19 19-45 0-27-19-46l-90-90q-19-19-46-19-26 0-45 19l-181 181-181-181q-19-19-45-19-27 0-46 19l-90 90q-19 19-19 46 0 26 19 45l181 181-181 181q-19 19-19 45 0 27 19 46l90 90q19 19 46 19 26 0 45-19l181-181 181 181q19 19 45 19 27 0 46-19l90-90q19-19 19-46zm387-226q0 209-103 385.5t-279.5 279.5-385.5 103-385.5-103-279.5-279.5-103-385.5 103-385.5 279.5-279.5 385.5-103 385.5 103 279.5 279.5 103 385.5z"
            fill={(props.getMouseOver) ? props.hoverColor : props.color}
        />
    </svg>
)

export const IconRename = (props: IconProps) => (
    <svg width={props.width} height={props.height} viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M491 1536l91-91-235-235-91 91v107h128v128h107zm523-928q0-22-22-22-10 0-17 7l-542 542q-7 7-7 17 0 22 22 22 10 0 17-7l542-542q7-7 7-17zm-54-192l416 416-832 832h-416v-416zm683 96q0 53-37 90l-166 166-416-416 166-165q36-38 90-38 53 0 91 38l235 234q37 39 37 91z"
            fill={(props.getMouseOver) ? props.hoverColor : props.color}
        />
    </svg>
)

// source: https://raw.githubusercontent.com/feathericons/feather/master/icons/file-plus.svg
export const IconNewfile = (props: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={props.width}
        height={props.height}
        viewBox="0 0 24 24"
        fill="none"
        stroke={(props.getMouseOver) ? props.hoverColor : props.color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="12" y1="18" x2="12" y2="12"/>
        <line x1="9" y1="15" x2="15" y2="15"/>
    </svg>
)

// source: https://raw.githubusercontent.com/feathericons/feather/master/icons/folder-plus.svg
export const IconNewfolder = (props: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={props.width}
        height={props.height}
        viewBox="0 0 24 24"
        fill="none"
        stroke={(props.getMouseOver) ? props.hoverColor : props.color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        <line x1="12" y1="11" x2="12" y2="17"/>
        <line x1="9" y1="14" x2="15" y2="14"/>
    </svg>
)


export const IconQuestionmark = (props: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={props.width}
        height={props.height}
        viewBox="0 0 5000 5000"
        fill="none"
        stroke={(props.getMouseOver) ? props.hoverColor : props.color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <circle cx="2500" cy="2500" r="2500" fill={(props.getMouseOver) ? props.hoverColor : props.color}/>
        <g id="f67e395f-30cf-4d34-b795-7406cd3cb388" data-name="Icon">
            <path
                d="M2536.78,647C1796.08,647,1318,1140.77,1234,1855.2l725,105.06c21-309.93,141.82-661.9,514.81-661.9,262.65,0,436,162.86,436,425.51,0,236.39-120.83,357.2-299.43,488.54-457,336.2-472.79,409.76-472.79,971.85v99.81h677.66c-10.5-373,78.79-425.51,367.72-614.63C3519.11,2448.8,3766,2144.13,3766,1723.87,3766,1035.71,3177.66,647,2536.78,647ZM2092.77,4253h774V3463.15h-774Z"
                fill="#000000"/>
        </g>
    </svg>
)

// source: https://raw.githubusercontent.com/feathericons/feather/master/icons/upload.svg
export const IconUpload = (props: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={props.width}
        height={props.height}
        viewBox="0 0 24 24"
        fill="none"
        stroke={(props.getMouseOver) ? props.hoverColor : props.color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>

)

// source: https://raw.githubusercontent.com/feathericons/feather/master/icons/copy.svg
export const IconCopy = (props: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={props.width}
        height={props.height}
        viewBox="0 0 24 24"
        fill="none"
        stroke={(props.getMouseOver) ? props.hoverColor : props.color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>

)

export const IconClosedDirectory = (props: IconProps) => (
    <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M15.6674 9.70666L15.8096 9.83333H16H26C26.2761 9.83333 26.5 10.0572 26.5 10.3333V25C26.5 25.2761 26.2761 25.5 26 25.5H6C5.72386 25.5 5.5 25.2761 5.5 25V8C5.5 7.72386 5.72386 7.5 6 7.5H13.0001C13.1228 7.5 13.2411 7.54508 13.3327 7.62667L15.6674 9.70666Z"
            fill="#64D2FF"
            stroke="#64D2FF"
        />
    </svg>
)

export const IconOpenDirectory = (props: IconProps) => (
    <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M15.6674 9.70666L15.8096 9.83333H16H26C26.2761 9.83333 26.5 10.0572 26.5 10.3333V25C26.5 25.2761 26.2761 25.5 26 25.5H6C5.72386 25.5 5.5 25.2761 5.5 25V8C5.5 7.72386 5.72386 7.5 6 7.5H13.0001C13.1228 7.5 13.2411 7.54508 13.3327 7.62667L15.6674 9.70666Z"
            fill="transparent"
            stroke="#64D2FF"
        />
    </svg>
)

export const IconJs = (props: IconProps) => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="m3 3h18v18h-18v-18m4.73 15.04c.4.85 1.19 1.55 2.54 1.55 1.5 0 2.53-.8 2.53-2.55v-5.78h-1.7v5.74c0 .86-.35 1.08-.9 1.08-.58 0-.82-.4-1.09-.87l-1.38.83m5.98-.18c.5.98 1.51 1.73 3.09 1.73 1.6 0 2.8-.83 2.8-2.36 0-1.41-.81-2.04-2.25-2.66l-.42-.18c-.73-.31-1.04-.52-1.04-1.02 0-.41.31-.73.81-.73.48 0 .8.21 1.09.73l1.31-.87c-.55-.96-1.33-1.33-2.4-1.33-1.51 0-2.48.96-2.48 2.23 0 1.38.81 2.03 2.03 2.55l.42.18c.78.34 1.24.55 1.24 1.13 0 .48-.45.83-1.15.83-.83 0-1.31-.43-1.67-1.03l-1.38.8z"
            fill="#ffca28"
        />
    </svg>
)

export const IconCss = (props: IconProps) => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="m5 3l-.65 3.34h13.59l-.44 2.16h-13.58l-.66 3.33h13.59l-.76 3.81-5.48 1.81-4.75-1.81.33-1.64h-3.34l-.79 4 7.85 3 9.05-3 1.2-6.03.24-1.21 1.54-7.76h-16.94z"
            fill="#42a5f5"
        />
    </svg>
)

export const IconJson = (props: IconProps) => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="m5 3h2v2h-2v5a2 2 0 0 1 -2 2 2 2 0 0 1 2 2v5h2v2h-2c-1.07-.27-2-.9-2-2v-4a2 2 0 0 0 -2 -2h-1v-2h1a2 2 0 0 0 2 -2v-4a2 2 0 0 1 2 -2m14 0a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1v2h-1a2 2 0 0 0 -2 2v4a2 2 0 0 1 -2 2h-2v-2h2v-5a2 2 0 0 1 2 -2 2 2 0 0 1 -2 -2v-5h-2v-2h2m-7 12a1 1 0 0 1 1 1 1 1 0 0 1 -1 1 1 1 0 0 1 -1 -1 1 1 0 0 1 1 -1m-4 0a1 1 0 0 1 1 1 1 1 0 0 1 -1 1 1 1 0 0 1 -1 -1 1 1 0 0 1 1 -1m8 0a1 1 0 0 1 1 1 1 1 0 0 1 -1 1 1 1 0 0 1 -1 -1 1 1 0 0 1 1 -1z"
            fill="#fbc02d"
        />
    </svg>
)

export const IconHtml = (props: IconProps) => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="m12 17.56l4.07-1.13.55-6.1h-7.24l-.18-2.03h7.6l.2-1.99h-10l.56 6.01h6.89l-.23 2.58-2.22.6-2.22-.6-.14-1.66h-2l.29 3.19 4.07 1.13m-7.93-14.56h15.86l-1.43 16.2-6.5 1.8-6.5-1.8-1.43-16.2z"
            fill="#e44d26"
        />
    </svg>
)

export const IconFile = (props: IconProps) => (
    <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <mask id="path-1-inside-1">
            <path
                d="M16.5689 5H9C8.44772 5 8 5.44772 8 6V26C8 26.5523 8.44772 27 9 27H23C23.5523 27 24 26.5523 24 26V12.1587L16.5689 5ZM16 6L23 13H16V6Z"/>
        </mask>
        <path
            d="M16.5689 5H9C8.44772 5 8 5.44772 8 6V26C8 26.5523 8.44772 27 9 27H23C23.5523 27 24 26.5523 24 26V12.1587L16.5689 5ZM16 6L23 13H16V6Z"
            fill="#eee"
        />
        <path
            d="M16.0689 5V6.56889H17.0689V5H16.0689ZM22.1587 12.6587H24V11.6587H22.1587V12.6587ZM16.5689 5L17.2627 4.27982L16.9722 4H16.5689V5ZM24 12.1587H25V11.7335L24.6938 11.4385L24 12.1587ZM23 13V14H25.4142L23.7071 12.2929L23 13ZM16 6L16.7071 5.29289L15 3.58579V6H16ZM16 13H15V14H16V13ZM9 6H16.5689V4H9V6ZM9 6L9 6V4C7.89543 4 7 4.89543 7 6H9ZM9 26V6H7V26H9ZM9 26H7C7 27.1046 7.89543 28 9 28V26ZM23 26H9V28H23V26ZM23 26V28C24.1046 28 25 27.1046 25 26H23ZM23 12.1587V26H25V12.1587H23ZM15.8751 5.72018L23.3062 12.8789L24.6938 11.4385L17.2627 4.27982L15.8751 5.72018ZM23.7071 12.2929L16.7071 5.29289L15.2929 6.70711L22.2929 13.7071L23.7071 12.2929ZM16 14H23V12H16V14ZM15 6V13H17V6H15Z"
            fill="#eee"
            mask="url(#path-1-inside-1)"
        />
    </svg>
)
