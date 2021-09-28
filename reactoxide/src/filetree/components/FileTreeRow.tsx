import React from 'react'
import EventEmitter from "eventemitter3";
import theme from "../theme";
import {Delete} from "./Delete"
import {Newfolder} from "./Newfolder"
import {Newfile} from "./Newfile"
import {Upload} from "./Upload"
import {Copy} from "./Copy"
import {Rename} from "./Rename"
import {Icon} from "./icon";
import {FileTreeEntry} from "../../typedefs";


type PropsFileIcon = {
    extension: string | undefined;
}

const FileIcon = (props: PropsFileIcon) => {
    const {extension} = props
    const iconnames: Record<string, any> = {
        "json": "IconJson",
        "css": "IconCss",
        "js": "IconJs",
        "htm": "IconHtml",
        "html": "IconHtml",
        "file": "IconFile",
    }

    let iconname = ((extension !== undefined) && (extension in iconnames)) ? iconnames[extension] : iconnames["file"]

    return (
        <span
            style={{
                display: 'flex',
                width: 32,
                height: 32,
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
        <Icon iconname={iconname}/>
    </span>
    )
}

type PropsFileTreeRow = {
    emitter: EventEmitter<string | symbol, any>;
    fileTreeEntry: FileTreeEntry;
    onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export const FileTreeRow = (props: PropsFileTreeRow) => {
    const {emitter, onClick, fileTreeEntry} = props
    const isDirectory = fileTreeEntry.type === "directory"
    const [getMouseOver, setMouseOver] = React.useState(false)

    const rowStyle: Record<string, any> = {
        display: "flex",
        flexDirection: "row",
        flexWrap: "nowrap",
        justifyContent: "flex-end",
        alignContent: "stretch",
        alignItems: 'flex-start',
        paddingLeft: theme.space[3] * (fileTreeEntry.depth + 1),
    }

    if (fileTreeEntry.isSelected) {
        rowStyle["backgroundColor"] = "#474757"
    }

    const MakeIcon = () => {
        if (isDirectory) {
            return (fileTreeEntry.isDirectoryOpen) ? <Icon iconname="IconOpenDirectory"/> :
                <Icon iconname="IconClosedDirectory"/>
        }
        return <FileIcon extension={fileTreeEntry.filePath.split('.').pop()}/>
    }

    return (
        <div
            className="filerow"
            onClick={onClick}
            onMouseOver={() => setMouseOver(true)}
            onMouseLeave={() => setMouseOver(false)}
            style={rowStyle}
        >
            <div style={{"flex": "0 1 auto", "alignSelf": "center", "order": 0,}}>
                <MakeIcon/>
            </div>
            <div style={{"flex": "1 1 auto", "alignSelf": "center", "order": 0,}}>
                {fileTreeEntry.filePath.split("/").pop() ?? "no filename"}
            </div>
            <div style={{"flex": "0 1 auto", "alignSelf": "center", "order": 0,}}>
            </div>
            {/* I went off the idea of implementing copy.... maybe another time */}
            {false && !isDirectory &&
                <div style={{"flex": "0 1 auto", "alignSelf": "center", "order": 0, "marginRight": "4px"}}>
                    {getMouseOver && <Copy {...{emitter, fileTreeEntry, isDirectory}}/>}
                </div>
            }
            <div style={{"flex": "0 1 auto", "alignSelf": "center", "order": 0, "marginRight": "4px"}}>
                {getMouseOver && <Upload {...{emitter, fileTreeEntry, isDirectory}}/>}
            </div>
            <div style={{"flex": "0 1 auto", "alignSelf": "center", "order": 0, "marginRight": "4px"}}>
                {getMouseOver && <Newfolder {...{emitter, fileTreeEntry, isDirectory}}/>}
            </div>
            <div style={{"flex": "0 1 auto", "alignSelf": "center", "order": 0, "marginRight": "4px"}}>
                {getMouseOver && <Newfile {...{emitter, fileTreeEntry, isDirectory}}/>}
            </div>
            <div style={{"flex": "0 1 auto", "alignSelf": "center", "order": 0, "marginRight": "12px"}}>
                {getMouseOver && <Rename {...{emitter, fileTreeEntry, isDirectory}}/>}
            </div>
            <div style={{"flex": "0 1 auto", "alignSelf": "center", "order": 0,}}>
                {getMouseOver && <Delete {...{emitter, fileTreeEntry, isDirectory}}/>}
            </div>
        </div>
    )
}
