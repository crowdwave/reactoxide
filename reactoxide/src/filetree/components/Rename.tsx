import React, {useState} from 'react'
import {Icon} from './icon'
import EventEmitter from "eventemitter3";
import Modal from "react-bootstrap/Modal";
import Button from 'react-bootstrap/Button';
import {RenameModal} from "./RenameModal";
import {FileTreeEntry} from "../../typedefs";

type Props = {
    emitter: EventEmitter<string | symbol, any>;
    fileTreeEntry: FileTreeEntry;
}

export const Rename = (props: Props) => {
    const {emitter, fileTreeEntry} = props;

    const onClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        // if we don't stop propagation then the click event goes to the file and tries to load it
        e.stopPropagation()
        emitter.emit("SHOW_RENAME_MODAL", fileTreeEntry)
    }

    return (
        <>
            <Icon iconname="IconRename" tooltip="rename" onClick={onClick}/>
        </>
    )
}

