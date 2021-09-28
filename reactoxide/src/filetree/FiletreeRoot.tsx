import React, {useEffect} from "react"
import Sidebar from "./components/sidebar"
import {FileTree} from "./components/FileTree"
import {useWebdav} from "../useWebdav"
import "./styles.css"
import {RenameModal} from "./components/RenameModal";
import EventEmitter from "eventemitter3";
import {FileTreeEntry} from "../typedefs";
import {NewfileModal} from "./components/NewfileModal";
import {NewfolderModal} from "./components/NewfolderModal";
import {UploadModal} from "./components/UploadModal";

const dummyFiles = [
    {
        containingDirectoryPath: "",
        depth: 0,
        dummy: true,
        filePath: "loading...",
        id: "",
        isDirectoryOpen: false,
        isSelected: false,
        type: "directory",
    }
]

type Props = {
    emitter: EventEmitter<string | symbol, any>;
}

export const FiletreeRoot = ({emitter}: Props) => {
    const {getDirectoryItems} = useWebdav({emitter})
    const [getFiletreeItems, setFiletreeItems] = React.useState<Array<FileTreeEntry>>(dummyFiles)

    useEffect(() => {
        setFiletreeItems(getDirectoryItems)
    }, [getDirectoryItems]);

    return (
        <div style={{"padding": "10px"}}>
            <div style={{"display": "flex", "flexDirection": "column"}}>
                <div>
                    <span style={{"fontSize": "1.1em", "fontWeight": 600, "color": "white"}}>Files</span>
                    <hr style={{"height": "3px", "backgroundColor": "#474757", "border": "0"}}/>
                </div>
                <RenameModal emitter={emitter} />
                <NewfileModal emitter={emitter} />
                <NewfolderModal emitter={emitter} />
                <UploadModal emitter={emitter}/>
                <Sidebar>
                    <FileTree
                        allFiles={getFiletreeItems}
                        emitter={emitter}
                        files={getFiletreeItems}
                    />
                </Sidebar>
            </div>
        </div>
    )
}

