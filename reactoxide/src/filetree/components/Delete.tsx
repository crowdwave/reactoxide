import React, {useState} from 'react'
import {Icon} from './icon'
import EventEmitter from "eventemitter3";
import {FileTreeEntry} from "../../typedefs";

type Props = {
    emitter: EventEmitter<string | symbol, any>;
    fileTreeEntry: FileTreeEntry;
}

export const Delete = (props: Props) => {
    const {emitter, fileTreeEntry} = props;
    const [getClickedOnce, setClickedOnce] = useState<boolean>(false);

    const onSecondClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        // if we don't stop propagation then the click event goes to the file and tries to load it
        e.stopPropagation()
        emitter.emit("DO_DELETE_FILE_OR_DIRECTORY", fileTreeEntry)
    }

    const onFirstClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        // if we don't stop propagation then the click event goes to the file and tries to load it
        e.stopPropagation()
        setClickedOnce((prev) => !prev)
    }

    if (getClickedOnce) {
        return <Icon iconname="IconQuestionmark" tooltip="confirm delete" onClick={onSecondClick} color="#FFFF00" hoverColor="#FFFF00"/>
    } else {
        return <Icon iconname="IconDelete" tooltip="delete" onClick={onFirstClick} hoverColor="#ff0000"/>
   }
}
