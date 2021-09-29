import React, {useEffect, useRef, useState} from "react";
import Editor, {useMonaco} from "@monaco-editor/react";
import EventEmitter from "eventemitter3";
import * as monaco from 'monaco-editor'
import {BufferLike, ResponseDataDetailed} from "webdav/web";
import {Uri} from "monaco-editor";
import {isBinaryJs, getEncodingJs} from './textorbinary'
import isEqual from 'lodash/isEqual';
import {FileTreeEntry, SaveFileArgs} from "../typedefs";

type Monaco = typeof monaco
type MonacoTheme = monaco.editor.IStandaloneThemeData
type MonacoEditor = monaco.editor.IStandaloneCodeEditor
type MonacoEditorOptions = monaco.editor.IStandaloneEditorConstructionOptions

type Props = {
    emitter: EventEmitter<string | symbol, any>;
    setOpenFiles: React.Dispatch<React.SetStateAction<string[]>>;
    getOpenFiles: string[];
}

type loadFileResult = {
    filename: string,
    response: Buffer | ArrayBuffer | string | ResponseDataDetailed<BufferLike | string>,
}

export const MultiFileEditor = ({emitter, setOpenFiles, getOpenFiles}: Props) => {
    const editorRef = useRef<MonacoEditor>();
    const monacoRef = useRef<Monaco>();
    const [getRerender, setRerender] = useState(false);
    const [isEditorReady, setIsEditorReady] = useState(false);
    const [getCurrentModel, setCurrentModel] = useState<Uri>();

    useEffect(() => {
        const handleFileLoaded = (data: loadFileResult) => {
            const qbuffer = Buffer.from(data.response);
            if (isBinaryJs(qbuffer)) {
                alert("file is binary so cannot be edited")
                return
            }
            const encoding = getEncodingJs(qbuffer)
            // The decode() method takes a DataView as a parameter, which is a wrapper on top of the ArrayBuffer.
            var dataView = new DataView(data.response as ArrayBuffer);
            // The TextDecoder interface is documented at http://encoding.spec.whatwg.org/#interface-textdecoder
            var decoder = new TextDecoder(encoding);
            var decodedString = decoder.decode(dataView);
            setCurrentModel(monaco.Uri.file(data.filename))
            // How to dynamically set language according to file extension in monaco editor?
            // https://stackoverflow.com/a/57074528/627492
            if (!!monacoRef.current && !!monacoRef.current.editor) {
                monacoRef.current.editor.createModel(
                    decodedString,
                    undefined, // language
                    monaco.Uri.file(data.filename) // uri
                )
                setCurrentModel(monaco.Uri.file(data.filename))
            }
        }
        emitter.addListener("ON_FILE_LOADED", handleFileLoaded)
        return () => {
            emitter.removeListener("ON_FILE_LOADED", handleFileLoaded)
        }
    }, [emitter])

    function handleEditorWillMount(monaco: Monaco) {
        // here is the monaco instance
        // do something before editor is mounted
        monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
    }

    function handleEditorDidMount(editor: MonacoEditor, monaco: Monaco) {
        // here is another way to get monaco instance
        // you can also store it in `useRef` for further usage
        monacoRef.current = monaco;
        editorRef.current = editor;
        // clear existing models
        monacoRef.current.editor.getModels().forEach(model => model.dispose());
        //monacoRef.current.editor.createModel(indexMD, "markdown", "urn:index.md");
        //monacoRef.current.editor.createModel(indexCSS, "css", "urn:index.css");
        monacoRef.current.languages.typescript.javascriptDefaults.setEagerModelSync(
            true
        );
        setIsEditorReady(true);
    }

    useEffect(() => {
        const handleOnSelectFile = (filename: string | undefined) => {
            alert("dead code?")
            if (filename === undefined) {
                // no file is selected - this happens for example when a file is deleted
                return
            }

            if (monacoRef.current === undefined) return
            // if there's no current model then load
            if (getCurrentModel === undefined) {
                emitter.emit("DO_LOAD_FILE", filename)
                return
            }

            const found = monacoRef.current.editor.getModels().find(
                (model) => {
                    //return model.uri.path === getSelectedTab
                    return model.uri.path === filename
                }
            )

            // if this file is already loaded in the editor, set as selected file else load file
            if (found === undefined) {
                emitter.emit("DO_LOAD_FILE", filename)
            } else {
                //setSelectedTab(filename)
                setCurrentModel(monaco.Uri.file(filename))
            }
        }
        emitter.addListener("ON_SELECT_FILE", handleOnSelectFile)
        return () => {
            emitter.removeListener("ON_SELECT_FILE", handleOnSelectFile)
        }
    }, [emitter, getCurrentModel])


    useEffect(() => {
        // ensure getCurrentModel is valid
        // set the current model/tab to the first model
        if (monacoRef.current === undefined) return

        // if undefined, set to first model
        if (getCurrentModel === undefined) {
            monacoRef.current.editor.getModels().forEach((model) => {
                setCurrentModel(model.uri)
            })
            return
        }

        // check if getCurrentModel is in the models
        const found = monacoRef.current.editor.getModels().find(
            (model) => {
                return model.uri.path === getCurrentModel.path
            }
        )

        // if not found then getCurrentModel is no longer valid, set it to the first model
        if (!found) {
            monacoRef.current.editor.getModels().forEach((model) => {
                setCurrentModel(model.uri)
            })
        }
    }, [getCurrentModel])


    useEffect(() => {
        // when a file is deleted we close any tab that contains that file
        // when a directory is deleted we close any tab that contains a file below that directory

        const closeTabsOfDeletedFiles = async (fileTreeEntry: FileTreeEntry) => {
            if (monacoRef.current === undefined) return

            // close tabs of the file or the directory
            monacoRef.current.editor.getModels().forEach((model) => {
                if (model.uri.path === fileTreeEntry.filePath) {
                    if (getCurrentModel !== undefined) {
                        if (model.uri.path === getCurrentModel.path) {
                            setCurrentModel(undefined)
                        }
                    }
                    model.dispose()
                }
                if (fileTreeEntry.type === "directory") {
                    if (model.uri.path.startsWith(`${fileTreeEntry.filePath}/`)) {
                        /*                       if (getCurrentModel !== undefined) {
                                                    if (model.uri.path === getCurrentModel.path) {
                                                        setCurrentModel(undefined)
                                                    }
                                                }*/
                        model.dispose()
                    }
                }
                setRerender((prev) => !prev)
            });

        }
        emitter.addListener("ON_FILE_OR_DIRECTORY_DELETED", closeTabsOfDeletedFiles)
        return () => {
            emitter.removeListener("ON_FILE_OR_DIRECTORY_DELETED", closeTabsOfDeletedFiles)
        }
    }, [emitter, getCurrentModel])

    useEffect(() => {
        if (getCurrentModel === undefined) return
        if (!isEditorReady) return
        if (editorRef.current === undefined) return
        if (monacoRef.current === undefined) return
        editorRef.current.setModel(monacoRef.current.editor.getModel(getCurrentModel))
    }, [isEditorReady, getCurrentModel]);

    let openFiles: string[] = [];
    if (!!monacoRef.current) {
        for (const item of monacoRef.current.editor.getModels()) {
            openFiles.push(item.uri.path)
        }
    }
    useEffect(() => {
        if (getCurrentModel === undefined) return
        if (!isEditorReady) return
        if (editorRef.current === undefined) return
        if (monacoRef.current === undefined) return
        // update parent component state holding open files
        setOpenFiles((prev) => {
            if (!isEqual(prev, openFiles)) {
                emitter.emit("ON_OPEN_FILES_CHANGED", openFiles)
                return openFiles
            } else {
                return prev
            }
        })
    }, [setOpenFiles, getOpenFiles, openFiles, emitter]);

    const doSave = () => {
        if (!!getCurrentModel) {
            if (!!monacoRef.current) {
                if (!!monacoRef.current.editor) {
                    const model = monacoRef.current.editor.getModel(getCurrentModel)
                    if (!!model) {
                        const args: SaveFileArgs = {
                            filepath: getCurrentModel.path,
                            data: model.getValue(),
                        }
                        emitter.emit("DO_SAVE_FILE", args)
                        console.log("done")
                    }
                }
            }
        }
    }

    const closeTab = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>, itemUriPath: string) => {
        // if we don't stop propagation then the click event goes to the file and sets it as the currentModel
        e.stopPropagation()
        if (monacoRef.current === undefined) return
        if (getCurrentModel !== undefined) {
            if (itemUriPath === getCurrentModel.path) {
                setCurrentModel(undefined)
            }
        }
        monacoRef.current.editor.getModels().forEach((model) => {
            console.log("model")
            console.log(model)

            if (model.uri.path === itemUriPath) {
                model.dispose()
            }
            setRerender((prev) => !prev)
        });
    }

    const Tabs = () => {
        let rv = []
        if (monacoRef.current === undefined) return null
        if (getCurrentModel === undefined) return null
        for (const item of monacoRef.current.editor.getModels()) {
            if (item.uri !== undefined) {

                // these three lines determine if the same file name with a different path is open
                // if so, then we display the3 full path.  if not, then we display only the filename on the tab.
                let filenameToDisplay: string = item.uri.path.split("/").pop() ?? ""
                const found = getOpenFiles.filter((filename) => filenameToDisplay === filename.split("/").pop())
                if (found.length > 1) {
                    filenameToDisplay = item.uri.path
                }

                rv.push(
                    <li key={item.uri.toString()}
                        className="nav-item"
                        style={{
                            "borderRadius": 0,
                            "borderTop": `4px solid ${(item.uri.path === getCurrentModel.path) ? " #5bc0de" : " lightgray"}`,
                            "marginRight": "10px",
                            "marginTop": "10px",
                        }}>
                        <a className={`nav-link ${(item.uri.path === getCurrentModel.path) && "active"}`}
                           style={{"borderRadius": 0}}
                           data-bs-toggle="tab"
                           onClick={() => setCurrentModel(monaco.Uri.file(item.uri.path))}
                           >
                            {filenameToDisplay}
                            <span
                                className="close"
                                style={{
                                    "marginLeft": "24px",
                                    "marginRight": "8px",
                                    "fontWeight": "bolder",
                                    "color": "gray",
                                }}
                                onClick={(e) => closeTab(e, item.uri.path)}
                                onMouseOver={(e) => e.currentTarget.style.color = "white"}
                                onMouseOut={(e) => e.currentTarget.style.color = "gray"}
                            >X</span>
                        </a>
                    </li>
                )
            }
        }
        return (
            <ul className="nav nav-tabs p2" style={{"paddingLeft": "10px"}}>
                {rv}
            </ul>
        )
    }

    console.log("getCurrentModel")
    console.log(getCurrentModel)
    return (
        <div>
            {(getCurrentModel) &&
            <>
                <style>
                    {`
                        .smallbutton {
                            background-color: #444857;
                            border-radius: 2px;
                            border-style: dotted;
                            border-width: 1px;
                            color: #cccccc;
                            cursor: pointer;
                            display: inline-block;
                            font-size: 1em;
                            font-weight: normal !important;
                            line-height: 1.2;
                            margin: 0 3px 0 0;
                            padding: 2px 7px;
                            position: relative;
                            text-align: center;
                            text-decoration: none !important;
                            text-overflow: ellipsis;
                            text-shadow: none;
                            white-space: nowrap;
                            }
                        .smallbutton:hover {
                            background-color: #5c5e73;
                            color: white;
                            }
                    `}
                </style>
                <div>
                    <Tabs/>
                </div>
                {!!getCurrentModel &&
                <div style={{
                    "backgroundColor": "#343539",
                    "padding": "4px",
                    "paddingLeft": "10px",
                    "color": "white",
                }}>
                    <button
                        style={{
                            "lineHeight": 1,
                        }}
                        onClick={doSave}
                        className="btn btn-success">Save
                    </button>
                    &nbsp;&nbsp;&nbsp;
                    {getCurrentModel.path}
                </div>
                }
            </>
            }
            <Editor
                options={{"fontSize": 16}}
                height="80vh"
                theme="vs-dark"
                beforeMount={handleEditorWillMount}
                onMount={handleEditorDidMount}/>
        </div>
    );
}

